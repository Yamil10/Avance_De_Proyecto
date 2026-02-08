const API = "https://avance-de-proyecto-cq33.onrender.com/api";
let editId = null;

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
    try {
        const res = await fetch(`${API}/tasks`);
        if (!res.ok) throw new Error("No se pudo conectar con el servidor");
        const tasks = await res.json();
        
        const container = document.getElementById("taskContainer");
        container.innerHTML = '';

        if (tasks.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:gray;">No hay tareas guardadas.</p>';
            return;
        }

        tasks.forEach(t => {
            container.innerHTML += `
                <div class="task">
                    <div class="task-info">
                        <strong>${t.title}</strong><br><small>${t.description}</small>
                    </div>
                    <div class="task-actions">
                        <button class="btn-edit" onclick="prepareEdit(${t.id}, '${t.title}', '${t.description}')">✏️</button>
                        <button class="btn-del" onclick="deleteTask(${t.id})">X</button>
                    </div>
                </div>`;
        });
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("taskContainer").innerHTML = "Error al cargar tareas.";
    }
}

function prepareEdit(id, title, desc) {
    editId = id;
    document.getElementById('title').value = title;
    document.getElementById('desc').value = desc;
    const btn = document.querySelector('.btn-add');
    btn.innerText = "Guardar Cambios";
    btn.style.background = "#ffc107";
    btn.style.color = "#212529";
}

document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const title = document.getElementById('title').value;
    const description = document.getElementById('desc').value;

    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${API}/tasks/${editId}` : `${API}/tasks`;

    const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ title, description })
    });

    if (res.ok) {
        editId = null;
        document.getElementById('taskForm').reset();
        const btn = document.querySelector('.btn-add');
        btn.innerText = "Agregar Tarea";
        btn.style.background = "#28a745";
        btn.style.color = "white";
        loadTasks();
    } else {
        alert("Error: Debes iniciar sesión.");
    }
});

async function deleteTask(id) {
    const token = localStorage.getItem('token');
    if(!confirm("¿Eliminar esta tarea?")) return;
    
    const res = await fetch(`${API}/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
    });
    if (res.ok) loadTasks();
    else alert("Error al eliminar.");
}