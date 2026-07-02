const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// --- DATOS REALES (Traducidos desde Kotlin) ---
const users = [
    { carnet: "00056824", pin: "123456", name: "Javier Salamanca", career: "Ingeniería en Informática" },
    { carnet: "00034124", pin: "123456", name: "Diego Hurtado", career: "Ingeniería Informática" },
    { carnet: "00042124", pin: "123456", name: "Bianca Luna", career: "Ingeniería Informática" },
    { carnet: "00183224", pin: "123456", name: "Ana Ramirez", career: "Ingeniería en Informática" },
    { carnet: "00047224", pin: "123456", name: "Rafael Rubio", career: "Ingeniería en Informática" },
    { carnet: "mjzaldana", pin: "123456", name: "Mauricio Zaldaña", career: "Ingeniería en Informática" }
];

const studyRooms = [
    // Primera Planta: 3 salas
    { id: 1, name: "Sala 1 - Nivel 1", minCapacity: 2, maxCapacity: 8, floor: 1 },
    { id: 2, name: "Sala 2 - Nivel 1", minCapacity: 2, maxCapacity: 8, floor: 1 },
    { id: 3, name: "Sala 3 - Nivel 1", minCapacity: 2, maxCapacity: 8, floor: 1 },
    
    // Segunda Planta: 3 salas y 8 cubículos individuales
    { id: 4, name: "Sala 1 - Nivel 2", minCapacity: 2, maxCapacity: 6, floor: 2 },
    { id: 5, name: "Sala 2 - Nivel 2", minCapacity: 2, maxCapacity: 6, floor: 2 },
    { id: 6, name: "Sala 3 - Nivel 2", minCapacity: 2, maxCapacity: 6, floor: 2 },
    { id: 7, name: "Cubículo Individual 1", minCapacity: 1, maxCapacity: 1, floor: 2 },
    { id: 8, name: "Cubículo Individual 2", minCapacity: 1, maxCapacity: 1, floor: 2 },
    { id: 9, name: "Cubículo Individual 3", minCapacity: 1, maxCapacity: 1, floor: 2 },
    { id: 10, name: "Cubículo Individual 4", minCapacity: 1, maxCapacity: 1, floor: 2 },
    { id: 11, name: "Cubículo Individual 5", minCapacity: 1, maxCapacity: 1, floor: 2 },
    { id: 12, name: "Cubículo Individual 6", minCapacity: 1, maxCapacity: 1, floor: 2 },
    { id: 13, name: "Cubículo Individual 7", minCapacity: 1, maxCapacity: 1, floor: 2 },
    { id: 14, name: "Cubículo Individual 8", minCapacity: 1, maxCapacity: 1, floor: 2 },

    // Tercera Planta: 4 salas, una sala recreativa y una sala de taller digital
    { id: 15, name: "Sala 1 - Nivel 3", minCapacity: 2, maxCapacity: 4, floor: 3 },
    { id: 16, name: "Sala 2 - Nivel 3", minCapacity: 2, maxCapacity: 4, floor: 3 },
    { id: 17, name: "Sala 3 - Nivel 3", minCapacity: 2, maxCapacity: 4, floor: 3 },
    { id: 18, name: "Sala 4 - Nivel 3", minCapacity: 2, maxCapacity: 4, floor: 3 },
    { id: 19, name: "Sala Recreativa", minCapacity: 1, maxCapacity: 15, floor: 3 },
    { id: 20, name: "Sala de Taller Digital", minCapacity: 1, maxCapacity: 12, floor: 3 }
];

let reservations = [];

// --- ENDPOINTS ---

// 1. Obtener todas las salas
app.get('/study-rooms', (req, res) => {
    res.json(studyRooms);
});

// 2. Obtener todos los usuarios (Útil para pruebas en la app)
app.get('/users', (req, res) => {
    res.json(users);
});

// 3. Obtener todas las reservas activas por fecha
app.get('/reservations', (req, res) => {
    const { date } = req.query;
    const filtered = reservations.filter(r => r.date === date && !r.status.includes('CANCELADA'));
    res.json(filtered);
});

// 4. Obtener reservas de un usuario específico
app.get('/users/:carnet/reservations', (req, res) => {
    const { carnet } = req.params;
    const userRes = reservations.filter(r => r.userCarnet === carnet);
    res.json(userRes);
});

// 5. Crear una nueva reserva con validaciones de negocio
app.post('/reservations', (req, res) => {
    const newRes = req.body; // Se espera { roomId, userCarnet, date, startTime, endTime, status }
    
    // Validación: Verificar si el usuario existe en el sistema
    const userExists = users.some(u => u.carnet === newRes.userCarnet);
    if (!userExists) {
        return res.status(404).json({ message: "El carnet ingresado no está registrado en el CRAI." });
    }

    // Validación: Verificar si la sala seleccionada existe
    const roomExists = studyRooms.some(room => room.id === newRes.roomId);
    if (!roomExists) {
        return res.status(404).json({ message: "La sala seleccionada no existe." });
    }

    // Asignar ID autoincremental simulado
    newRes.id = reservations.length + 1;

    // Validación de traslape de horarios
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
    console.log(`Reserva exitosa: Sala ID ${newRes.roomId} reservada por ${newRes.userCarnet}`);
    res.status(201).json(newRes);
});

// 6. Actualizar estado (Confirmar asistencia o Cancelar)
app.patch('/reservations/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.query; // Petición esperada: /reservations/1/status?status=CANCELADA
    
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