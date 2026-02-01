import { useState } from "react"
import { apartamentos } from "./data/apartamentos"
import RegistroAsistencia from "./components/RegistroAsistencia"
import PanelControl from "./components/PanelControl"
import { Routes, Route } from "react-router-dom"
import PaginaVotacion from "./pages/PaginaVotacion"
import AdminQR from "./pages/AdminQR"
import AdminPanel from "./pages/AdminPanel"

function App() {
  const [asistentes, setAsistentes] = useState([])
  const [totalPersonas, setTotalPersonas] = useState(0)
  const [totalCoeficiente, setTotalCoeficiente] = useState(0)
  const [votosPorPregunta, setVotosPorPregunta] = useState({})
  const [votantesPorPregunta, setVotantesPorPregunta] = useState({})

  const registrarVoto = (preguntaId, apto, opcion) => {
    const asistente = asistentes.find(a => a.apto == apto)
    if (!asistente) {
      alert("Este apartamento no registró asistencia")
      return
    }

    const yaVoto = votantesPorPregunta[preguntaId]?.includes(apto)
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
      [preguntaId]: [...(prev[preguntaId] || []), apto]
    }))
  }

  const registrarAsistente = (nombre, apto) => {
    const aptoData = apartamentos[apto]

    if (!aptoData) {
      alert("Apartamento no válido")
      return
    }

    if (asistentes.some(a => a.apto === apto)) {
      alert("Este apartamento ya fue registrado")
      return
    }

    const nuevo = {
      nombre,
      apto,
      coeficiente: aptoData.coeficiente
    }

    setAsistentes([...asistentes, nuevo])
    setTotalPersonas(prev => prev + 1)
    setTotalCoeficiente(prev => prev + aptoData.coeficiente)
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Sistema de Asamblea</h1>

      <RegistroAsistencia onRegistrar={registrarAsistente} />

      <PanelControl
        totalPersonas={totalPersonas}
        totalCoeficiente={totalCoeficiente}
      />

      <Routes>
        <Route path="/admin" element={<AdminQR />} />
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
      </Routes>
    </div>
  )
}

export default App
