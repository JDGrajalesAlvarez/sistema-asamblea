import { useState, useEffect } from "react";
import { apartamentos } from "./data/apartamentos";
import { Routes, Route, Navigate } from "react-router-dom";
import { db } from "./firebase";
import PantallaVotacion from "./pages/PantallaVotacion";
import AdminPanel from "./pages/AdminPanel";
import PanelAdminVotacion from "./components/PanelAdminVotacion";
import { query, where, getDocs, setDoc, getDoc, doc, collection, addDoc, onSnapshot } from "firebase/firestore";
import RegistroAsistente from "./pages/RegistroAsistente"
import AdminQR from "./pages/AdminQR"
import PantallaCarga from "./pages/PantallaCarga";
import "./styles/app.css"

function App() {
  const [aptoSesion, setAptoSesion] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [asistentes, setAsistentes] = useState([]);
  const [totalPersonas, setTotalPersonas] = useState(0);
  const [totalCoeficiente, setTotalCoeficiente] = useState(0);
  const [rondaActual, setRondaActual] = useState(null);
  const [votacionActiva, setVotacionActiva] = useState(true);
  // const [hayQuorum, setHayQuorum] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "configuracion", "estadoVotacion"),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();

          setRondaActual(
            data.rondaActual !== undefined
              ? Number(data.rondaActual)
              : null
          );
          setVotacionActiva(Boolean(data.votacionActiva));
        } else {
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
    setCargandoSesion(false)
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
      return false;
    }

    const aptoNumero = Number(apto); // 👈 PRIMERO DECLARAS

    const asistente = asistentes.find(a => a.apto === aptoNumero); // 👈 DESPUÉS LO USAS

    if (!asistente) {
      alert("Este apartamento no registró asistencia");
      return false;
    }

    if (!rondaActual) {
      alert("Ronda no disponible");
      return false;
    }

    if (!votacionActiva) {
      alert("La votación está cerrada");
      return false;
    }

    const votoId = `${aptoNumero}_${rondaActual}`;
    const votoRef = doc(db, "votacion", votoId);

    const votoExistente = await getDoc(votoRef);

    if (votoExistente.exists()) {
      alert("Ya votaste en esta ronda 🚫");
      return false;
    }

    await setDoc(votoRef, {
      ronda: rondaActual,
      apto: aptoNumero,
      opcion,
      coeficiente: asistente.coeficiente,
      fecha: new Date()
    });

    alert("Voto registrado con éxito ✅");
    return true;
  };


  if (cargandoSesion) {
    return <h2>Cargand sesion...</h2>
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <Routes>
        <Route
          path="/registro"
          element={
            aptoSesion
              ? <Navigate to="/PantallaCarga" replace />
              : <RegistroAsistente onRegistrar={registrarAsistente} />
          }
        />
        <Route
          path="/PantallaCarga"
          element={<PantallaCarga totalCoeficiente={totalCoeficiente} />}
        />
        <Route
          path="/votacion"
          element={
            aptoSesion
              ? ("hayQuorum"
                ? <PantallaVotacion onVotar={registrarVoto}
                  aptoSesion={aptoSesion}
                />
                : <Navigate to="/PantallaCarga" replace />
              )
              : <Navigate to="/registro" replace />
          }
        />
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
        <Route path="/qr" element={<AdminQR />} />
      </Routes>

    </div>
  );
}

export default App