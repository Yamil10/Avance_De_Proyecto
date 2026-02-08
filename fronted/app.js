const API = "/api";

// Cargar las tareas apenas abra la página
document.addEventListener('DOMContentLoaded', loadTasks);

// --- FUNCIÓN DE LOGIN ---
async function login() {
    const user = prompt("Ingresa tu usuario:");
    const pass = prompt("Ingresa tu contraseña:");

    if (!user || !pass) return;

    try {
        const res = await fetch(`${API}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        });

        const data = await res.json();

        if (data.token) {
            localStorage.setItem('token', data.token);
            alert("✅ ¡Inicio de sesión exitoso!");
        } else {
            alert("❌ Error: " + (data.error || "Credenciales incorrectas"));
        }
    } catch (error) {
        console.error(error);
        alert("Error de conexión con el servidor");
    }
}

// --- FUNCIÓN PARA CARGAR TAREAS (Pública) ---
async function loadTasks() {
    try {
        const res = await fetch(`${API}/tasks`);
        const tasks = await res.json();
        
        const container = document.getElementById("taskContainer");
        container.innerHTML = ''; // Limpiar antes de cargar

        if (tasks.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#999;">No hay tareas pendientes.</p>';
            return;
        }

        tasks.forEach(t => {
            container.innerHTML += `
                <div class="task">
                    <div>
                        <strong>${t.title}</strong>
                        <small>${t.description}</small>
                    </div>
                    <button class="btn-del" onclick="deleteTask(${t.id})">Eliminar</button>
                </div>`;
        });
    } catch (error) {
        console.error("Error cargando tareas:", error);
    }
}

// --- FUNCIÓN PARA AGREGAR TAREA (Protegida) ---
document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
        alert("🔒 Debes iniciar sesión para agregar tareas.");
        return;
    }

    const title = document.getElementById('title').value;
    const desc = document.getElementById('desc').value;

    try {
        const res = await fetch(`${API}/tasks`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': token 
            },
            body: JSON.stringify({ title: title, description: desc })
        });

        if (res.ok) {
            document.getElementById('taskForm').reset();
            loadTasks(); // Recargar la lista
        } else {
            alert("No autorizado o sesión expirada.");
        }
    } catch (error) {
        console.error(error);
    }
});

// --- FUNCIÓN PARA BORRAR TAREA (Protegida) ---
async function deleteTask(id) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("🔒 Debes iniciar sesión para eliminar tareas.");
        return;
    }

    if (!confirm("¿Seguro que deseas eliminar esta tarea?")) return;

    try {
        const res = await fetch(`${API}/tasks/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': token }
        });

        if (res.ok) {
            loadTasks();
        } else {
            alert("No se pudo eliminar (verifica tu sesión).");
        }
    } catch (error) {
        console.error(error);
    }
}