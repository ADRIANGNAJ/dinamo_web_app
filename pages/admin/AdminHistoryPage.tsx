import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../store/AdminAuth';
import { getOrders } from '../../services/storage';
import { Order } from '../../types';
import { ORDER_STATUS_COLORS } from '../../constants';
import Button from '../../components/Button';
import { ArrowLeft, Calendar, Search, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const AdminHistoryPage: React.FC = () => {
  const { isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    const allOrders = getOrders();
    // Sort descending by date
    allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setOrders(allOrders);
    setFilteredOrders(allOrders);
    
    // Set default dates (today)
    const today = new Date().toISOString().split('T')[0];
    setEndDate(today);
  }, [isAuthenticated, navigate]);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) return;

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const filtered = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= start && orderDate <= end;
    });

    setFilteredOrders(filtered);
  };

  const handleReset = () => {
    setStartDate('');
    setFilteredOrders(orders);
  };

  if (!isAuthenticated) return null;

  const totalSales = filteredOrders.reduce((acc, order) => acc + order.total, 0);

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/dashboard" className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Historial de Pedidos</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Filter Card */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
           <form onSubmit={handleFilter} className="flex flex-col md:flex-row gap-4 items-end">
             <div className="w-full">
               <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
               <input 
                 type="date" 
                 value={startDate}
                 onChange={e => setStartDate(e.target.value)}
                 className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                 required
               />
             </div>
             <div className="w-full">
               <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
               <input 
                 type="date" 
                 value={endDate}
                 onChange={e => setEndDate(e.target.value)}
                 className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
               />
             </div>
             <div className="flex gap-2 w-full md:w-auto">
               <Button type="submit" className="flex items-center gap-2">
                 <Search className="w-4 h-4" /> Filtrar
               </Button>
               <Button type="button" variant="outline" onClick={handleReset}>
                 Limpiar
               </Button>
             </div>
           </form>
        </div>

        {/* Stats Card */}
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex flex-col justify-center">
           <p className="text-sm text-blue-600 font-bold uppercase tracking-wider mb-1">Total Ventas</p>
           <p className="text-3xl font-bold text-blue-900">${totalSales}</p>
           <p className="text-sm text-blue-600 mt-2">{filteredOrders.length} pedidos encontrados</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                <th className="p-4">Fecha/Hora</th>
                <th className="p-4">Código</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Total</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="p-4 text-sm text-gray-600">
                    <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                    <div className="text-xs">{new Date(order.createdAt).toLocaleTimeString()}</div>
                  </td>
                  <td className="p-4 font-mono font-bold text-blue-800">{order.code}</td>
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{order.customerName}</div>
                    <div className="text-xs text-gray-500">{order.customerPhone}</div>
                  </td>
                  <td className="p-4 font-bold text-gray-900">${order.total}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${ORDER_STATUS_COLORS[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4">
                     <button onClick={() => navigate(`/order/${order.code}`)} className="text-blue-600 hover:underline flex items-center gap-1 text-sm">
                       <FileText className="w-4 h-4" /> Ver
                     </button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No se encontraron pedidos en este rango de fechas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminHistoryPage;