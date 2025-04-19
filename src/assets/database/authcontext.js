import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { appfirebase } from "./firebaseconfig";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine); // Detecta si está offline

  useEffect(() => {
    const auth = getAuth(appfirebase);

    // Cambia el estado de conexión a internet
    const handleOnline = () => {
      setIsOffline(false); // Cambia a online
    };

    const handleOffline = () => {
      setIsOffline(true); // Cambia a offline
    };

    window.addEventListener("online", handleOnline);  // Evento cuando está online
    window.addEventListener("offline", handleOffline); // Evento cuando está offline

    // Inicializa el estado de conexión cuando el componente se monta
    setIsOffline(!navigator.onLine);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoggedIn(!!user);
    });

    // Cleanup
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      unsubscribe();
    };
  }, []);

  const logout = async () => {
    const auth = getAuth(appfirebase);
    await signOut(auth);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, isOffline, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
