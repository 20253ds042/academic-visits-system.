import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SharedSidebar from '../../components/SharedSidebar';
import { useDocenteWorkflow } from '../../context/DocenteWorkflowContext';
import { Check, X, Eye, Calendar, MapPin, FileText, AlertCircle } from 'lucide-react';

const Solicitudes = () => {
  const navigate = useNavigate();
  const { requests, updateRequestStatus, moveToNextStep } = useDocenteWorkflow();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const pendingRequests = requests.filter(r => r.workflowStep === 'area_solicitudes');

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
  };

  const handleApprove = () => {
    if (!selectedRequest) return;

    updateRequestStatus(selectedRequest.id, 'solicitud_aprobada', 'Solicitud aprobada por Estadías');
    
    // Move to area_reportes workflow step so Docente can submit report
    moveToNextStep(selectedRequest.id);
    
    setSuccessMessage('SOLICITUD APROBADA CORRECTAMENTE');
    setShowSuccess(true);
    setSelectedRequest(null);

    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };

  const handleReject = () => {
    setShowRejectModal(true);
  };

  const handleRejectSubmit = () => {
    if (!selectedRequest || !rejectionReason.trim()) return;

    updateRequestStatus(selectedRequest.id, 'solicitud_rechazada', `Rechazada: ${rejectionReason}`);
    
    setSuccessMessage('SOLICITUD RECHAZADA');
    setShowSuccess(true);
    setShowRejectModal(false);
    setSelectedRequest(null);
    setRejectionReason('');

    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'solicitud_creada':
        return 'bg-yellow-100 text-yellow-800';
      case 'solicitud_enviada':
        return 'bg-blue-100 text-blue-800';
      case 'solicitud_aprobada':
        return 'bg-green-100 text-green-800';
      case 'solicitud_rechazada':
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
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Solicitudes de Visitas</h1>

          {!selectedRequest ? (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Todas las Solicitudes</h2>
              {requests.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No hay solicitudes registradas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
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
                <span>Volver a solicitudes</span>
              </button>

              {/* Request Details */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Detalles de la Solicitud</h2>
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

                {selectedRequest.participantes && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-500">Participantes</p>
                    <p className="text-gray-800">{selectedRequest.participantes}</p>
                  </div>
                )}

                {selectedRequest.presupuesto && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-500">Presupuesto Estimado</p>
                    <p className="text-gray-800">{selectedRequest.presupuesto}</p>
                  </div>
                )}

                {/* Documents */}
                {selectedRequest.documents && selectedRequest.documents.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-2">Documentos Adjuntos</p>
                    <div className="space-y-2">
                      {selectedRequest.documents.map((doc, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-800">{doc.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{doc.type.replace(/_/g, ' ')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons - Only show for pending requests */}
                {selectedRequest.workflowStep === 'area_solicitudes' && (
                  <div className="flex space-x-4 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleApprove}
                      className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      <Check className="w-5 h-5" />
                      <span>Aprobar</span>
                    </button>
                    <button
                      onClick={handleReject}
                      className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      <X className="w-5 h-5" />
                      <span>Rechazar</span>
                    </button>
                  </div>
                )}

                {/* Status message for already processed requests */}
                {selectedRequest.workflowStep !== 'area_solicitudes' && (
                  <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg mt-6">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-800">
                      Esta solicitud ya ha sido procesada y está en la etapa: {selectedRequest.workflowStep.replace(/_/g, ' ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md mx-4 w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Rechazar Solicitud</h3>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo del Rechazo
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                placeholder="Explique el motivo por el cual se rechaza esta solicitud..."
                required
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={!rejectionReason.trim()}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-red-400 disabled:cursor-not-allowed"
              >
                Confirmar Rechazo
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
            <h3 className="text-xl font-bold text-gray-800 mb-2">{successMessage}</h3>
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

export default Solicitudes;
