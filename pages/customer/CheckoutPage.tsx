import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../store/CartContext';
import { generateOrderCode, saveMyOrderCode } from '../../services/storage'; // createOrder removed
import { createOrder } from '../../services/db'; // createOrder added
import { Order, OrderStatus, PaymentMethod } from '../../types';
import { PICKUP_TIMES } from '../../constants';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import StripePaymentForm from '../../components/StripePaymentForm';
import { Clock, CreditCard, Banknote, User, ArrowLeft } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Initialize Stripe outside component
// Make sure you have this environment variable set in .env.local
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '', {
  stripeAccount: import.meta.env.VITE_STRIPE_CONNECT_ACCOUNT_ID,
});

const CheckoutPage: React.FC = () => {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pickupTime: '',
    paymentMethod: PaymentMethod.PAY_AT_PICKUP as PaymentMethod
  });

  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Stripe States
  const [clientSecret, setClientSecret] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/menu');
    }
  }, [items, navigate]);

  const finalizeOrder = async (method: PaymentMethod) => {
    const newOrder: Order = {
      id: crypto.randomUUID(),
      code: generateOrderCode(),
      customerName: formData.name,
      customerPhone: formData.phone,
      pickupTime: formData.pickupTime,
      paymentMethod: method,
      items: items,
      total: subtotal,
      status: OrderStatus.RECEIVED,
      createdAt: new Date().toISOString(),
    };

    await createOrder(newOrder); // Async call to Firestore
    saveMyOrderCode(newOrder.code);
    clearCart();

    // Redirect to success
    navigate(`/order-success/${newOrder.code}`);
  };

  const initStripePayment = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }), // Send items for server-side calculation
      });

      if (!response.ok) throw new Error('Error iniciando pago');

      const data = await response.json();
      setClientSecret(data.clientSecret);
      setShowPaymentModal(true);
    } catch (err: any) {
      setError('No se pudo iniciar el pago: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.phone.trim() || !formData.pickupTime) {
      setError('Por favor completa todos los campos obligatorios.');
      return;
    }

    if (formData.paymentMethod === PaymentMethod.ONLINE) {
      // Start Stripe Flow
      await initStripePayment();
    } else {
      // Pay at Pickup Flow
      setIsProcessing(true);
      // Simulate small delay
      setTimeout(() => {
        finalizeOrder(PaymentMethod.PAY_AT_PICKUP);
      }, 1000);
    }
  };

  const handleStripeSuccess = () => {
    setShowPaymentModal(false);
    finalizeOrder(PaymentMethod.ONLINE);
  };

  const handleStripeError = (msg: string) => {
    // Keep modal open, just show error in form (handled by form itself mostly)
    console.error(msg);
  };

  if (items.length === 0) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Finalizar Pedido</h1>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">

          {/* Contact Info */}
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-800">
              <User className="w-5 h-5 text-blue-600" /> Tus Datos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-400"
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-400"
                  placeholder="55 1234 5678"
                />
              </div>
            </div>
          </div>

          {/* Pickup Time */}
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-800">
              <Clock className="w-5 h-5 text-blue-600" /> Hora de Recolección
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {PICKUP_TIMES.map(time => (
                <button
                  type="button"
                  key={time}
                  onClick={() => setFormData({ ...formData, pickupTime: time })}
                  className={`px-2 py-2 text-sm rounded-lg border transition-colors ${formData.pickupTime === time
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
                    }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-800">
              <CreditCard className="w-5 h-5 text-blue-600" /> Método de Pago
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setFormData({ ...formData, paymentMethod: PaymentMethod.PAY_AT_PICKUP })}
                className={`p-4 border rounded-xl cursor-pointer flex items-center gap-3 transition-all ${formData.paymentMethod === PaymentMethod.PAY_AT_PICKUP
                  ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600 text-blue-900'
                  : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
              >
                <Banknote className="w-6 h-6 text-green-600" />
                <span className="font-medium">Pagar al recoger</span>
              </div>
              <div
                onClick={() => setFormData({ ...formData, paymentMethod: PaymentMethod.ONLINE })}
                className={`p-4 border rounded-xl cursor-pointer flex items-center gap-3 transition-all ${formData.paymentMethod === PaymentMethod.ONLINE
                  ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600 text-blue-900'
                  : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
              >
                <CreditCard className="w-6 h-6 text-blue-600" />
                <span className="font-medium">Pago Online con Tarjeta</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Total & Submit */}
          <div className="border-t pt-6 mt-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-600">Total a Pagar</span>
              <span className="text-2xl font-bold text-blue-700">${subtotal}</span>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={isProcessing}
            >
              {isProcessing ? 'Procesando...' :
                formData.paymentMethod === PaymentMethod.ONLINE
                  ? 'Continuar al Pago'
                  : 'Confirmar Pedido'}
            </Button>

            <Link to="/menu" className="block mt-4">
              <Button type="button" variant="outline" fullWidth className="flex items-center justify-center gap-2 text-gray-500">
                <ArrowLeft className="w-4 h-4" /> Volver al Menú
              </Button>
            </Link>
          </div>
        </form>
      </div>

      {/* Stripe Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Pago Seguro con Tarjeta"
      >
        {clientSecret && stripePromise && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <StripePaymentForm
              amount={subtotal}
              onSuccess={handleStripeSuccess}
              onError={handleStripeError}
            />
          </Elements>
        )}
      </Modal>
    </div>
  );
};

export default CheckoutPage;