import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';

const DocenteLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Mock authentication for multiple roles
    setTimeout(() => {
      const validCredentials = [
        { email: 'docente@university.edu', password: 'password123', role: 'DOCENTE', name: 'Juan Pérez' },
        { email: 'studyabroad@university.edu', password: 'password123', role: 'ESTADÍAS', name: 'Emily Brown' },
        { email: 'director@university.edu', password: 'password123', role: 'DIRECTOR', name: 'Robert Williams' },
        { email: 'admin@university.edu', password: 'password123', role: 'ADMINISTRADOR', name: 'System Administrator' },
        { email: 'instructor1@university.edu', password: 'password123', role: 'DOCENTE', name: 'John Smith' },
      ];

      const validUser = validCredentials.find(
        cred => cred.email === email && cred.password === password
      );

      if (validUser) {
        localStorage.setItem('userRole', validUser.role);
        localStorage.setItem('userName', validUser.name);
        localStorage.setItem('userEmail', validUser.email);
        
        // Redirect based on role
        switch (validUser.role) {
          case 'DOCENTE':
            navigate('/docente/inicio');
            break;
          case 'ESTADÍAS':
            navigate('/estadias/inicio');
            break;
          case 'DIRECTOR':
            navigate('/dashboard'); // Use existing dashboard route
            break;
          case 'ADMINISTRADOR':
            navigate('/dashboard'); // Use existing dashboard route
            break;
          default:
            navigate('/docente/inicio');
        }
      } else {
        setError('Credenciales inválidas');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Logo and Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 rounded-full p-4 mb-4">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Sistema de Visitas Académicas</h1>
          <p className="text-gray-600 mt-2">Inicio de Sesión</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="correo@institucion.edu"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition pr-12"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="ml-2 text-sm text-gray-600">Recordarme</span>
            </label>
            <a href="#" className="text-sm text-blue-600 hover:underline">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿No tienes una cuenta?{' '}
            <a href="#" className="text-blue-600 font-semibold hover:underline">
              Contacta al administrador
            </a>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            © 2024 Sistema de Visitas Académicas
          </p>
        </div>
      </div>
    </div>
  );
};

export default DocenteLogin;
