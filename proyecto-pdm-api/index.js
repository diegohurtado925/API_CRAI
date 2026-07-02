const express = require('express');const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// --- DATOS DE PRUEBA (Sustituir por DB real como MongoDB o PostgreSQL después) ---
let studyRooms = [
    { id: 1, name: "Sala de Estudio A", minCapacity: 2, maxCapacity: 6, floor: 1 },
    { id: 2, name: "Sala de Estudio B", minCapacity: 2, maxCapacity: 4, floor: 1 },
    { id: 3, name: "Cubículo Individual 1", minCapacity: 1, maxCapacity: 1, floor: 2 },
    { id: 4, name: "Sala de Conferencias", minCapacity: 5, maxCapacity: 12, floor: 3 },
];

let reservations = [];

// --- ENDPOINTS ---

// 1. Obtener todas las salas
app.get('/study-rooms', (req, res) => {
    res.json(studyRooms);
});

// 2. Obtener todas las reservas activas por fecha
app.get('/reservations', (req, res) => {
    const { date } = req.query;
    const filtered = reservations.filter(r => r.date === date && !r.status.includes('CANCELADA'));
    res.json(filtered);
});

// 3. Obtener reservas de un usuario específico
app.get('/users/:carnet/reservations', (req, res) => {
    const { carnet } = req.params;
    const userRes = reservations.filter(r => r.userCarnet === carnet);
    res.json(userRes);
});

// 4. Crear una nueva reserva con validaciones de negocio
app.post('/reservations', (req, res) => {
    const newRes = req.body;
    
    // Asignar ID (simulado)
    newRes.id = reservations.length + 1;

    // Validación de traslape básica
    const hasOverlap = reservations.some(r => 
        r.roomId === newRes.roomId && 
        r.date === newRes.date && 
        !r.status.includes('CANCELADA') &&
        newRes.startTime < r.endTime && newRes.endTime > r.startTime
    );

    if (hasOverlap) {
        return res.status(409).json({ message: "Horario ya ocupado en el servidor." });
    }

    reservations.push(newRes);
    console.log(`Reserva creada: Sala ${newRes.roomId} por ${newRes.userCarnet}`);
    res.status(201).json(newRes);
});

// 5. Actualizar estado (Confirmar asistencia o Cancelar)
app.patch('/reservations/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.query;
    
    const index = reservations.findIndex(r => r.id == id);
    if (index !== -1) {
        reservations[index].status = status;
        return res.json(reservations[index]);
    }
    res.status(404).json({ message: "Reserva no encontrada" });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
