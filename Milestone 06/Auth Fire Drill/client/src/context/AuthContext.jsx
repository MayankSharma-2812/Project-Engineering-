
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // FIXED: Derive role from JWT token
  const getRoleFromToken = (token) => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role;
    } catch {
      return null;
    }
  };

  const role = getRoleFromToken(token);

  useEffect(() => {
    if (token && role) {
      setUser({ token, role });
    }
  }, [token, role]);

  const login = (data) => {
    localStorage.setItem('token', data.token);
    // FIXED: Remove role from localStorage
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    // FIXED: Remove role from localStorage
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
