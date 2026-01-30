import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../store/AdminAuth';
import { getAppConfig, saveAppConfig } from '../../services/db';
import { uploadLogo } from '../../services/firestorage';
import Button from '../../components/Button';
import { ArrowLeft, Upload, Trash2, Image as ImageIcon, Save, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const AdminSettingsPage: React.FC = () => {
  const { isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const [logo, setLogo] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    const fetchConfig = async () => {
      const config = await getAppConfig();
      if (config?.logoUrl) setLogo(config.logoUrl);
    };
    fetchConfig();
  }, [isAuthenticated, navigate]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('La imagen es demasiado grande. El tamaño máximo es 5MB.');
        return;
      }

      setUploading(true);
      setErrorMessage('');
      setSuccessMessage('');

      try {
        // Upload to Firebase Storage
        const url = await uploadLogo(file);
        setLogo(url); // Preview immediately

        // Auto-save logic? Or wait for explicit save?
        // User expects "Guardar Cambios" usually, but for file uploads usually it's immediate 
        // OR we just store the URL in state and save it to DB on "Guardar".
        // Let's do the latter to be safe.
        setSuccessMessage('Imagen subida. No olvides guardar.');
      } catch (error: any) {
        console.error("Upload error:", error);
        setErrorMessage(error.message || "Error al subir imagen. Verifique su conexión y permisos.");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSave = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await saveAppConfig({ logoUrl: logo || '' });
      setSuccessMessage('Logo actualizado globalmente en Firebase.');
    } catch (error: any) {
      console.error("Save error:", error);
      setErrorMessage(error.message || "Error al guardar configuración");
    }
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleRestore = () => {
    setLogo(null);
    setErrorMessage('');
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
        <h2 className="text-lg font-bold text-gray-900 mb-4">Logo de la Aplicación (Firebase)</h2>
        <p className="text-gray-500 mb-6 text-sm">Sube una imagen (PNG o JPG) para reemplazar el logo. Se guardará en la nube y se actualizará para todos los usuarios.</p>

        {/* Preview Area */}
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 mb-6">
          {uploading ? (
            <div className="text-center text-blue-600">
              <Loader className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p>Subiendo a la nube...</p>
            </div>
          ) : logo ? (
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
            <label className={`flex-1 cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200 font-medium">
                <Upload className="w-5 h-5" />
                <span>{uploading ? 'Subiendo...' : 'Subir Imagen'}</span>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </label>

            <Button
              type="button"
              variant="outline"
              onClick={handleRestore}
              disabled={!logo || uploading}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Restaurar Original
            </Button>
          </div>

          <Button
            onClick={handleSave}
            fullWidth
            size="lg"
            disabled={uploading}
            className="flex items-center gap-2 justify-center mt-6"
          >
            <Save className="w-5 h-5" /> Guardar Cambios Globales
          </Button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-center font-medium animate-in fade-in slide-in-from-bottom-2">
            {errorMessage}
          </div>
        )}

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