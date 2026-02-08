const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = process.env.SECRET_KEY || "mi_clave_secreta_super_segura";

const db = mysql.createConnection({
    host: "yamabiko.proxy.rlwy.net",     
    user: "root",     
    password: "xOSAGQINSjGpuZLGXydRTKIfKDJNzALp", 
    database: "Avance_Proyecto", 
    port: 49183  
});

db.connect(err => {
    if (err) console.error(err);
    else console.log('Conectado a MySQL');
});

app.use(express.static(path.join(__dirname, '../fronted')));

const verificarToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: "No autorizado" });
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ error: "Token inválido" });
        req.user = decoded;
        next();
    });
};

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === "Yamil" && password === "Trapaca10'") {
        const token = jwt.sign({ user: username }, SECRET_KEY, { expiresIn: '2h' });
        res.json({ token });
    } else {
        res.status(401).json({ error: "Credenciales incorrectas" });
    }
});

app.get('/api/tasks', (req, res) => {
    db.execute('SELECT * FROM tasks ORDER BY created_at DESC', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.post('/api/tasks', verificarToken, (req, res) => { 
    const { title, description } = req.body;
    db.execute("INSERT INTO tasks(title, description) VALUES (?, ?)", [title, description], (err) => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ message: "Creada" });
    });
});

app.put('/api/tasks/:id', verificarToken, (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    db.execute("UPDATE tasks SET title = ?, description = ? WHERE id = ?", [title, description, id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Actualizada" });
    });
});

app.delete('/api/tasks/:id', verificarToken, (req, res) => {
    db.execute('DELETE FROM tasks WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Eliminada" });
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../fronted', 'index.html'));
});

const PORT = process.env.PORT || 10000; 
app.listen(PORT, () => console.log(`Puerto ${PORT}`));