import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../store/CartContext';
import Button from '../../components/Button';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';

const CartPage: React.FC = () => {
  const { items, removeItem, updateQuantity, subtotal, totalItems } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
        <p className="text-gray-500 mb-8">¡Agrega algunas delicias para comenzar!</p>
        <Link to="/menu">
          <Button>Ir al Menú</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Tu Carrito ({totalItems} items)</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, index) => (
            <div key={`${item.productId}-${index}`} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
              <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
              
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-gray-900">{item.name}</h3>
                  <span className="font-semibold text-gray-900">${item.price * item.quantity}</span>
                </div>
                
                {item.extras.length > 0 && (
                  <p className="text-xs text-gray-500 mb-1">
                    Extras: {item.extras.join(', ')}
                  </p>
                )}
                
                {item.notes && (
                  <p className="text-xs text-gray-500 italic mb-2">"{item.notes}"</p>
                )}
                
                <div className="flex justify-between items-end mt-2">
                  <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                    <button 
                      onClick={() => updateQuantity(item.productId, item.extras, item.quantity - 1)}
                      className="p-1 hover:bg-gray-200 rounded-l-lg text-gray-600 transition-colors"
                      title="Disminuir cantidad"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-gray-900">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.productId, item.extras, item.quantity + 1)}
                      className="p-1 hover:bg-gray-200 rounded-r-lg text-gray-600 transition-colors"
                      title="Aumentar cantidad"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => removeItem(item.productId, item.extras)}
                    className="text-red-500 hover:text-red-700 p-1 transition-colors"
                    title="Eliminar producto"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Resumen</h2>
            
            <div className="space-y-2 mb-4 text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Impuestos (estimados)</span>
                <span>$0</span>
              </div>
            </div>
            
            <div className="border-t pt-4 mb-6 flex justify-between items-center">
              <span className="font-bold text-lg text-gray-900">Total</span>
              <span className="font-bold text-xl text-blue-700">${subtotal}</span>
            </div>
            
            <Button onClick={() => navigate('/checkout')} fullWidth size="lg">
              Proceder al Pago
            </Button>
            
            <Link to="/menu">
              <Button variant="outline" fullWidth className="mt-3">
                Seguir Comprando
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;