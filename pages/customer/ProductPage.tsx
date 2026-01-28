import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, getExtras } from '../../services/storage';
import { Product, Extra } from '../../types';
import { useCart } from '../../store/CartContext';
import Button from '../../components/Button';
import { Minus, Plus, ArrowLeft } from 'lucide-react';

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [extrasList, setExtrasList] = useState<Extra[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  useEffect(() => {
    // Load product
    if (id) {
      const p = getProductById(id);
      if (p) setProduct(p);
      else navigate('/menu'); // Redirect if not found
    }
    // Load extras
    setExtrasList(getExtras());
  }, [id, navigate]);

  if (!product) return null;

  const toggleExtra = (extraName: string) => {
    setSelectedExtras(prev => 
      prev.includes(extraName) 
        ? prev.filter(e => e !== extraName)
        : [...prev, extraName]
    );
  };

  const handleAddToCart = () => {
    const extrasPrice = selectedExtras.reduce((total, extraName) => {
      const extra = extrasList.find(e => e.name === extraName);
      return total + (extra?.price || 0);
    }, 0);

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price + extrasPrice,
      image: product.image,
      quantity,
      notes,
      extras: selectedExtras
    });
    navigate('/cart');
  };

  const totalPrice = (product.price + selectedExtras.reduce((total, name) => {
    const ex = extrasList.find(e => e.name === name);
    return total + (ex?.price || 0);
  }, 0)) * quantity;

  return (
    <div className="max-w-2xl mx-auto">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-1" /> Volver al menú
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <img src={product.image} alt={product.name} className="w-full h-64 object-cover" />
        
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <span className="text-2xl font-bold text-blue-700">${product.price}</span>
          </div>
          
          <p className="text-gray-600 mb-8">{product.description}</p>

          {/* Extras */}
          {extrasList.length > 0 && (
            <div className="mb-8">
              <h3 className="font-bold text-gray-900 mb-3">Extras Opcionales</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {extrasList.map(extra => (
                  <label key={extra.id} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedExtras.includes(extra.name)}
                      onChange={() => toggleExtra(extra.name)}
                      className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <div className="flex justify-between w-full">
                      <span className="text-gray-700">{extra.name}</span>
                      <span className="text-gray-500 text-sm">+${extra.price}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="mb-8">
            <label className="block font-bold text-gray-900 mb-2">Notas para la cocina</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Sin azúcar, muy caliente, etc."
              className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
              rows={3}
            />
          </div>

          {/* Quantity & Action */}
          <div className="flex flex-col sm:flex-row gap-4 items-center border-t pt-6">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 hover:bg-gray-100 text-gray-600 transition-colors"
                title="Disminuir cantidad"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="w-12 text-center font-bold text-lg text-gray-900">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="p-3 hover:bg-gray-100 text-gray-600 transition-colors"
                title="Aumentar cantidad"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            <Button 
              onClick={handleAddToCart} 
              fullWidth 
              size="lg"
              disabled={!product.available}
            >
              Agregar ${totalPrice}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;