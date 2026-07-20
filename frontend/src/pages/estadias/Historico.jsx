import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SharedSidebar from '../../components/SharedSidebar';
import { useDocenteWorkflow } from '../../context/DocenteWorkflowContext';
import { History, FileText, Download, Eye, Calendar, MapPin, CheckCircle, XCircle } from 'lucide-react';

const Historico = () => {
  const navigate = useNavigate();
  const { requests } = useDocenteWorkflow();
  const [selectedRequest, setSelectedRequest] = useState(null);

  const historico = requests.filter(r => r.workflowStep === 'historico');

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'visita_concretada':
        return 'bg-green-100 text-green-800';
      case 'solicitud_rechazada':
        return 'bg-red-100 text-red-800';
      case 'solicitud_aprobada':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SharedSidebar role="ESTADÍAS" />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Histórico de Visitas</h1>

          {!selectedRequest ? (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Todas las Visitas</h2>
              {historico.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No hay visitas en el histórico</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {historico.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-semibold text-gray-800">{request.titulo}</h3>
                            {request.status === 'visita_concretada' ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600" />
                            )}
                          </div>
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
                <History className="w-5 h-5" />
                <span>Volver al histórico</span>
              </button>

              {/* Request Details */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
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
                    <p className="text-sm text-gray-500">Fecha de Completación</p>
                    <p className="font-medium text-gray-800">
                      {new Date(selectedRequest.updatedAt || selectedRequest.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-500">Propósito</p>
                  <p className="text-gray-800">{selectedRequest.proposito}</p>
                </div>

                {/* Status History Timeline */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Historial de Estados</h3>
                  <div className="space-y-4">
                    {selectedRequest.history && selectedRequest.history.map((entry, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className={`w-3 h-3 rounded-full mt-1.5 ${
                          index === selectedRequest.history.length - 1 ? 'bg-green-600' : 'bg-blue-600'
                        }`} />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{entry.status}</p>
                          <p className="text-sm text-gray-500">{new Date(entry.timestamp).toLocaleString()}</p>
                          {entry.notes && (
                            <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Documentos y Evidencias</h2>
                
                {/* Documents */}
                <div className="mb-6">
                  <h3 className="text-md font-medium text-gray-700 mb-3">Documentos</h3>
                  {selectedRequest.documents && selectedRequest.documents.length > 0 ? (
                    <div className="space-y-2">
                      {selectedRequest.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-800">{doc.name}</p>
                              <p className="text-xs text-gray-500 capitalize">{doc.type.replace(/_/g, ' ')}</p>
                            </div>
                          </div>
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No hay documentos</p>
                  )}
                </div>

                {/* Images */}
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-3">Evidencia Fotográfica</h3>
                  {selectedRequest.images && selectedRequest.images.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4">
                      {selectedRequest.images.map((img, index) => (
                        <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FileText className="w-8 h-8" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No hay evidencias fotográficas</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Historico;
