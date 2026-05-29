import { createContext, useContext, useState, useEffect } from "react";
import api from "../utility/Api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initial token check
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  // Listen for auth-change events (fired by the Axios interceptor on 401)
  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } catch (e) {
          setUser(null);
          delete api.defaults.headers.common["Authorization"];
        }
      } else {
        setUser(null);
        delete api.defaults.headers.common["Authorization"];
      }
    };

    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("focus", handleAuthChange); // check on focus (multi-tab)
    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("focus", handleAuthChange);
    };
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
    window.dispatchEvent(new Event("auth-change"));
  };

  const isAdmin = () => user && (user.role === 'admin' || user.role === 'super_admin');
  const isUser = () => user && user.role === 'user';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};