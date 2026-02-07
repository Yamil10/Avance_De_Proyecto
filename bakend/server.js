const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// bakend/server.js
const db = mysql.createConnection({
    host: "yamabiko.proxy.rlwy.net",     // Variable de Railway
    user: "root",     // Variable de Railway
    password: "xOSAGQINSjGpuZLGXydRTKIfKDJNzALp", // Variable de Railway
    database: "Avance_Proyecto", // Variable de Railway
    port: 49183  // Puerto de Railway
});

// El puerto del servidor NO debe ser fijo (3000), Render te asigna uno
const PORT = process.env.PORT || 49183; 
app.listen(PORT, () => console.log(`Servidor activo en puerto ${PORT}`));

db.connect(err => {
    if (err) console.error("Error DB:", err);
    else console.log('Conectado a MySQL');
});

// Middleware para proteger rutas
const verificarToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: "No autorizado" });

    jwt.verify(token, SECRET_KEY, (err) => {
        if (err) return res.status(401).json({ error: "Token inválido" });
        next();
    });
};

// Login simple
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === "Yamil" && password === "Trapaca10'") {
        const token = jwt.sign({ user: username }, SECRET_KEY);
        res.json({ token });
    } else {
        res.status(401).json({ error: "Credenciales incorrectas" });
    }
});

// Obtener tareas (Público)
app.get('/api/tasks', (req, res) => {
    db.execute('SELECT * FROM tasks ORDER BY created_at DESC', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Crear tarea (Protegido)
app.post('/api/tasks', verificarToken, (req, res) => { 
    const { title, description } = req.body;
    db.execute("INSERT INTO tasks(title, description) VALUES (?, ?)", [title, description], (err) => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ message: "Tarea creada" });
    });
});

// Eliminar tarea (Protegido)
app.delete('/api/tasks/:id', verificarToken, (req, res) => {
    db.execute('DELETE FROM tasks WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Tarea eliminada" });
    });
});