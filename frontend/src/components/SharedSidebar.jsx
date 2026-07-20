import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, FileText, ClipboardList, History, LogOut, User, Users, Settings } from 'lucide-react';

const SharedSidebar = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = localStorage.getItem('userRole') || role;
  const userName = localStorage.getItem('userName') || 'Usuario';

  const menuItemsByRole = {
    DOCENTE: [
      { id: 'inicio', label: 'Inicio', icon: Home, path: '/docente/inicio' },
      { id: 'solicitud', label: 'Solicitud', icon: FileText, path: '/docente/solicitud' },
      { id: 'reporte', label: 'Reporte', icon: ClipboardList, path: '/docente/area-reportes' },
      { id: 'historico', label: 'Histórico', icon: History, path: '/docente/historico' },
    ],
    ESTADÍAS: [
      { id: 'inicio', label: 'Inicio', icon: Home, path: '/estadias/inicio' },
      { id: 'solicitudes', label: 'Solicitudes', icon: FileText, path: '/estadias/solicitudes' },
      { id: 'revision-reportes', label: 'Revisión Reportes', icon: ClipboardList, path: '/estadias/revision-reportes' },
      { id: 'historico', label: 'Histórico', icon: History, path: '/estadias/historico' },
    ],
    DIRECTOR: [
      { id: 'inicio', label: 'Inicio', icon: Home, path: '/director/inicio' },
      { id: 'aprobadas', label: 'Visitas Aprobadas', icon: FileText, path: '/director/aprobadas' },
      { id: 'historico', label: 'Histórico', icon: History, path: '/director/historico' },
    ],
    ADMINISTRADOR: [
      { id: 'inicio', label: 'Inicio', icon: Home, path: '/admin/inicio' },
      { id: 'usuarios', label: 'Usuarios', icon: Users, path: '/admin/usuarios' },
      { id: 'solicitudes', label: 'Solicitudes', icon: FileText, path: '/admin/solicitudes' },
      { id: 'historico', label: 'Histórico', icon: History, path: '/admin/historico' },
      { id: 'configuracion', label: 'Configuración', icon: Settings, path: '/admin/configuracion' },
    ],
  };

  const menuItems = menuItemsByRole[userRole] || menuItemsByRole.DOCENTE;

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    // Only remove user session data, preserve requests data
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    navigate('/docente/login');
  };

  return (
    <div className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 min-h-screen flex flex-col text-white">
      {/* User Profile Section */}
      <div className="p-6 border-b border-blue-700">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-3">
            <User className="w-10 h-10 text-blue-200" />
          </div>
          <h3 className="font-semibold text-lg">{userName}</h3>
          <span className="text-blue-300 text-sm font-medium bg-blue-700 px-3 py-1 rounded-full mt-2">
            {userRole}
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    active
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-blue-200 hover:bg-blue-700 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-blue-300'}`} />
                  <span className="font-medium">{item.label}</span>
                  {active && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-blue-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
};

export default SharedSidebar;
