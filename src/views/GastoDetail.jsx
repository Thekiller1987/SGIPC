// src/views/GastoDetail.jsx
import React, { useState, useCallback, useEffect } from "react";
import { Container, Card, Button, Modal } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import mammoth from "mammoth";

// Modal para previsualizar documentos Word
const WordPreviewModal = ({ base64Doc, onClose }) => {
  const [htmlContent, setHtmlContent] = useState("");

  const convertWordToHtml = useCallback(async () => {
    try {
      const base64ToArrayBuffer = (base64) => {
        const parts = base64.split(",");
        const byteString = window.atob(parts[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        return ab;
      };

      const arrayBuffer = base64ToArrayBuffer(base64Doc);
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setHtmlContent(result.value);
    } catch (error) {
      console.error("Error al convertir Word a HTML:", error);
      setHtmlContent("<p>Error al mostrar la vista previa.</p>");
    }
  }, [base64Doc]);

  useEffect(() => {
    if (base64Doc) {
      convertWordToHtml();
    }
  }, [base64Doc, convertWordToHtml]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = base64Doc;
    let fileName = "documento";
    if (
      base64Doc.startsWith(
        "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      )
    ) {
      fileName += ".docx";
    } else if (base64Doc.startsWith("data:application/msword")) {
      fileName += ".doc";
    } else {
      fileName += ".docx";
    }
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal show onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Vista previa de Word</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleDownload}>
          Descargar Word
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// Modal para previsualizar documentos PDF
const PDFPreviewModal = ({ base64Doc, onClose }) => {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = base64Doc;
    link.download = "documento.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal show onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Vista previa de PDF</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <iframe
          src={base64Doc}
          title="PDF Preview"
          style={{ width: "100%", height: "80vh", border: "none" }}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleDownload}>
          Descargar PDF
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// Modal para previsualizar imágenes
const ImagePreviewModal = ({ base64Doc, onClose }) => {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = base64Doc;
    link.download = "imagen";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal show onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Vista previa de Imagen</Modal.Title>
      </Modal.Header>
      <Modal.Body className="d-flex justify-content-center">
        <img
          src={base64Doc}
          alt="Vista previa"
          style={{ maxWidth: "100%", maxHeight: "80vh" }}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleDownload}>
          Descargar Imagen
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const GastoDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { gasto, projectId, projectName } = location.state || {};

  // Declaramos todos los hooks incondicionalmente
  const [showWordModal, setShowWordModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  // Early return: si no se recibió el gasto, mostramos un mensaje de error.
  if (!gasto) {
    return (
      <Container className="mt-5 pt-5">
        <h3>Error: No se recibió un gasto para mostrar</h3>
      </Container>
    );
  }

  // Función para manejar la previsualización del documento adjunto
  const handlePreview = async () => {
    const doc = gasto.facturaBase64;
    if (!doc) return;
    if (doc.startsWith("data:image")) {
      setPreviewDoc(doc);
      setShowImageModal(true);
    } else if (doc.startsWith("data:application/pdf")) {
      setPreviewDoc(doc);
      setShowPdfModal(true);
    } else if (
      doc.startsWith(
        "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) ||
      doc.startsWith("data:application/msword")
    ) {
      setPreviewDoc(doc);
      setShowWordModal(true);
    } else {
      window.open(doc, "_blank");
    }
  };

  const handleBack = () => {
    navigate("/gastos-overview", { 
      state: { projectId, projectName } 
    });
  };

  return (
    <Container className="mt-5 pt-5">
      <Button variant="secondary" onClick={handleBack}>
        <FaArrowLeft /> Volver
      </Button>

      <Card className="mt-3">
        <Card.Header>
          <h2>Detalle de Gasto</h2>
        </Card.Header>
        <Card.Body>
         
          <p>
            <strong>Categoría:</strong> {gasto.categoria}
          </p>
          <p>
            <strong>Fecha:</strong> {gasto.fecha || "Sin fecha"}
          </p>
          <p>
            <strong>Monto:</strong> ${gasto.monto}
          </p>
          <p>
            <strong>Factura Adjunta:</strong>{" "}
            {gasto.facturaBase64 ? (
              <Button variant="link" onClick={handlePreview}>
                Previsualizar / Descargar
              </Button>
            ) : (
              "No adjunta"
            )}
          </p>
        </Card.Body>
      </Card>

      {/* Modal para previsualizar Word */}
      {showWordModal && (
        <WordPreviewModal
          base64Doc={previewDoc}
          onClose={() => setShowWordModal(false)}
        />
      )}

      {/* Modal para previsualizar PDF */}
      {showPdfModal && (
        <PDFPreviewModal
          base64Doc={previewDoc}
          onClose={() => setShowPdfModal(false)}
        />
      )}

      {/* Modal para previsualizar Imagen */}
      {showImageModal && (
        <ImagePreviewModal
          base64Doc={previewDoc}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </Container>
  );
};

export default GastoDetail;
