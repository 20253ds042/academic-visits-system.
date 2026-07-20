import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SharedSidebar from '../../components/SharedSidebar';
import { useDocenteWorkflow } from '../../context/DocenteWorkflowContext';
import { Check, X, Eye, Calendar, FileText, Camera, Download, AlertCircle } from 'lucide-react';

const RevisionReportes = () => {
  const navigate = useNavigate();
  const { requests, updateRequestStatus, moveToNextStep } = useDocenteWorkflow();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const reportesEnRevision = requests.filter(r => r.workflowStep === 'evaluacion_reporte');

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
  };

  const handleApproveReport = () => {
    if (!selectedRequest) return;

    updateRequestStatus(selectedRequest.id, 'reporte_aprobado', 'Reporte aprobado por Estadías');
    moveToNextStep(selectedRequest.id);
    
    setShowSuccess(true);
    setSelectedRequest(null);

    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };

  const handleRejectReport = () => {
    if (!selectedRequest) return;

    updateRequestStatus(selectedRequest.id, 'reporte_rechazado', 'Reporte rechazado por Estadías');
    
    setShowSuccess(true);
    setSelectedRequest(null);

    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'reporte_enviado':
        return 'bg-blue-100 text-blue-800';
      case 'reporte_aprobado':
        return 'bg-green-100 text-green-800';
      case 'reporte_rechazado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SharedSidebar role="ESTADÍAS" />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Revisión de Reportes</h1>

          {!selectedRequest ? (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Reportes en Revisión</h2>
              {reportesEnRevision.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No hay reportes en revisión</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reportesEnRevision.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800">{request.titulo}</h3>
                          <p className="text-gray-600 mt-1">{request.institucion}</p>
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>{new Date(request.fechaInicio).toLocaleDateString()} - {new Date(request.fechaFin).toLocaleDateString()}</span>
                            </div>
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
                <span>Volver a reportes</span>
              </button>

              {/* Request Details */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Detalles de la Visita</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
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
                    <p className="text-sm text-gray-500">Estado del Workflow</p>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {selectedRequest.workflowStep.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-500">Propósito</p>
                  <p className="text-gray-800">{selectedRequest.proposito}</p>
                </div>
              </div>

              {/* Report Document */}
              {selectedRequest.documents && selectedRequest.documents.some(doc => doc.type === 'reporte') && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Documento del Reporte</h2>
                  <div className="space-y-2">
                    {selectedRequest.documents.filter(doc => doc.type === 'reporte').map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-800">{doc.name}</p>
                            <p className="text-xs text-gray-500">Subido: {new Date(doc.uploadedAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Photographic Evidence */}
              {selectedRequest.images && selectedRequest.images.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Evidencia Fotográfica ({selectedRequest.images.length} imágenes)</h2>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedRequest.images.map((img, index) => (
                      <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Camera className="w-8 h-8" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {selectedRequest.status === 'reporte_enviado' && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Acciones de Revisión</h2>
                  <div className="flex space-x-4">
                    <button
                      onClick={handleApproveReport}
                      className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      <Check className="w-5 h-5" />
                      <span>Aprobar Reporte Final</span>
                    </button>
                    <button
                      onClick={handleRejectReport}
                      className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      <X className="w-5 h-5" />
                      <span>Rechazar Reporte</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Status message for already processed reports */}
              {selectedRequest.status !== 'reporte_enviado' && (
                <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-800">
                    Este reporte ya ha sido procesado con el estado: {selectedRequest.status.replace(/_/g, ' ')}
                  </span>
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
            <h3 className="text-xl font-bold text-gray-800 mb-2">REPORTE PROCESADO</h3>
            <p className="text-gray-600 mb-6">La acción ha sido completada exitosamente.</p>
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

export default RevisionReportes;
