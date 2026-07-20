import React from 'react';
import { useNavigate } from 'react-router-dom';
import SharedSidebar from '../../components/SharedSidebar';
import { useDocenteWorkflow } from '../../context/DocenteWorkflowContext';
import { FileText, Calendar, CheckCircle, Clock } from 'lucide-react';

const Inicio = () => {
  const navigate = useNavigate();
  const { requests, getRequestsByStep } = useDocenteWorkflow();

  const solicitudesPendientes = getRequestsByStep('area_solicitudes');
  const reportesPendientes = getRequestsByStep('area_reportes');
  const historico = getRequestsByStep('historico');

  const stats = [
    { label: 'Solicitudes Pendientes', count: solicitudesPendientes.length, icon: Clock, color: 'bg-yellow-500' },
    { label: 'Reportes Pendientes', count: reportesPendientes.length, icon: FileText, color: 'bg-blue-500' },
    { label: 'Visitas Completadas', count: historico.length, icon: CheckCircle, color: 'bg-green-500' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SharedSidebar role="DOCENTE" />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Bienvenido, Docente</h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-800 mt-2">{stat.count}</p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-full`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/docente/solicitud')}
                className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
              >
                <FileText className="w-6 h-6 text-blue-600" />
                <span className="font-medium text-gray-800">Nueva Solicitud de Visita</span>
              </button>
              <button
                onClick={() => navigate('/docente/area-reportes')}
                className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition"
              >
                <Calendar className="w-6 h-6 text-green-600" />
                <span className="font-medium text-gray-800">Ver Reportes Pendientes</span>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Actividad Reciente</h2>
            {requests.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay actividad reciente</p>
            ) : (
              <div className="space-y-4">
                {requests.slice(0, 5).map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{request.titulo}</p>
                      <p className="text-sm text-gray-500">{request.institucion}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      request.status === 'visita_concretada' ? 'bg-green-100 text-green-800' :
                      request.status.includes('enviada') ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {request.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inicio;
