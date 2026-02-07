const API = "http://localhost:3000/api";

// Cargar al iniciar
document.addEventListener('DOMContentLoaded', loadTasks);

async function login() {
    const user = prompt("Usuario:");
    const pass = prompt("Contraseña:");
    const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass })
    });
    const data = await res.json();
    if (data.token) {
        localStorage.setItem('token', data.token);
        alert("¡Logueado!");
    } else {
        alert("Error de acceso");
    }
}

async function loadTasks() {
    const res = await fetch(`${API}/tasks`);
    const tasks = await res.json();
    const container = document.getElementById("taskContainer");
    container.innerHTML = '';
    tasks.forEach(t => {
        container.innerHTML += `
            <div class="task">
                <div><strong>${t.title}</strong><br><small>${t.description}</small></div>
                <button class="btn-del" onclick="deleteTask(${t.id})">X</button>
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
        alert("No tienes permiso. Inicia sesión.");
    }
});

async function deleteTask(id) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API}/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
    });
    if (res.ok) loadTasks();
    else alert("Error al eliminar");
}