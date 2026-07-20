import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DocenteWorkflowProvider } from './context/DocenteWorkflowContext';
import Login from './pages/Login';
import Register from './pages/Register';
import DocenteLogin from './pages/DocenteLogin';
import Dashboard from './pages/Dashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import DirectorDashboard from './pages/DirectorDashboard';
import StudyAbroadDashboard from './pages/StudyAbroadDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CreateVisit from './pages/CreateVisit';
import VisitDetails from './pages/VisitDetails';
import Inicio from './pages/docente/Inicio';
import Solicitud from './pages/docente/Solicitud';
import AreaSolicitudes from './pages/docente/AreaSolicitudes';
import AreaReportes from './pages/docente/AreaReportes';
import Historico from './pages/docente/Historico';
import EstadiasInicio from './pages/estadias/Inicio';
import EstadiasSolicitudes from './pages/estadias/Solicitudes';
import EstadiasHistorico from './pages/estadias/Historico';
import EstadiasRevisionReportes from './pages/estadias/RevisionReportes';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

const RoleBasedDashboard = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  
  switch (user.role) {
    case 'Instructor':
      return <InstructorDashboard />;
    case 'Director':
      return <DirectorDashboard />;
    case 'StudyAbroad':
      return <StudyAbroadDashboard />;
    case 'Administrator':
      return <AdminDashboard />;
    default:
      return <Navigate to="/login" />;
  }
};

function App() {
  return (
    <AuthProvider>
      <DocenteWorkflowProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Docente Routes */}
            <Route path="/docente/login" element={<DocenteLogin />} />
            <Route
              path="/docente/*"
              element={
                <Routes>
                  <Route path="inicio" element={<Inicio />} />
                  <Route path="solicitud" element={<Solicitud />} />
                  <Route path="area-solicitudes" element={<AreaSolicitudes />} />
                  <Route path="area-reportes" element={<AreaReportes />} />
                  <Route path="historico" element={<Historico />} />
                  <Route path="" element={<Navigate to="/docente/inicio" />} />
                </Routes>
              }
            />
            
            {/* Estadías Routes */}
            <Route
              path="/estadias/*"
              element={
                <Routes>
                  <Route path="inicio" element={<EstadiasInicio />} />
                  <Route path="solicitudes" element={<EstadiasSolicitudes />} />
                  <Route path="revision-reportes" element={<EstadiasRevisionReportes />} />
                  <Route path="historico" element={<EstadiasHistorico />} />
                  <Route path="" element={<Navigate to="/estadias/inicio" />} />
                </Routes>
              }
            />
            
            {/* Original Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <RoleBasedDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-visit" 
              element={
                <ProtectedRoute allowedRoles={['Instructor', 'Administrator']}>
                  <CreateVisit />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/visit/:id" 
              element={
                <ProtectedRoute>
                  <VisitDetails />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/docente/login" />} />
          </Routes>
        </Router>
      </DocenteWorkflowProvider>
    </AuthProvider>
  );
}

export default App;
