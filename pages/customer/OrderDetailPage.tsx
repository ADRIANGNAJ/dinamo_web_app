import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderByCode } from '../../services/db';
import { Order } from '../../types';
import { ORDER_STATUS_COLORS } from '../../constants';
import Button from '../../components/Button';
import { CheckCircle, Clock, MapPin, Phone, Copy, Bell } from 'lucide-react';

const OrderDetailPage: React.FC = () => {
  const { orderCode } = useParams<{ orderCode: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Use refs to track state in interval callback
  const orderRef = useRef<Order | null>(null);

  useEffect(() => {
    // Check permission status on load
    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }, []);

  const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationsEnabled(true);
      new Notification("Notificaciones activadas", {
        body: "Te avisaremos cuando cambie el estado de tu pedido.",
      });
    }
  };

  useEffect(() => {
    if (!orderCode) return;

    const fetchOrder = async () => {
      try {
        const data = await getOrderByCode(orderCode);
        if (data) {
          setOrder(data);
          orderRef.current = data;
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      }
    };

    // Initial load
    fetchOrder();

    // Polling interval (every 5 seconds)
    const interval = setInterval(async () => {
      try {
        const currentOrder = await getOrderByCode(orderCode);
        const previousOrder = orderRef.current;

        if (currentOrder && previousOrder) {
          // Update state
          setOrder(currentOrder);
          orderRef.current = currentOrder;

          // Check for status change
          if (currentOrder.status !== previousOrder.status) {
            const msg = `El estado de tu pedido cambió a: ${currentOrder.status}`;

            // Show In-App Toast
            setToastMessage(msg);
            setTimeout(() => setToastMessage(null), 5000);

            // Show Browser Notification via Service Worker
            if (Notification.permission === 'granted') {
              console.log("Sending polling notification:", msg);
              navigator.serviceWorker.ready.then(registration => {
                registration.showNotification("¡Actualización de Pedido!", {
                  body: msg,
                  icon: '/vite.svg',
                  badge: '/vite.svg'
                });
              });
            } else {
              console.log("Notification permission not granted during poll:", Notification.permission);
            }
          }
        }
      } catch (error) {
        console.error("Error polling order:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [orderCode]);

  const copyCode = () => {
    if (order) {
      navigator.clipboard.writeText(order.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!order) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Pedido no encontrado</h2>
        <p className="text-gray-500 mb-8">El código {orderCode} no existe.</p>
        <Link to="/tracking">
          <Button>Buscar de nuevo</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto relative">

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-blue-800 text-white p-4 rounded-lg shadow-xl animate-bounce">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6" />
            <p className="font-bold">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Enable Notifications Banner */}
      {!notificationsEnabled ? (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-yellow-800">
            <Bell className="w-5 h-5" />
            <span className="text-sm font-medium">Activa notificaciones para saber cuando tu café esté listo.</span>
          </div>
          <button
            onClick={requestNotificationPermission}
            className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-900 font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Activar Avisos
          </button>
        </div>
      ) : null}

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">

        {/* Header Status */}
        <div className={`p-6 text-white text-center transition-colors duration-500 ${order.status === 'LISTO' ? 'bg-green-600' :
          order.status === 'CANCELADO' ? 'bg-red-600' :
            'bg-blue-700'
          }`}>
          <h1 className="text-sm font-medium opacity-90 uppercase tracking-wider mb-2">Estado del Pedido</h1>
          <div className="inline-flex items-center gap-2 bg-white/20 px-6 py-3 rounded-full backdrop-blur-sm animate-pulse">
            <span className="font-bold text-2xl">{order.status}</span>
          </div>
          <p className="mt-4 opacity-90 text-sm">Gracias por tu compra, {order.customerName}</p>
        </div>

        <div className="p-6 md:p-8 space-y-8">

          {/* Code */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Código de Recolección (Guárdalo)</p>
            <div className="flex justify-center items-center gap-3">
              <span className="text-4xl font-mono font-bold text-gray-900 tracking-wider">{order.code}</span>
              <button onClick={copyCode} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                {copied ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="font-semibold text-gray-900">Hora de Recolección</p>
                <p className="text-gray-600">{order.pickupTime}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="font-semibold text-gray-900">Lugar</p>
                <p className="text-gray-600">Mostrador Principal</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="font-semibold text-gray-900">Contacto</p>
                <p className="text-gray-600">{order.customerPhone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="font-semibold text-gray-900">Pago</p>
                <p className="text-gray-600">{order.paymentMethod}</p>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div>
            <h3 className="font-bold text-gray-900 border-b pb-2 mb-4">Detalle del Pedido</h3>
            <ul className="space-y-4">
              {order.items.map((item, idx) => (
                <li key={idx} className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <span className="font-bold text-gray-500">{item.quantity}x</span>
                    <div>
                      <p className="text-gray-900 font-medium">{item.name}</p>
                      {item.extras.length > 0 && <p className="text-xs text-gray-500">{item.extras.join(', ')}</p>}
                      {item.notes && <p className="text-xs text-gray-400 italic">"{item.notes}"</p>}
                    </div>
                  </div>
                  <span className="text-gray-700">${item.price * item.quantity}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between items-center border-t mt-4 pt-4">
              <span className="font-bold text-xl text-gray-900">Total</span>
              <span className="font-bold text-xl text-blue-700">${order.total}</span>
            </div>
          </div>

          <div className="text-center pt-4">
            <Link to="/menu">
              <Button variant="outline">Volver al Menú</Button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;