import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/Button';
import { Search, Coffee } from 'lucide-react';

const TrackingPage: React.FC = () => {
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      navigate(`/order/${code.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Rastrea tu Pedido</h1>
        <p className="text-gray-600">Ingresa tu código de pedido para ver el estado actual.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código de Pedido</label>
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ej: CAF-X9Y2Z"
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-400 uppercase"
                required
              />
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <Button type="submit" fullWidth size="lg">
            Buscar Pedido
          </Button>
        </form>
      </div>

      <div className="text-center border-t border-gray-200 pt-8">
        <p className="text-gray-500 mb-4">¿Aún no has ordenado?</p>
        <Link to="/menu">
          <Button variant="outline" className="flex items-center gap-2 mx-auto">
            <Coffee className="w-4 h-4" /> Ver Menú Completo
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default TrackingPage;