const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// --- CONFIGURACIÓN ---
const SECRET_KEY = process.env.SECRET_KEY || "mi_clave_secreta_super_segura";

// Conexión a la Base de Datos (Datos de Railway)
const db = mysql.createConnection({
    host: "yamabiko.proxy.rlwy.net",     
    user: "root",     
    password: "xOSAGQINSjGpuZLGXydRTKIfKDJNzALp", // Tu contraseña real
    database: "Avance_Proyecto", 
    port: 49183  
});

db.connect(err => {
    if (err) {
        console.error("Error conectando a Railway:", err);
    } else {
        console.log('✅ Conectado a MySQL en Railway');
    }
});

// --- SERVIR ARCHIVOS DEL FRONTEND ---
// Esto hace que tu página se vea al entrar a la URL de Render
app.use(express.static(path.join(__dirname, '../fronted')));

// --- MIDDLEWARE DE SEGURIDAD (El Guardia) ---
const verificarToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: "Acceso denegado: Falta token" });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ error: "Token inválido o expirado" });
        req.user = decoded;
        next();
    });
};

// --- RUTAS DE LA API ---

// 1. Iniciar Sesión
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    // Usuario y contraseña fijos para este ejemplo
    if (username === "Yamil" && password === "Trapaca10'") {
        const token = jwt.sign({ user: username }, SECRET_KEY, { expiresIn: '2h' });
        res.json({ token });
    } else {
        res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }
});

// 2. Obtener Tareas (Público)
app.get('/api/tasks', (req, res) => {
    db.execute('SELECT * FROM tasks ORDER BY created_at DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 3. Crear Tarea (Protegido)
app.post('/api/tasks', verificarToken, (req, res) => { 
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: "El título es obligatorio" });

    const query = "INSERT INTO tasks(title, description) VALUES (?, ?)";
    db.execute(query, [title, description], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Tarea creada", id: result.insertId });
    });
});

// 4. Eliminar Tarea (Protegido)
app.delete('/api/tasks/:id', verificarToken, (req, res) => {
    const { id } = req.params;
    db.execute('DELETE FROM tasks WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Tarea eliminada" });
    });
});

// --- RUTA FINAL PARA EL FRONTEND ---
// Cualquier ruta que no sea API, devuelve el index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../fronted', 'index.html'));
});

// --- INICIAR SERVIDOR ---
const PORT = process.env.PORT || 10000; 
app.listen(PORT, () => {
    console.log(`🚀 Servidor activo en puerto ${PORT}`);
});