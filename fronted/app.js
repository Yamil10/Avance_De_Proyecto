const API = "/api"; 
let listaTareas = [];

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if(token) toggleView(true);
    else toggleView(false);
    loadTasks();
});

function toggleView(isLoggedIn) {
    const loginSection = document.getElementById('loginSection');
    const mainApp = document.getElementById('mainApp');
    if (isLoggedIn) {
        loginSection.classList.add('hidden');
        mainApp.classList.remove('hidden');
    } else {
        loginSection.classList.remove('hidden');
        mainApp.classList.add('hidden');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUser').value;
    const password = document.getElementById('loginPass').value;
    const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.token) {
        localStorage.setItem('token', data.token);
        toggleView(true);
    } else {
        alert("Acceso denegado");
    }
}

function logout() {
    localStorage.removeItem('token');
    toggleView(false);
}

async function loadTasks() {
    const res = await fetch(`${API}/tasks`);
    listaTareas = await res.json();
    const container = document.getElementById("taskContainer");
    container.innerHTML = '';
    listaTareas.forEach(t => {
        container.innerHTML += `
            <div class="task">
                <div class="task-info">
                    <strong>${t.title}</strong>
                    <small>${t.description}</small>
                </div>
                <div class="task-actions">
                    <button class="btn-edit" onclick="editTask(${t.id})">Editar</button>
                    <button class="btn-del" onclick="deleteTask(${t.id})">X</button>
                </div>
            </div>`;
    });
}

document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch(`${API}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({
            title: document.getElementById('title').value,
            description: document.getElementById('desc').value
        })
    });
    if (res.ok) {
        document.getElementById('taskForm').reset();
        loadTasks();
    } else {
        alert("No autorizado");
    }
});

async function editTask(id) {
    const token = localStorage.getItem('token');
    if (!token) return alert("Inicia sesión");
    const tarea = listaTareas.find(t => t.id === id);
    const nuevoT = prompt("Nuevo título:", tarea.title);
    const nuevaD = prompt("Nueva descripción:", tarea.description);
    if (!nuevoT) return;
    const res = await fetch(`${API}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ title: nuevoT, description: nuevaD })
    });
    if (res.ok) loadTasks();
}

async function deleteTask(id) {
    const token = localStorage.getItem('token');
    if (!token || !confirm("¿Borrar?")) return;
    const res = await fetch(`${API}/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
    });
    if (res.ok) loadTasks();
}