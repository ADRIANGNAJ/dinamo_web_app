import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../store/AdminAuth';
import { getProducts, saveProduct, deleteProduct } from '../../services/db';
import { Product } from '../../types';
import { CATEGORIES } from '../../services/mockData';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { Edit2, Trash2, Plus, ArrowLeft, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const AdminProductsPage: React.FC = () => {
  const { isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({});

  // Confirmation State
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean, id: string | null }>({
    isOpen: false,
    id: null
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    refreshProducts();
  }, [isAuthenticated, navigate]);

  const refreshProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct({
      id: crypto.randomUUID(),
      available: true,
      category: CATEGORIES[1], // Default to first actual category
      image: 'https://picsum.photos/400/300' // Default placeholder
    });
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteConfirmation.id) {
      await deleteProduct(deleteConfirmation.id);
      await refreshProducts();
      setDeleteConfirmation({ isOpen: false, id: null });
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmation({ isOpen: true, id });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct.name && editingProduct.price) {
      await saveProduct(editingProduct as Product);
      setIsModalOpen(false);
      refreshProducts();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProduct(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/admin/dashboard" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Menú</h1>
        </div>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo Producto
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
              <div className="relative h-48">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                {!product.available && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-red-600 text-white px-3 py-1 text-sm font-bold rounded">AGOTADO</span>
                  </div>
                )}
              </div>

              <div className="p-4 flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900">{product.name}</h3>
                  <span className="font-semibold">${product.price}</span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
              </div>

              {/* Always visible action buttons at the bottom */}
              <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
                <span className="text-xs text-gray-400">ID: ...{product.id.slice(-4)}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(product)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 font-medium text-sm transition-colors"
                  >
                    <Edit2 className="w-4 h-4" /> Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(product.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 font-medium text-sm transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Editar Producto">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              className="mt-1 w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 placeholder-gray-400"
              value={editingProduct.name || ''}
              onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Precio</label>
              <input
                type="number"
                className="mt-1 w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 placeholder-gray-400"
                value={editingProduct.price || ''}
                onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Categoría</label>
              <select
                className="mt-1 w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2"
                value={editingProduct.category || ''}
                onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
              >
                {CATEGORIES.filter(c => c !== 'Todos').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              className="mt-1 w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 placeholder-gray-400"
              value={editingProduct.description || ''}
              onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Imagen</label>
            <div className="flex items-center gap-4">
              <img src={editingProduct.image} alt="Preview" className="w-16 h-16 rounded object-cover border" />
              <label className="cursor-pointer bg-gray-100 px-3 py-2 rounded-md hover:bg-gray-200 flex items-center gap-2 text-sm">
                <ImageIcon className="w-4 h-4" /> Subir archivo
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            <input
              type="text"
              placeholder="O pega una URL..."
              className="mt-2 w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 text-sm placeholder-gray-400"
              value={editingProduct.image || ''}
              onChange={e => setEditingProduct({ ...editingProduct, image: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="available"
              checked={editingProduct.available || false}
              onChange={e => setEditingProduct({ ...editingProduct, available: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="available" className="text-sm font-medium text-gray-700">Producto Disponible</label>
          </div>

          <Button type="submit" fullWidth>Guardar</Button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteConfirmation.isOpen} onClose={() => setDeleteConfirmation({ isOpen: false, id: null })} title="Confirmar Eliminación">
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center p-2">
            <div className="bg-red-100 p-3 rounded-full mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">¿Eliminar Producto?</h3>
            <p className="text-gray-500 mt-2">¿Estás seguro que deseas eliminar este producto? Esta acción no se puede deshacer.</p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeleteConfirmation({ isOpen: false, id: null })} fullWidth>Cancelar</Button>
            <Button variant="danger" onClick={confirmDelete} fullWidth>Eliminar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminProductsPage;