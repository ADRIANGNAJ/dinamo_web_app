import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../store/AdminAuth';
import { getAppLogo, saveAppLogo, removeAppLogo } from '../../services/storage';
import Button from '../../components/Button';
import { ArrowLeft, Upload, Trash2, Image as ImageIcon, Save } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const AdminSettingsPage: React.FC = () => {
  const { isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const [logo, setLogo] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    const currentLogo = getAppLogo();
    if (currentLogo) setLogo(currentLogo);
  }, [isAuthenticated, navigate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (logo) {
      saveAppLogo(logo);
      setSuccessMessage('Logo actualizado correctamente. Recarga la página para ver los cambios globales.');
    } else {
      removeAppLogo();
      setSuccessMessage('Logo restaurado al original.');
    }
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleRestore = () => {
    setLogo(null);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/dashboard" className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Configuración de Marca</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Logo de la Aplicación</h2>
        <p className="text-gray-500 mb-6 text-sm">Sube una imagen (PNG o JPG) para reemplazar el logo por defecto de la aplicación. Se recomienda un fondo transparente.</p>

        {/* Preview Area */}
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 mb-6">
          {logo ? (
            <div className="relative">
                <img src={logo} alt="Preview" className="h-24 object-contain" />
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Vista previa del logo</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200 font-medium">
                        <Upload className="w-5 h-5" />
                        <span>Subir Imagen</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>

                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleRestore}
                    disabled={!logo}
                    className="flex items-center gap-2"
                >
                    <Trash2 className="w-4 h-4" /> Restaurar Original
                </Button>
            </div>

            <Button 
                onClick={handleSave} 
                fullWidth 
                size="lg"
                className="flex items-center gap-2 justify-center mt-6"
            >
                <Save className="w-5 h-5" /> Guardar Cambios
            </Button>
        </div>

        {successMessage && (
            <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg text-center font-medium animate-in fade-in slide-in-from-bottom-2">
                {successMessage}
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettingsPage;