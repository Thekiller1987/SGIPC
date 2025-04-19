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
      console.log("¡Conexión restablecida!");
      alert("¡Conexión restablecida!");
    };

    const handleOffline = () => {
      setIsOffline(true); // Cambia a offline
      console.log("Estás offline. Los cambios se sincronizarán cuando vuelvas a conectarte.");
      alert("Estás offline. Los cambios se sincronizarán cuando vuelvas a conectarte.");
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
  }, []); // Solo se ejecuta al montar el componente

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
