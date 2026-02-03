import { useState, useEffect } from "react"
import { apartamentos } from "./data/apartamentos"
import RegistroAsistencia from "./components/RegistroAsistencia"
import PanelControl from "./components/PanelControl"
import { Routes, Route, Navigate } from "react-router-dom"
import PaginaVotacion from "./pages/PaginaVotacion"
import AdminQR from "./pages/AdminQR"
import AdminPanel from "./pages/AdminPanel"
import { db } from "./firebase"
import { collection, addDoc, onSnapshot } from "firebase/firestore"
import PantallaVotacion from "./pages/PantallaVotacion"

function App() {
  const [aptoSesion, setAptoSesion] = useState(null)
  const [asistentes, setAsistentes] = useState([])
  const [totalPersonas, setTotalPersonas] = useState(0)
  const [totalCoeficiente, setTotalCoeficiente] = useState(0)
  const [votosPorPregunta, setVotosPorPregunta] = useState({})
  const [votantesPorPregunta, setVotantesPorPregunta] = useState({})

  // 🔥 SINCRONIZA SESIÓN AL CARGAR LA APP
  useEffect(() => {
    const aptoGuardado = localStorage.getItem("apto")
    if (aptoGuardado) {
      setAptoSesion(aptoGuardado)
    }
  }, [])

  // 🔥 ESCUCHA ASISTENTES EN TIEMPO REAL
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "asistentes"), (snapshot) => {
      const lista = snapshot.docs.map(doc => doc.data())
      setAsistentes(lista)

      const totalPers = lista.length
      const totalCoef = lista.reduce((acc, a) => acc + a.coeficiente, 0)

      setTotalPersonas(totalPers)
      setTotalCoeficiente(totalCoef)
    })

    return () => unsub()
  }, [])

  const registrarVoto = (preguntaId, apto, opcion) => {
    const aptoNumero = Number(apto)
    const asistente = asistentes.find(a => a.apto === aptoNumero)

    if (!asistente) {
      alert("Este apartamento no registró asistencia")
      return
    }

    const yaVoto = votantesPorPregunta[preguntaId]?.includes(aptoNumero)
    if (yaVoto) {
      alert("Este apartamento ya votó en esta pregunta")
      return
    }

    const coef = asistente.coeficiente

    setVotosPorPregunta(prev => ({
      ...prev,
      [preguntaId]: {
        si: (prev[preguntaId]?.si || 0) + (opcion === "si" ? coef : 0),
        no: (prev[preguntaId]?.no || 0) + (opcion === "no" ? coef : 0),
        abstencion: (prev[preguntaId]?.abstencion || 0) + (opcion === "abstencion" ? coef : 0)
      }
    }))

    setVotantesPorPregunta(prev => ({
      ...prev,
      [preguntaId]: [...(prev[preguntaId] || []), aptoNumero]
    }))
  }

  // const registrarAsistente = async (nombre, apto) => {
  //   try {
  //     const aptoNumero = Number(apto)
  //     const aptoData = apartamentos[aptoNumero]

  //     if (!aptoData) {
  //       alert("Apartamento no válido")
  //       return false
  //     }

  //     if (asistentes.some(a => a.apto === aptoNumero)) {
  //       alert("Este apartamento ya fue registrado")
  //       return false
  //     }

  //     await addDoc(collection(db, "asistentes"), {
  //       nombre,
  //       apto: aptoNumero,
  //       coeficiente: aptoData.coeficiente
  //     });

  //     // 🔥 GUARDA SESIÓN
  //     localStorage.setItem("apto", String(aptoNumero));
  //     setAptoSesion(String(aptoNumero));

  //     return true;

  //   } catch (error) {
  //     console.error("❌ Error registrando asistente:", error)
  //     alert("Error conectando con la base de datos")
  //     return false
  //   }
  // }

  const registrarAsistente = async (nombre, apto) => {
    try {
      const aptoNumero = Number(apto);
      const aptoData = apartamentos[aptoNumero];

      if (!aptoData) {
        alert("Apartamento no válido");
        return false;
      }

      console.log("1. Intentando guardar en Firebase...");

      // Si la app se queda aquí y no pasa al paso 2, son las reglas de Firebase o conexión
      await addDoc(collection(db, "asistentes"), {
        nombre,
        apto: aptoNumero,
        coeficiente: aptoData.coeficiente,
        fecha: new Date()
      });

      console.log("2. Guardado en Firebase con éxito");

      localStorage.setItem("apto", String(aptoNumero));
      setAptoSesion(String(aptoNumero));

      console.log("3. LocalStorage actualizado:", localStorage.getItem("apto"));

      return true;

    } catch (error) {
      console.error("❌ Error real de Firebase:", error.code, error.message);
      alert("Error de conexión: " + error.message);
      return false;
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <Routes>

        {/* 🏠 Página principal */}
        <Route
          path="/"
          element={
            aptoSesion
              ? <Navigate to="/votacion" replace />
              : (
                <>
                  <h1>Sistema de Asamblea</h1>
                  <RegistroAsistencia onRegistrar={registrarAsistente} />
                  <PanelControl
                    totalPersonas={totalPersonas}
                    totalCoeficiente={totalCoeficiente}
                  />
                </>
              )
          }
        />

        {/* 🛠 Panel Admin */}
        <Route
          path="/admin"
          element={
            <AdminPanel
              asistentes={asistentes}
              totalCoeficiente={totalCoeficiente}
              votosPorPregunta={votosPorPregunta}
            />
          }
        />

        {/* 🔳 QRs */}
        <Route path="/admin/qr" element={<AdminQR />} />

        {/* 🗳 Votación de preguntas */}
        <Route
          path="/votacion/:id"
          element={
            <PaginaVotacion
              onVotar={registrarVoto}
              votos={votosPorPregunta}
              totalCoeficiente={totalCoeficiente}
            />
          }
        />

        {/* 🧍 Pantalla de espera */}
        <Route
          path="/votacion"
          element={
            aptoSesion
              ? <PantallaVotacion />
              : <Navigate to="/" replace />
          }
        />

      </Routes>
    </div>
  )
}

export default App
