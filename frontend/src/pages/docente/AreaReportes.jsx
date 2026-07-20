import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SharedSidebar from '../../components/SharedSidebar';
import { useDocenteWorkflow } from '../../context/DocenteWorkflowContext';
import { Upload, Camera, FileText, Check, X, Eye, Download } from 'lucide-react';

const AreaReportes = () => {
  const navigate = useNavigate();
  const { getRequestsByStep, setCurrentRequest, uploadDocument, uploadImages, updateRequestStatus, moveToNextStep } = useDocenteWorkflow();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showReporteForm, setShowReporteForm] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedReporte, setUploadedReporte] = useState(null);
  const [reporteData, setReporteData] = useState({
    actividades: '',
    resultados: '',
    conclusiones: '',
    recomendaciones: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const reportes = getRequestsByStep('area_reportes');

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setCurrentRequest(request);
    setUploadedImages(request.images || []);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (uploadedImages.length + files.length > 3) {
      alert('Solo se permiten exactamente 3 imágenes como evidencia');
      return;
    }
    setUploadedImages([...uploadedImages, ...files]);
  };

  const handleRemoveImage = (index) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handleReporteUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedReporte(file);
    }
  };

  const handleSubmitReporte = (e) => {
    e.preventDefault();
    
    if (uploadedImages.length !== 3) {
      alert('Debe subir exactamente 3 imágenes como evidencia');
      return;
    }

    if (!uploadedReporte) {
      alert('Debe subir el reporte de visita');
      return;
    }

    if (!selectedRequest) return;

    // Upload images
    uploadImages(selectedRequest.id, uploadedImages.map(img => ({
      name: img.name,
      size: img.size,
      type: 'evidence',
      uploadedAt: new Date().toISOString()
    })));

    // Upload reporte document
    uploadDocument(selectedRequest.id, {
      name: uploadedReporte.name,
      size: uploadedReporte.size,
      type: 'reporte',
      uploadedAt: new Date().toISOString()
    });

    updateRequestStatus(selectedRequest.id, 'reporte_enviado', 'Reporte de visita enviado con evidencias');
    moveToNextStep(selectedRequest.id);

    setShowReporteForm(false);
    setShowSuccess(true);
    setUploadedImages([]);
    setUploadedReporte(null);
    setReporteData({ actividades: '', resultados: '', conclusiones: '', recomendaciones: '' });

    setTimeout(() => {
      setShowSuccess(false);
      navigate('/docente/historico');
    }, 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'carta_responsiva_enviada':
        return 'bg-blue-100 text-blue-800';
      case 'visita_en_curso':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SharedSidebar role="DOCENTE" />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Área de Reportes</h1>

          {!selectedRequest ? (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Visitas en Curso</h2>
              {reportes.length === 0 ? (
                <div className="text-center py-12">
                  <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No hay visitas en curso</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reportes.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800">{request.titulo}</h3>
                          <p className="text-gray-600 mt-1">{request.institucion}</p>
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                            <span>{new Date(request.fechaInicio).toLocaleDateString()} - {new Date(request.fechaFin).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                            {request.status.replace(/_/g, ' ').toUpperCase()}
                          </span>
                          <button
                            onClick={() => handleViewDetails(request)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                            title="Ver detalles"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Back Button */}
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setShowReporteForm(false);
                }}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
              >
                <X className="w-5 h-5" />
                <span>Volver a reportes</span>
              </button>

              {/* Progress Steps */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  {['Solicitud creada', 'Solicitud enviada', 'Carta responsiva', 'Reporte enviado'].map((step, index) => (
                    <div key={step} className="flex items-center">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        index <= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {index <= 2 ? <Check className="w-4 h-4" /> : index + 1}
                      </div>
                      <span className={`ml-2 text-sm ${index <= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                        {step}
                      </span>
                      {index < 3 && <div className="w-16 h-1 bg-gray-200 mx-4" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Request Details */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Detalles de la Visita</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Título</p>
                    <p className="font-medium text-gray-800">{selectedRequest.titulo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Institución</p>
                    <p className="font-medium text-gray-800">{selectedRequest.institucion}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fechas</p>
                    <p className="font-medium text-gray-800">
                      {new Date(selectedRequest.fechaInicio).toLocaleDateString()} - {new Date(selectedRequest.fechaFin).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estado</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {!showReporteForm ? (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Acciones</h2>
                  <button
                    onClick={() => setShowReporteForm(true)}
                    className="w-full flex items-center justify-center space-x-2 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <FileText className="w-6 h-6" />
                    <span>Llenar Reporte de Visita</span>
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Reporte de Visita Académica</h2>
                  
                  <form onSubmit={handleSubmitReporte} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Actividades Realizadas
                      </label>
                      <textarea
                        value={reporteData.actividades}
                        onChange={(e) => setReporteData({ ...reporteData, actividades: e.target.value })}
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Describa las actividades realizadas durante la visita..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resultados Obtenidos
                      </label>
                      <textarea
                        value={reporteData.resultados}
                        onChange={(e) => setReporteData({ ...reporteData, resultados: e.target.value })}
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Describa los resultados y logros..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Conclusiones
                      </label>
                      <textarea
                        value={reporteData.conclusiones}
                        onChange={(e) => setReporteData({ ...reporteData, conclusiones: e.target.value })}
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Conclusiones de la visita..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recomendaciones
                      </label>
                      <textarea
                        value={reporteData.recomendaciones}
                        onChange={(e) => setReporteData({ ...reporteData, recomendaciones: e.target.value })}
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Recomendaciones para futuras visitas..."
                      />
                    </div>

                    {/* Image Upload Section - Exactly 3 Required */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Evidencia Fotográfica (Exactamente 3 imágenes)
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                        <div className="text-center">
                          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">Arrastre imágenes aquí o seleccione</p>
                          <p className="text-sm text-gray-500 mb-4">PNG, JPG, WEBP (Máx. 5MB cada una)</p>
                          <p className="text-sm font-medium text-blue-600 mb-4">
                            Imágenes seleccionadas: {uploadedImages.length}/3
                          </p>
                          <input
                            type="file"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="evidence-images"
                            accept="image/*"
                            multiple
                            disabled={uploadedImages.length >= 3}
                          />
                          <label
                            htmlFor="evidence-images"
                            className={`inline-block px-6 py-2 rounded-lg cursor-pointer transition ${
                              uploadedImages.length >= 3
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {uploadedImages.length >= 3 ? 'Máximo alcanzado' : 'Explorar'}
                          </label>
                        </div>
                      </div>

                      {/* Image Previews */}
                      {uploadedImages.length > 0 && (
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          {uploadedImages.map((img, index) => (
                            <div key={index} className="relative">
                              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                  src={URL.createObjectURL(img)}
                                  alt={`Evidencia ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Report Document Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Documento del Reporte
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                        <div className="text-center">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">Arrastre el documento aquí o seleccione</p>
                          <p className="text-sm text-gray-500 mb-4">PDF, DOC, DOCX (Máx. 10MB)</p>
                          <input
                            type="file"
                            onChange={handleReporteUpload}
                            className="hidden"
                            id="reporte-doc"
                            accept=".pdf,.doc,.docx"
                          />
                          <label
                            htmlFor="reporte-doc"
                            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition"
                          >
                            Explorar
                          </label>
                          {uploadedReporte && (
                            <p className="mt-4 text-sm text-green-600 font-medium">
                              ✓ {uploadedReporte.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={() => setShowReporteForm(false)}
                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={uploadedImages.length !== 3 || !uploadedReporte}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
                      >
                        Enviar Reporte
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">REPORTE ENVIADO CORRECTAMENTE</h3>
            <p className="text-gray-600 mb-6">Tu reporte ha sido enviado y está siendo procesado.</p>
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

export default AreaReportes;
