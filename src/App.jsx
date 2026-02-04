import { useState, useEffect } from "react"
import { apartamentos } from "./data/apartamentos"
import RegistroAsistencia from "./components/RegistroAsistencia"
import PanelControl from "./components/PanelControl"
import { Routes, Route, Navigate } from "react-router-dom"
import { db } from "./firebase"
import { collection, addDoc, onSnapshot } from "firebase/firestore"
import PantallaVotacion from "./pages/PantallaVotacion"

function App() {
  const [aptoSesion, setAptoSesion] = useState(null)
  const [asistentes, setAsistentes] = useState([])
  const [totalPersonas, setTotalPersonas] = useState(0)
  const [totalCoeficiente, setTotalCoeficiente] = useState(0)

  // 🔥 Recuperar sesión
  useEffect(() => {
    const aptoGuardado = localStorage.getItem("apto")
    if (aptoGuardado) setAptoSesion(aptoGuardado)
  }, [])

  // 🔥 Escuchar asistentes en tiempo real
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "asistentes"), (snapshot) => {
      const lista = snapshot.docs.map(doc => doc.data())
      setAsistentes(lista)

      setTotalPersonas(lista.length)
      setTotalCoeficiente(lista.reduce((acc, a) => acc + a.coeficiente, 0))
    })

    return () => unsub()
  }, [])

  const registrarAsistente = async (nombre, apto) => {
    try {
      const aptoNumero = Number(apto)
      const aptoData = apartamentos[aptoNumero]

      if (!aptoData) {
        alert("Apartamento no válido")
        return false
      }

      await addDoc(collection(db, "asistentes"), {
        nombre,
        apto: aptoNumero,
        coeficiente: aptoData.coeficiente,
        fecha: new Date()
      })

      localStorage.setItem("apto", String(aptoNumero))
      setAptoSesion(String(aptoNumero))
      return true

    } catch (error) {
      console.error("Error Firebase:", error)
      alert("Error de conexión: " + error.message)
      return false
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <Routes>

        {/* 🏠 Registro */}
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

        {/* 🗳 Pantalla principal del votante */}
        <Route
          path="/votacion"
          element={
            aptoSesion
              ? <PantallaVotacion apto={aptoSesion} />
              : <Navigate to="/" replace />
          }
        />

      </Routes>
    </div>
  )
}

export default App
