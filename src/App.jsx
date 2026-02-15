import { useState, useEffect } from "react";
import { apartamentos } from "./data/apartamentos";
import RegistroAsistencia from "./components/RegistroAsistencia";
import { Routes, Route, Navigate } from "react-router-dom";
import { db } from "./firebase";
import PantallaVotacion from "./pages/PantallaVotacion";
import AdminPanel from "./pages/AdminPanel";
import PanelAdminVotacion from "./components/PanelAdminVotacion";
import { query, where, getDocs, doc, collection, addDoc, onSnapshot } from "firebase/firestore"

function App() {
  const [aptoSesion, setAptoSesion] = useState(null);
  const [asistentes, setAsistentes] = useState([]);
  const [totalPersonas, setTotalPersonas] = useState(0);
  const [totalCoeficiente, setTotalCoeficiente] = useState(0);
  const [rondaActual, setRondaActual] = useState(null);
  const [votacionActiva, setVotacionActiva] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "configuracion", "estadoVotacion"),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();

          setRondaActual(Number(data.rondaActual) || 1);
          setVotacionActiva(Boolean(data.votacionActiva));
        } else {
          // Si no existe el documento, lo creamos base
          setRondaActual(1);
          setVotacionActiva(false);
        }
      }
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    const aptoGuardado = localStorage.getItem("apto");
    if (aptoGuardado) setAptoSesion(aptoGuardado);
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "asistentes"), (snapshot) => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setAsistentes(lista);
      setTotalPersonas(lista.length);

      const sumaCoef = lista.reduce((acc, a) => acc + (Number(a.coeficiente) || 0), 0);
      setTotalCoeficiente(sumaCoef);
    })
    return () => unsub();
  }, []);

  const registrarAsistente = async (nombre, apto) => {
    try {
      const aptoNumero = Number(apto);
      const aptoData = apartamentos[aptoNumero];

      if (!aptoData) {
        alert("Apartamento no válido");
        return false;
      }

      if (asistentes.some(a => a.apto === aptoNumero)) {
        alert("Este apartamento ya fue registrado");
        return false;
      }

      await addDoc(collection(db, "asistentes"), {
        nombre,
        apto: aptoNumero,
        coeficiente: aptoData.coeficiente,
        fecha: new Date()
      });

      localStorage.setItem("apto", String(aptoNumero));
      setAptoSesion(String(aptoNumero));
      return true;
    } catch (error) {
      alert("Error de conexión: " + error.message);
      return false;
    }
  };

  const registrarVoto = async (apto, opcion) => {

    if (!apto) {
      alert("Sesión no válida");
      return;
    }

    if (!rondaActual) {
      alert("Ronda no disponible");
      return;
    }

    if (!votacionActiva) {
      alert("La votación está cerrada");
      return;
    }

    const aptoNumero = Number(apto);

    const asistente = asistentes.find(a => a.apto === aptoNumero);

    if (!asistente) {
      alert("Este apartamento no registró asistencia");
      return;
    }

    const q = query(
      collection(db, "votos"),
      where("ronda", "==", rondaActual),
      where("apto", "==", aptoNumero)
    );

    const snapshot = await getDocs(q);

    await addDoc(collection(db, "votos"), {
      ronda: rondaActual,
      apto: asistente.apto,
      nombre: asistente.nombre,   // ✅ CORRECTO
      coeficiente: asistente.coeficiente,
      opcion,
      fecha: new Date()
    });


    alert("Voto registrado con éxito ✅");
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <Routes>
        <Route path="/" element={
          aptoSesion ? <Navigate to="/votacion" replace /> : (
            <>
              <h1>🏢 Sistema de Asamblea</h1>
              <RegistroAsistencia onRegistrar={registrarAsistente} />
            </>
          )
        } />

        <Route path="/votacion" element={
          aptoSesion ? <PantallaVotacion onVotar={registrarVoto} aptoSesion={aptoSesion} /> : <Navigate to="/" replace />
        } />

        <Route path="/admin" element={
          <div className="admin-container">
            <AdminPanel
              asistentes={asistentes}
              totalCoeficiente={totalCoeficiente}
              rondaActual={rondaActual}
            />
            <PanelAdminVotacion
              rondaActual={rondaActual}
              setRondaActual={setRondaActual}
              votacionActiva={votacionActiva}
              setVotacionActiva={setVotacionActiva}
            />
          </div>
        } />
      </Routes>
    </div>
  );
}

export default App