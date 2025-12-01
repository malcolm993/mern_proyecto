// src/context/authContext.tsx - VERSIÓN CON DEBUGGING
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

interface User {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 AuthProvider iniciado - Token en localStorage:', token ? 'SI' : 'NO');
    
    if (token) {
      console.log('🔄 Verificando token y cargando perfil...');
      
      // Verificar token y cargar perfil
      authService.getProfile()
        .then(response => {
          console.log('✅ Respuesta de getProfile:', response);
          if (response.success && response.data) {
            console.log('👤 Usuario cargado:', response.data.user.name);
            setUser(response.data.user);
          } else {
            console.log('❌ getProfile no tuvo éxito:', response);
            localStorage.removeItem('token');
            setToken(null);
          }
        })
        .catch((error) => {
          console.log('🚨 Error en getProfile:', error);
          localStorage.removeItem('token');
          setToken(null);
        })
        .finally(() => {
          console.log('🏁 Carga de perfil completada');
          setIsLoading(false);
        });
    } else {
      console.log('🔓 No hay token - Usuario no autenticado');
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    console.log('🔐 Iniciando login para:', email);
    const response = await authService.login({ email, password });
    console.log('✅ Respuesta de login:', response);
    
    if (response.success && response.data) {
      const { user, token } = response.data;
      console.log('👤 Usuario autenticado:', user.name);
      console.log('🔑 Token recibido:', token ? `SI (${token.length} chars)` : 'NO');
      
      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
      
      console.log('💾 Token guardado en localStorage:', localStorage.getItem('token') ? 'SI' : 'NO');
    } else {
      console.log('❌ Login falló:', response.error);
      throw new Error(response.error || 'Error en login');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    console.log('📝 Iniciando registro para:', email);
    const response = await authService.register({ name, email, password });
    console.log('✅ Respuesta de registro:', response);
    
    if (response.success && response.data) {
      const { user, token } = response.data;
      console.log('👤 Usuario registrado:', user.name);
      
      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
    } else {
      console.log('❌ Registro falló:', response.error);
      throw new Error(response.error || 'Error en registro');
    }
  };

  const logout = () => {
    console.log('🚪 Cerrando sesión...');
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    console.log('✅ Sesión cerrada');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};