return (
  <div style={{ padding: "20px" }}>
    <Routes>

      {/* 🏠 Página principal */}
      <Route
        path="/"
        element={
          <>
            <h1>Sistema de Asamblea</h1>
            <RegistroAsistencia onRegistrar={registrarAsistente} />
            <PanelControl
              totalPersonas={totalPersonas}
              totalCoeficiente={totalCoeficiente}
            />
          </>
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

    </Routes>
  </div>
)
