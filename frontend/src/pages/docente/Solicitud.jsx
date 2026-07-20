import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SharedSidebar from '../../components/SharedSidebar';
import { useDocenteWorkflow } from '../../context/DocenteWorkflowContext';
import { Upload, Calendar, MapPin, FileText, Check } from 'lucide-react';

const Solicitud = () => {
  const navigate = useNavigate();
  const { createRequest } = useDocenteWorkflow();
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    proposito: '',
    institucion: '',
    fechaInicio: '',
    fechaFin: '',
    participantes: '',
    presupuesto: ''
  });
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newRequest = createRequest({
      ...formData,
      solicitudDocument: uploadedFile ? {
        name: uploadedFile.name,
        size: uploadedFile.size,
        type: 'solicitud'
      } : null
    });

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      navigate('/docente/area-solicitudes');
    }, 2000);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SharedSidebar role="DOCENTE" />
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-center justify-between">
              {['Solicitud creada', 'Solicitud enviada', 'Carta responsiva', 'Reporte enviado'].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    index === 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {index === 0 ? <Check className="w-4 h-4" /> : index + 1}
                  </div>
                  <span className={`ml-2 text-sm ${index === 0 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                    {step}
                  </span>
                  {index < 3 && <div className="w-16 h-1 bg-gray-200 mx-4" />}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Solicitud de Visita Académica</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título de la Visita
                </label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Ej: Visita de investigación al MIT"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Propósito de la Visita
                </label>
                <textarea
                  name="proposito"
                  value={formData.proposito}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Describa el objetivo y alcance de la visita..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Institución a Visitar
                  </div>
                </label>
                <input
                  type="text"
                  name="institucion"
                  value={formData.institucion}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Ej: Massachusetts Institute of Technology"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Fecha de Inicio
                    </div>
                  </label>
                  <input
                    type="date"
                    name="fechaInicio"
                    value={formData.fechaInicio}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Fecha de Fin
                    </div>
                  </label>
                  <input
                    type="date"
                    name="fechaFin"
                    value={formData.fechaFin}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Participantes
                </label>
                <textarea
                  name="participantes"
                  value={formData.participantes}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Lista de participantes..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Presupuesto Estimado
                </label>
                <input
                  type="text"
                  name="presupuesto"
                  value={formData.presupuesto}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Ej: $5,000 USD"
                />
              </div>

              {/* Document Upload Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                <div className="text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Arrastre archivos aquí o seleccione</p>
                  <p className="text-sm text-gray-500 mb-4">PDF, DOC, DOCX (Máx. 10MB)</p>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="solicitud-file"
                    accept=".pdf,.doc,.docx"
                  />
                  <label
                    htmlFor="solicitud-file"
                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition"
                  >
                    Explorar
                  </label>
                  {uploadedFile && (
                    <p className="mt-4 text-sm text-green-600 font-medium">
                      ✓ {uploadedFile.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => navigate('/docente/inicio')}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Enviar Solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">SOLICITUD ENVIADA CORRECTAMENTE</h3>
            <p className="text-gray-600 mb-6">Tu solicitud ha sido enviada y está siendo procesada.</p>
            <button
              onClick={() => setShowSuccess(false)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Solicitud;
