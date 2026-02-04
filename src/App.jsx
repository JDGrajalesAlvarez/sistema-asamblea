import { useState, useEffect } from "react";
import { apartamentos } from "./data/apartamentos";
import RegistroAsistencia from "./components/RegistroAsistencia";
import PanelControl from "./components/PanelControl";
import { Routes, Route, Navigate } from "react-router-dom";
import { db } from "./firebase";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import PantallaVotacion from "./pages/PantallaVotacion";
import AdminPanel from "./pages/AdminPanel";
import PanelAdminVotacion from "./components/PanelAdminVotacion";


function App() {
  const [aptoSesion, setAptoSesion] = useState(null);
  const [asistentes, setAsistentes] = useState([]);
  const [totalPersonas, setTotalPersonas] = useState(0);
  const [totalCoeficiente, setTotalCoeficiente] = useState(0);
  const [rondaActual, setRondaActual] = useState(1);
  const [votacionActiva, setVotacionActiva] = useState(true);
  const [votosPorRonda, setVotosPorRonda] = useState({});
  const [votantesPorRonda, setVotantesPorRonda] = useState({});

  useEffect(() => {
    const aptoGuardado = localStorage.getItem("apto");
    if (aptoGuardado) setAptoSesion(aptoGuardado);
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "asistentes"), (snapshot) => {
      const lista = snapshot.docs.map(doc => doc.data());
      setAsistentes(lista);
      setTotalPersonas(lista.length);
      const sumaCoef = lista.reduce((acc, a) => acc + (Number(a.coeficiente) || 0), 0);
      setTotalCoeficiente(sumaCoef);
    });
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

  const registrarVoto = (apto, opcion) => {
    if (String(aptoNumero) !== String(aptoSesion)) {
      return alert("Sesión inválida");
    }
    if (!votacionActiva) return alert("La votación está cerrada");

    const aptoNumero = Number(apto);
    const asistente = asistentes.find(a => a.apto === aptoNumero);

    if (!asistente) return alert("Este apartamento no registró asistencia");

    const yaVoto = votantesPorRonda[rondaActual]?.includes(aptoNumero);
    if (yaVoto) return alert("Este apartamento ya votó en esta ronda");

    const coef = asistente.coeficiente;

    setVotosPorRonda(prev => ({
      ...prev,
      [rondaActual]: {
        si: (prev[rondaActual]?.si || 0) + (opcion === "si" ? coef : 0),
        no: (prev[rondaActual]?.no || 0) + (opcion === "no" ? coef : 0),
        blanco: (prev[rondaActual]?.blanco || 0) + (opcion === "blanco" ? coef : 0)
      }
    }));

    setVotantesPorRonda(prev => ({
      ...prev,
      [rondaActual]: [...(prev[rondaActual] || []), aptoNumero]
    }));

    alert("Voto registrado con éxito");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <Routes>
        <Route path="/" element={
          aptoSesion ? <Navigate to="/votacion" replace /> : (
            <>
              <h1>🏢 Sistema de Asamblea</h1>
              <RegistroAsistencia onRegistrar={registrarAsistente} />
              <PanelControl totalPersonas={totalPersonas} totalCoeficiente={totalCoeficiente} />
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
              votosPorRonda={votosPorRonda}
              rondaActual={rondaActual}
            />
            <PanelAdminVotacion
              rondaActual={rondaActual}
              setRondaActual={setRondaActual}
              votacionActiva={votacionActiva}
              setVotacionActiva={setVotacionActiva}
              votosPorRonda={votosPorRonda}
            />
          </div>
        } />
      </Routes>
    </div>
  );
}

export default App