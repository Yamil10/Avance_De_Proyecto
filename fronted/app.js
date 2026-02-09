const API = "/api"; 
let listaTareas = [];

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    toggleView(!!token); 
    loadTasks();
});

function toggleView(isLoggedIn) {
    const loginSection = document.getElementById('loginSection');
    const adminPanel = document.getElementById('adminPanel');

    if (isLoggedIn) {
        loginSection.classList.add('hidden');
        adminPanel.classList.remove('hidden');
    } else {
        loginSection.classList.remove('hidden');
        adminPanel.classList.add('hidden');
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
        loadTasks();
        document.getElementById('loginUser').value = '';
        document.getElementById('loginPass').value = '';
    } else {
        alert("Credenciales incorrectas");
    }
}

function logout() {
    localStorage.removeItem('token');
    toggleView(false);
    loadTasks();
}

async function loadTasks() {
    const res = await fetch(`${API}/tasks`);
    listaTareas = await res.json();
    const container = document.getElementById("taskContainer");
    container.innerHTML = '';
    
    const isUserLoggedIn = localStorage.getItem('token');

    if(listaTareas.length === 0) {
        container.innerHTML = '<p class="loading-text">No hay Productos</p>';
        return;
    }

    listaTareas.forEach(t => {
        const botonesAdmin = isUserLoggedIn ? `
            <div class="task-actions">
                <button class="btn-edit" onclick="editTask(${t.id})">Editar</button>
                <button class="btn-del" onclick="deleteTask(${t.id})">X</button>
            </div>
        ` : '';

        container.innerHTML += `
            <div class="task">
                <div class="task-info">
                    <strong>${t.title}</strong>
                    <small>${t.description}</small>
                </div>
                ${botonesAdmin}
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
        alert("Error al agregar el producto");
    }
});

async function editTask(id) {
    const token = localStorage.getItem('token');
    if (!token) return; 
    
    const tarea = listaTareas.find(t => t.id === id);
    const nuevoT = prompt("Nuevo Producto:", tarea.title);
    const nuevaD = prompt("Cantidad:", tarea.description);
    
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
    if (!token || !confirm("¿Borrar Producto?")) return;
    
    const res = await fetch(`${API}/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
    });
    
    if (res.ok) loadTasks();
}