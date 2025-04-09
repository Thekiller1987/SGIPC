// src/components/Presupuesto/PresupuestoCalculator.jsx
import React, { useEffect, useState } from "react";
import MaterialForm from "./MaterialForm";
import MaterialList from "./MaterialList";
import { db } from "../../database/firebaseconfig";
import { collection, addDoc, getDocs } from "firebase/firestore";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useProject } from "../../context/ProjectContext"; // ✅

const PresupuestoCalculator = () => {
  const { project } = useProject(); // ✅
  const projectId = project?.id;    // ✅

  const [materiales, setMateriales] = useState([]);
  const [predefinidos, setPredefinidos] = useState([]);
  const [estructuras, setEstructuras] = useState([]);

  useEffect(() => {
    const cargarDatos = async () => {
      const materialesSnapshot = await getDocs(collection(db, "materialesPredefinidos"));
      const estructurasSnapshot = await getDocs(collection(db, "estructuras"));

      setPredefinidos(materialesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setEstructuras(estructurasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    cargarDatos();
  }, []);

  const agregarMaterial = (material) => {
    setMateriales([...materiales, material]);
  };

  const eliminarMaterial = (index) => {
    setMateriales(materiales.filter((_, i) => i !== index));
  };

  const calcularTotal = () =>
    materiales.reduce((acc, mat) => acc + mat.precio * mat.cantidad, 0);

  const guardarPresupuestoEnFirebase = async () => {
    if (!projectId) {
      alert("No se ha seleccionado un proyecto válido.");
      return;
    }

    try {
      await addDoc(collection(db, `projects/${projectId}/presupuestos`), {
        materiales,
        total: calcularTotal(),
        creado: new Date()
      });
      alert("Presupuesto guardado con éxito ✅");
    } catch (error) {
      console.error("Error al guardar: ", error);
    }
  };

  const generarPDF = async () => {
    const input = document.getElementById("presupuesto-container");
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("presupuesto.pdf");
  };

  const agregarEstructura = (estructura) => {
    const materialesConvertidos = estructura.materiales.map(mat => ({
      ...mat,
      precio: parseFloat(mat.precio),
      cantidad: parseFloat(mat.cantidad),
    }));
    setMateriales([...materiales, ...materialesConvertidos]);
  };

  return (
    <div className="calculadora-container" id="presupuesto-container">
      {!projectId && <p style={{ color: "red" }}>Error: No se recibió el ID del proyecto.</p>}
      {projectId && (
        <>
          <MaterialForm
            onAgregar={agregarMaterial}
            predefinidos={predefinidos}
            estructuras={estructuras}
            onAgregarEstructura={agregarEstructura}
          />
          <MaterialList materiales={materiales} onEliminar={eliminarMaterial} />
          <div className="total-container">
            <h3>Total: C${calcularTotal().toFixed(2)}</h3>
          </div>
          <div className="acciones">
            <button onClick={generarPDF} className="btn-pdf">Exportar PDF</button>
            <button onClick={guardarPresupuestoEnFirebase} className="btn-guardar">Guardar Presupuesto</button>
          </div>
        </>
      )}
    </div>
  );
};

export default PresupuestoCalculator;
