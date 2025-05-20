// src/database/authcontext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { appfirebase } from "./firebaseconfig";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true); // 👈 para evitar redirección antes de tiempo

  const auth = getAuth(appfirebase);
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        setUserData(userSnap.exists() ? userSnap.data() : null);
      } else {
        setUserData(null);
      }

      setLoading(false); // 👈 importante: finaliza la carga
    });

    return () => unsubscribe();
  }, []);

  const logout = () => signOut(auth); // 👈 función obligatoria para cerrar sesión

  return (
    <AuthContext.Provider value={{ user, userData, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
