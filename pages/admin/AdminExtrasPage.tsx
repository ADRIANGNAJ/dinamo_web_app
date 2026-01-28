import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../store/AdminAuth';
import { getExtras, saveExtra, deleteExtra } from '../../services/storage';
import { Extra } from '../../types';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { Edit2, Trash2, Plus, ArrowLeft, Layers } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const AdminExtrasPage: React.FC = () => {
  const { isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const [extras, setExtras] = useState<Extra[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExtra, setEditingExtra] = useState<Partial<Extra>>({});

  // Confirmation State
  const [deleteConfirmation, setDeleteConfirmation] = useState<{isOpen: boolean, id: string | null}>({
    isOpen: false,
    id: null
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    refreshExtras();
  }, [isAuthenticated, navigate]);

  const refreshExtras = () => {
    setExtras(getExtras());
  };

  const handleEdit = (extra: Extra) => {
    setEditingExtra(extra);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingExtra({
      id: crypto.randomUUID(),
      name: '',
      price: 0
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmation({ isOpen: true, id });
  };

  const confirmDelete = () => {
    if (deleteConfirmation.id) {
      deleteExtra(deleteConfirmation.id);
      refreshExtras();
      setDeleteConfirmation({ isOpen: false, id: null });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExtra.name && editingExtra.price !== undefined) {
      saveExtra(editingExtra as Extra);
      setIsModalOpen(false);
      refreshExtras();
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Extras</h1>
            <p className="text-sm text-gray-500">Estos extras aparecerán disponibles en todos los productos.</p>
          </div>
        </div>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo Extra
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-w-2xl mx-auto md:mx-0">
        <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 text-sm border-b">
                <tr>
                    <th className="p-4">Nombre</th>
                    <th className="p-4">Precio Adicional</th>
                    <th className="p-4 text-right">Acciones</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {extras.map(extra => (
                    <tr key={extra.id} className="hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-900">{extra.name}</td>
                        <td className="p-4 text-blue-700 font-bold">+${extra.price}</td>
                        <td className="p-4">
                            <div className="flex justify-end gap-2">
                                <button 
                                    type="button"
                                    onClick={() => handleEdit(extra)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Editar"
                                >
                                    <Edit2 className="w-5 h-5" />
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => handleDeleteClick(extra.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Eliminar"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                {extras.length === 0 && (
                    <tr>
                        <td colSpan={3} className="p-8 text-center text-gray-500">
                            No hay extras configurados.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>

      {/* Edit/Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Configurar Extra">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre del Extra</label>
            <input 
              className="mt-1 w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 placeholder-gray-400" 
              placeholder="Ej: Leche de Almendra"
              value={editingExtra.name || ''} 
              onChange={e => setEditingExtra({...editingExtra, name: e.target.value})}
              required
            />
          </div>
          
          <div>
              <label className="block text-sm font-medium text-gray-700">Precio Adicional ($)</label>
              <input 
                type="number"
                min="0"
                className="mt-1 w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 placeholder-gray-400" 
                value={editingExtra.price !== undefined ? editingExtra.price : ''} 
                onChange={e => setEditingExtra({...editingExtra, price: Number(e.target.value)})}
                required
              />
          </div>

          <Button type="submit" fullWidth>Guardar</Button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteConfirmation.isOpen} onClose={() => setDeleteConfirmation({isOpen: false, id: null})} title="Confirmar Eliminación">
         <div className="space-y-6">
           <div className="flex flex-col items-center text-center p-2">
              <div className="bg-red-100 p-3 rounded-full mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">¿Eliminar Extra?</h3>
              <p className="text-gray-500 mt-2">¿Estás seguro que deseas eliminar este extra? Se eliminará de la lista de opciones de todos los productos.</p>
           </div>
           <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeleteConfirmation({isOpen: false, id: null})} fullWidth>Cancelar</Button>
              <Button variant="danger" onClick={confirmDelete} fullWidth>Eliminar</Button>
           </div>
         </div>
      </Modal>
    </div>
  );
};

export default AdminExtrasPage;