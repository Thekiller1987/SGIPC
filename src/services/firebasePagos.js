// src/services/firebasePagos.js
import { collection, addDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "../database/firebaseconfig";

export const registrarPagoComoGasto = async (pago, projectId) => {
  const fechaStr = pago.fecha.toISOString().split('T')[0];

  // 1. Crear gasto
  const gastoData = {
    tipo: "gasto",
    categoria: pago.metodoPago || "Pago",
    proveedorEmpleado: pago.proveedorEmpleado,
    monto: parseFloat(pago.monto),
    moneda: pago.moneda === "C$" ? "NIO" : pago.moneda,
    fecha: fechaStr,
    projectId,
    esPago: true,
    createdAt: Timestamp.now(),
  };

  const gastoRef = await addDoc(collection(db, "gastos"), gastoData);

  // 2. Crear pago con referencia a gastoId
  const pagoDoc = {
    proveedorEmpleado: pago.proveedorEmpleado,
    metodoPago: pago.metodoPago,
    monto: parseFloat(pago.monto),
    moneda: pago.moneda,
    fecha: Timestamp.fromDate(pago.fecha),
    creado: Timestamp.now(),
    projectId,
    gastoId: gastoRef.id, // Relación directa
  };

  await addDoc(collection(db, "pagos"), pagoDoc);

  // 3. Guardar en subcolección del proyecto (opcional)
  const subref = collection(doc(db, "projects", projectId), "pagos");
  await addDoc(subref, gastoData);
};
