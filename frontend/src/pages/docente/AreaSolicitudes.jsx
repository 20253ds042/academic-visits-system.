import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SharedSidebar from '../../components/SharedSidebar';
import { useDocenteWorkflow } from '../../context/DocenteWorkflowContext';
import { Download, Upload, FileText, Check, X, Eye } from 'lucide-react';

const AreaSolicitudes = () => {
  const navigate = useNavigate();
  const { getRequestsByStep, setCurrentRequest, uploadDocument, updateRequestStatus, moveToNextStep } = useDocenteWorkflow();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showCartaModal, setShowCartaModal] = useState(false);
  const [uploadedCarta, setUploadedCarta] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const solicitudes = getRequestsByStep('area_solicitudes');

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setCurrentRequest(request);
  };

  const handleDownloadCarta = () => {
    // Mock download - in real app would download from server
    const link = document.createElement('a');
    link.href = '#';
    link.download = 'carta_responsiva_template.pdf';
    link.click();
  };

  const handleCartaUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedCarta(file);
    }
  };

  const handleUploadCarta = () => {
    if (!uploadedCarta || !selectedRequest) return;

    uploadDocument(selectedRequest.id, {
      name: uploadedCarta.name,
      size: uploadedCarta.size,
      type: 'carta_responsiva',
      uploadedAt: new Date().toISOString()
    });

    updateRequestStatus(selectedRequest.id, 'carta_responsiva_enviada', 'Carta responsiva firmada subida');
    moveToNextStep(selectedRequest.id);

    setShowCartaModal(false);
    setShowSuccess(true);
    setUploadedCarta(null);

    setTimeout(() => {
      setShowSuccess(false);
      navigate('/docente/area-reportes');
    }, 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'solicitud_creada':
        return 'bg-yellow-100 text-yellow-800';
      case 'solicitud_enviada':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SharedSidebar role="DOCENTE" />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Área de Solicitudes</h1>

          {!selectedRequest ? (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Solicitudes Pendientes</h2>
              {solicitudes.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No hay solicitudes pendientes</p>
                  <button
                    onClick={() => navigate('/docente/solicitud')}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Crear Nueva Solicitud
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {solicitudes.map((request) => (
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
                onClick={() => setSelectedRequest(null)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
              >
                <X className="w-5 h-5" />
                <span>Volver a solicitudes</span>
              </button>

              {/* Request Details */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Detalles de la Solicitud</h2>
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
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Propósito</p>
                  <p className="text-gray-800">{selectedRequest.proposito}</p>
                </div>
              </div>

              {/* Carta Responsiva Section */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Carta Responsiva</h2>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg mb-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-800">Carta Responsiva Template</p>
                      <p className="text-sm text-gray-500">Documento para descargar y firmar</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDownloadCarta}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar</span>
                  </button>
                </div>

                <button
                  onClick={() => setShowCartaModal(true)}
                  className="w-full flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                >
                  <Upload className="w-6 h-6 text-gray-400" />
                  <span className="text-gray-600">Subir Carta Responsiva Firmada</span>
                </button>

                {selectedRequest.documents.some(doc => doc.type === 'carta_responsiva') && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-medium">Carta responsiva firmada subida</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Carta Upload Modal */}
      {showCartaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md mx-4 w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Carta Responsiva</h3>
              <button
                onClick={() => setShowCartaModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
              <div className="text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Arrastre el archivo aquí</p>
                <p className="text-sm text-gray-500 mb-4">PDF, DOC, DOCX (Máx. 10MB)</p>
                <input
                  type="file"
                  onChange={handleCartaUpload}
                  className="hidden"
                  id="carta-file"
                  accept=".pdf,.doc,.docx"
                />
                <label
                  htmlFor="carta-file"
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition"
                >
                  Explorar
                </label>
                {uploadedCarta && (
                  <p className="mt-4 text-sm text-green-600 font-medium">
                    ✓ {uploadedCarta.name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowCartaModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleUploadCarta}
                disabled={!uploadedCarta}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                Subir Carta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">CARTA RESPONSIVA ENVIADA CORRECTAMENTE</h3>
            <p className="text-gray-600 mb-6">Tu carta responsiva ha sido enviada y está siendo procesada.</p>
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

export default AreaSolicitudes;
