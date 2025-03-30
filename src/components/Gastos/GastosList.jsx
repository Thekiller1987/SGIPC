// src/components/Gastos/GastosList.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Table, Button, Modal } from "react-bootstrap";
import { getGastos, deleteGasto } from "../../services/gastosService";
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
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// Modal para previsualizar imágenes
const ImagePreviewModal = ({ base64Doc, onClose }) => {
  return (
    <Modal show onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Vista previa de imagen</Modal.Title>
      </Modal.Header>
      <Modal.Body className="d-flex justify-content-center">
        <img
          src={base64Doc}
          alt="Vista previa"
          style={{ maxWidth: "100%", maxHeight: "80vh" }}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const GastosList = ({ projectId }) => {
  const [gastos, setGastos] = useState([]);

  // Estados para los modales de previsualización
  const [wordPreviewDoc, setWordPreviewDoc] = useState(null);
  const [showWordModal, setShowWordModal] = useState(false);
  const [pdfPreviewDoc, setPdfPreviewDoc] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [imagePreviewDoc, setImagePreviewDoc] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const fetchGastos = async () => {
    try {
      const data = await getGastos(projectId);
      setGastos(data);
    } catch (err) {
      console.error("Error al obtener gastos:", err);
    }
  };

  useEffect(() => {
    fetchGastos();
  }, [projectId]);

  const handleDelete = async (id) => {
    try {
      await deleteGasto(id);
      fetchGastos();
    } catch (err) {
      console.error("Error al eliminar gasto:", err);
    }
  };

  const renderFacturaPreview = (facturaBase64) => {
    if (!facturaBase64) {
      return "No adjunta";
    }
    if (facturaBase64.startsWith("data:image")) {
      return (
        <Button
          variant="link"
          onClick={() => {
            setImagePreviewDoc(facturaBase64);
            setShowImageModal(true);
          }}
        >
          Previsualizar Imagen
        </Button>
      );
    } else if (facturaBase64.startsWith("data:application/pdf")) {
      return (
        <Button
          variant="link"
          onClick={() => {
            setPdfPreviewDoc(facturaBase64);
            setShowPdfModal(true);
          }}
        >
          Previsualizar PDF
        </Button>
      );
    } else if (
      facturaBase64.startsWith(
        "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) ||
      facturaBase64.startsWith("data:application/msword")
    ) {
      return (
        <Button
          variant="link"
          onClick={() => {
            setWordPreviewDoc(facturaBase64);
            setShowWordModal(true);
          }}
        >
          Previsualizar Word
        </Button>
      );
    } else {
      return (
        <a href={facturaBase64} target="_blank" rel="noopener noreferrer">
          Ver Documento
        </a>
      );
    }
  };

  return (
    <div>
      <h3>Lista de Gastos</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nombre Gasto</th>
            <th>Categoría</th>
            <th>Fecha</th>
            <th>Monto</th>
            <th>Factura Adjunta</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {gastos.map((g) => (
            <tr key={g.id}>
              <td>{g.nombreGasto}</td>
              <td>{g.categoria}</td>
              <td>{g.fecha || "Sin fecha"}</td>
              <td>{g.monto}</td>
              <td>{renderFacturaPreview(g.facturaBase64)}</td>
              <td>
                <Button variant="danger" size="sm" onClick={() => handleDelete(g.id)}>
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {showWordModal && wordPreviewDoc && (
        <WordPreviewModal base64Doc={wordPreviewDoc} onClose={() => setShowWordModal(false)} />
      )}
      {showPdfModal && pdfPreviewDoc && (
        <PDFPreviewModal base64Doc={pdfPreviewDoc} onClose={() => setShowPdfModal(false)} />
      )}
      {showImageModal && imagePreviewDoc && (
        <ImagePreviewModal base64Doc={imagePreviewDoc} onClose={() => setShowImageModal(false)} />
      )}
    </div>
  );
};

export default GastosList;
