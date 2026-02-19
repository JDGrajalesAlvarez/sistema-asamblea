import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/Registro.css"
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { apartamentos } from "../data/apartamentos";

function RegistroAsistente({ onRegistrar }) {
    const [nombre, setNombre] = useState("")
    const [apto, setApto] = useState("")
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!nombre || !apto) {
            alert("Por favor completa todos los campos")
            return
        }

        const exito = await onRegistrar(nombre, apto)

        if (exito) {
            navigate("/PantallaCarga")
        }
    }


    // Comienzo del Script


    // const poblarAsistentesPrueba = async () => {
    //     console.log("🚀 Iniciando registro masivo...");

    //     try {
    //         // 1. Obtener los ya registrados para evitar duplicados
    //         const snapshot = await getDocs(collection(db, "asistentes"));
    //         const registrados = snapshot.docs.map(doc => doc.data().apto);

    //         // 2. Convertir el objeto de apartamentos en un array y tomar los primeros 60
    //         const listaAptos = Object.entries(apartamentos);
    //         let contador = 0;

    //         for (const [apto, data] of listaAptos) {
    //             if (contador >= 80) break; // Detenerse al llegar a 60

    //             const aptoNum = Number(apto);

    //             // 3. Si no está registrado, lo agregamos
    //             if (!registrados.includes(aptoNum)) {
    //                 await addDoc(collection(db, "asistentes"), {
    //                     nombre: `Propietario Apto ${aptoNum}`,
    //                     apto: aptoNum,
    //                     coeficiente: data.coeficiente,
    //                     fecha: new Date()
    //                 });
    //                 console.log(`✅ Registrado: ${aptoNum}`);
    //                 contador++;
    //             } else {
    //                 console.log(`⚠️ Saltado (ya existe): ${aptoNum}`);
    //             }
    //         }

    //         alert(`¡Éxito! Se registraron ${contador} nuevos asistentes.`);
    //     } catch (error) {
    //         console.error("Error en el registro masivo:", error);
    //         alert("Error: " + error.message);
    //     }
    // };


    // Fin del Script


    return (
        <div className="contenedor">
            <div className="card">
                <h2>Registro de Asistencia</h2>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Nombre completo"
                        value={nombre}
                        onChange={e => setNombre(e.target.value)}
                        required
                        className="input"
                    />

                    <input
                        type="number"
                        placeholder="Número de apartamento"
                        value={apto}
                        onChange={e => setApto(e.target.value)}
                        required
                        className="input"
                    />

                    <button type="submit" className="button">
                        Registrar
                    </button>

                    {/* // boton de script */}

                    {/* <button onClick={poblarAsistentesPrueba} style={{ background: "grey", color: "yellow", marginTop: "10px", fontSize: "15px" }}>⚙️ Generar 60 Asistentes de Prueba</button> */}

                    {/* // boton de script */}

                </form>
            </div>
        </div>
    );


}

export default RegistroAsistente
