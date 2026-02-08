const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();

// 1. CONFIGURACIÓN DE CORS (DEBE IR ANTES QUE LAS RUTAS)
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const SECRET_KEY = process.env.SECRET_KEY || "LolCaballo";

// 2. CONEXIÓN A LA BASE DE DATOS
const db = mysql.createConnection({
    host: "yamabiko.proxy.rlwy.net",     
    user: "root",     
    password: "xOSAGQINSjGpuZLGXydRTKIfKDJNzALp", 
    database: "Avance_Proyecto", 
    port: 49183  
});

db.connect(err => {
    if (err) {
        console.error("Error de conexión a MySQL:", err);
    } else {
        console.log('Conectado a MySQL exitosamente');
    }
});

// 3. ARCHIVOS ESTÁTICOS (Asegúrate que la carpeta se llame 'fronted')
app.use(express.static(path.join(__dirname, '../fronted')));

// 4. MIDDLEWARE DE AUTENTICACIÓN
const verificarToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: "No autorizado" });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ error: "Token inválido" });
        req.user = decoded;
        next();
    });
};

// 5. RUTAS DE LA API
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === "Yamil/Sebastian" && password === "Equipo") {
        const token = jwt.sign({ user: username }, SECRET_KEY, { expiresIn: '2h' });
        res.json({ token });
    } else {
        res.status(401).json({ error: "Credenciales incorrectas" });
    }
});

app.get('/api/tasks', (req, res) => {
    db.execute('SELECT * FROM tasks ORDER BY created_at DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/tasks', verificarToken, (req, res) => { 
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: "El título es obligatorio" });

    const query = "INSERT INTO tasks(title, description) VALUES (?, ?)";
    db.execute(query, [title, description], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Creada" });
    });
});

app.put('/api/tasks/:id', verificarToken, (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: "El título es obligatorio" });

    const query = "UPDATE tasks SET title = ?, description = ? WHERE id = ?";
    db.execute(query, [title, description, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Actualizada" });
    });
});

app.delete('/api/tasks/:id', verificarToken, (req, res) => {
    const { id } = req.params;
    db.execute('DELETE FROM tasks WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Eliminada" });
    });
});

// REDIRECCIÓN PARA RUTAS NO DEFINIDAS
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../fronted', 'index.html'));
});

// 6. INICIO DEL SERVIDOR
const PORT = process.env.PORT || 10000; 
app.listen(PORT, () => {
    console.log(`Servidor en puerto ${PORT}`);
});