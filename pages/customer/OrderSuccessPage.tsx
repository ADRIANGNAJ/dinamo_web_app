import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Button from '../../components/Button';
import { CheckCircle, Copy, ArrowRight, Search, Package, PartyPopper } from 'lucide-react';
import { getOrderByCode } from '../../services/db';
import { Order, PaymentMethod } from '../../types';

const OrderSuccessPage: React.FC = () => {
  const { orderCode } = useParams<{ orderCode: string }>();
  const [copied, setCopied] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (orderCode) {
      console.log("Fetching order:", orderCode);
      getOrderByCode(orderCode)
        .then(data => {
          console.log("Order fetched:", data);
          setOrder(data || null);
        })
        .catch(err => console.error("Error fetching order:", err));
    }
  }, [orderCode]);

  const copyCode = () => {
    if (orderCode) {
      navigator.clipboard.writeText(orderCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!order) {
    return <div className="p-8 text-center text-gray-500">Cargando detalles del pedido...</div>;
  }

  return (
    <div className="max-w-md mx-auto py-12 text-center px-4">
      <div className="mb-8 flex justify-center">
        <div className="bg-green-100 p-4 rounded-full">
          <CheckCircle className="w-16 h-16 text-green-600" />
        </div>
      </div>

      {order?.paymentMethod === PaymentMethod.ONLINE && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center justify-center gap-2 text-blue-800 font-bold text-lg mb-1">
            <PartyPopper className="w-6 h-6" />
            ¡Pago Aprobado!
          </div>
          <p className="text-blue-600 text-sm">Tu transacción fue completada con éxito.</p>
        </div>
      )}

      <h1 className="text-3xl font-bold text-gray-900 mb-4">¡Pedido Recibido!</h1>
      <p className="text-gray-600 mb-8 text-lg">
        Hemos comenzado a preparar tu orden. Hemos guardado tu código en "Mis Pedidos" para que no lo pierdas.
      </p>

      <div className="bg-white border-2 border-dashed border-blue-200 rounded-xl p-8 mb-8 relative shadow-sm">
        <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">Tu Código de Rastreo</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl font-mono font-black text-gray-900 tracking-wider">
            {orderCode}
          </span>
          <button
            onClick={copyCode}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            title="Copiar código"
          >
            {copied ? <CheckCircle className="w-6 h-6 text-green-600" /> : <Copy className="w-6 h-6" />}
          </button>
        </div>
        {copied && <p className="text-green-600 text-xs font-bold mt-2">¡Copiado al portapapeles!</p>}
      </div>

      <div className="space-y-4">
        <Link to={`/order/${orderCode}`}>
          <Button fullWidth size="lg" className="flex items-center justify-center gap-2">
            <Search className="w-5 h-5" /> Ver Estado Ahora
          </Button>
        </Link>

        <Link to="/my-orders">
          <Button variant="secondary" fullWidth className="flex items-center justify-center gap-2">
            <Package className="w-5 h-5" /> Ir a Mis Pedidos
          </Button>
        </Link>

        <Link to="/menu" className="block">
          <Button variant="outline" fullWidth className="flex items-center justify-center gap-2">
            Volver al Menú <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <p className="mt-8 text-xs text-gray-400">
        Muestra este código en el mostrador para recoger tus productos.
      </p>
    </div>
  );
};

export default OrderSuccessPage;