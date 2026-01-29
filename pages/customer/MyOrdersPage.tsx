import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrdersByCodes } from '../../services/db';

import { Order } from '../../types';
import { ORDER_STATUS_COLORS } from '../../constants';
import Button from '../../components/Button';
import { Package, Clock, ChevronRight, Plus } from 'lucide-react';

const MyOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);



  useEffect(() => {
    const fetchOrders = async () => {
      const savedCodesStr = localStorage.getItem('my_order_codes');
      if (savedCodesStr) {
        try {
          const codes = JSON.parse(savedCodesStr);
          const myOrders = await getOrdersByCodes(codes);
          // Sort by recent first
          setOrders(myOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } catch (error) {
          console.error("Error fetching my orders:", error);
        }
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, []);

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <Package className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No tienes pedidos recientes</h2>
        <p className="text-gray-500 mb-8">Tus pedidos aparecerán aquí una vez que realices una compra.</p>
        <Link to="/menu">
          <Button>Ir al Menú</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mis Pedidos</h1>
        <Link to="/menu">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nuevo Pedido
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {orders.map(order => (
          <Link key={order.id} to={`/order/${order.code}`} className="block group">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between sm:items-center gap-4">

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-blue-700 text-lg">#{order.code}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${ORDER_STATUS_COLORS[order.status]}`}>
                    {order.status}
                  </span>
                </div>

                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(order.createdAt).toLocaleDateString()} a las {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div className="text-gray-900 font-medium">
                  {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'} • Total: ${order.total}
                </div>
              </div>

              <div className="flex items-center text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
                Ver Detalles <ChevronRight className="w-5 h-5 ml-1" />
              </div>

            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MyOrdersPage;