import { useState, useEffect } from "react"
import { apartamentos } from "./data/apartamentos"
import RegistroAsistencia from "./components/RegistroAsistencia"
import PanelControl from "./components/PanelControl"
import { Routes, Route } from "react-router-dom"
import PaginaVotacion from "./pages/PaginaVotacion"
import AdminQR from "./pages/AdminQR"
import AdminPanel from "./pages/AdminPanel"
import { db } from "./firebase"
import { collection, addDoc, onSnapshot } from "firebase/firestore"
import PantallaVotacion from "./pages/PantallaVotacion"
import { Navigate } from "react-router-dom"


function App() {
  const [aptoSesion, setAptoSesion] = useState(() => localStorage.getItem("apto"))
  const [asistentes, setAsistentes] = useState([])
  const [totalPersonas, setTotalPersonas] = useState(0)
  const [totalCoeficiente, setTotalCoeficiente] = useState(0)
  const [votosPorPregunta, setVotosPorPregunta] = useState({})
  const [votantesPorPregunta, setVotantesPorPregunta] = useState({})

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

  const registrarAsistente = async (nombre, apto) => {
    const aptoNumero = Number(apto)
    const aptoData = apartamentos[aptoNumero]

    if (!aptoData) {
      alert("Apartamento no válido")
      return false
    }

    if (asistentes.some(a => a.apto === aptoNumero)) {
      alert("Este apartamento ya fue registrado")
      return false
    }

    await addDoc(collection(db, "asistentes"), {
      nombre,
      apto: aptoNumero,
      coeficiente: aptoData.coeficiente
    })

    localStorage.setItem("apto", String(aptoNumero))
    setAptoSesion(String(aptoNumero)) // 🔥 ESTO DISPARA EL RE-RENDER
    return true

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
        {/* 🗳 Votación */}
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
        <Route
          path="/votacion"
          element={
            localStorage.getItem("apto")
              ? <PantallaVotacion />
              : <Navigate to="/" replace />
          }
        />
      </Routes>
    </div>
  )
}

export default App
