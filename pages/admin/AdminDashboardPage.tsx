import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '../../store/AdminAuth';
import { getOrders, updateOrderStatus } from '../../services/db';
import { Order, OrderStatus } from '../../types';
import { ORDER_STATUS_COLORS } from '../../constants';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { Grid, Layers, Calendar, Settings, RefreshCw, LogOut, Eye } from 'lucide-react';

const AdminDashboardPage: React.FC = () => {
  const { isAuthenticated, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    loadOrders();
    const interval = setInterval(loadOrders, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [isAuthenticated, navigate]);

  const loadOrders = async () => {
    try {
      const allOrders = await getOrders();
      // Sort by recent
      setOrders(allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      console.error("Error loading orders:", err);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus);
    await loadOrders();
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Pedidos</h1>
          <p className="text-gray-500">Administra el flujo de pedidos en tiempo real.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/admin/products">
            <Button variant="outline" className="flex items-center gap-2">
              <Grid className="w-4 h-4" /> Productos
            </Button>
          </Link>
          <Link to="/admin/extras">
            <Button variant="outline" className="flex items-center gap-2">
              <Layers className="w-4 h-4" /> Extras
            </Button>
          </Link>
          <Link to="/admin/history">
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Historial
            </Button>
          </Link>
          <Link to="/admin/settings">
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="w-4 h-4" /> Configuración
            </Button>
          </Link>
          <Button variant="secondary" onClick={loadOrders} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Actualizar
          </Button>
          <Button variant="danger" onClick={logout} className="flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Salir
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                <th className="p-4">Código</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Hora Pickup</th>
                <th className="p-4">Total</th>
                <th className="p-4">Estatus</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="p-4 font-mono font-bold text-blue-800">{order.code}</td>
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{order.customerName}</div>
                    <div className="text-xs text-gray-500">{order.customerPhone}</div>
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-900">{order.pickupTime}</td>
                  <td className="p-4 font-bold text-gray-900">${order.total}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${ORDER_STATUS_COLORS[order.status] || 'bg-gray-100'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openOrderDetails(order)}
                        className="p-2 text-gray-500 hover:bg-gray-200 rounded-lg"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-1"
                      >
                        {Object.values(OrderStatus).map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No hay pedidos registrados aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Detalle Pedido #${selectedOrder?.code}`}
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Customer Details Grid */}
            <div className="bg-gray-50 p-4 rounded-lg text-sm grid grid-cols-2 gap-4 border border-gray-100">
              <div>
                <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Cliente</span>
                <span className="block font-medium text-gray-900">{selectedOrder.customerName}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Teléfono</span>
                <span className="block font-medium text-gray-900">{selectedOrder.customerPhone}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Hora Pickup</span>
                <span className="block font-medium text-gray-900">{selectedOrder.pickupTime}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Método Pago</span>
                <span className="block font-medium text-gray-900">{selectedOrder.paymentMethod}</span>
              </div>
            </div>

            {/* Products Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-gray-700 font-semibold">
                  <tr>
                    <th className="p-3 text-left">Producto</th>
                    <th className="p-3 text-center">Cant</th>
                    <th className="p-3 text-right">Precio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-3">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        {item.extras.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            + {item.extras.join(', ')}
                          </div>
                        )}
                        {item.notes && (
                          <div className="text-xs text-amber-600 italic mt-1 bg-amber-50 px-2 py-1 rounded inline-block">
                            "{item.notes}"
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center text-gray-700 font-medium">{item.quantity}</td>
                      <td className="p-3 text-right text-gray-900 font-bold">${item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-2 border-t mt-2">
              <span className="font-bold text-lg text-gray-700">Total a Cobrar</span>
              <span className="text-2xl font-bold text-blue-700">${selectedOrder.total}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboardPage;