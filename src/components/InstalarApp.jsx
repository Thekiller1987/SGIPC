import { useEffect, useState } from "react";
import "./InstalarApp.css";

const InstalarApp = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iOS = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iOS);

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      console.log("✅ Instalación aceptada");
    } else {
      console.log("❌ Instalación cancelada");
    }
    setDeferredPrompt(null);
    setShowButton(false);
  };

  return (
    <div className="install-container">
      {showButton && !isIOS && (
        <button className="install-btn" onClick={handleInstallClick}>
          Instalar ObraTitan
        </button>
      )}

      {isIOS && (
        <div className="ios-instructions">
          Para instalar esta app en iOS:<br />
          Toca el botón <strong>Compartir</strong> y luego <strong>“Agregar a pantalla de inicio”</strong>.
        </div>
      )}
    </div>
  );
};

export default InstalarApp;
