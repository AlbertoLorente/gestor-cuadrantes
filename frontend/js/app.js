/**
 * Función para decodificar el payload de un token JWT (sin verificar la firma)
 */
function getPayloadFromToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.error('Error decodificando token:', error);
    return null;
  }
}

let authToken = null;

document.addEventListener('DOMContentLoaded', () => {
  // ------------------ Manejo de inicio de sesión ------------------
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Credenciales incorrectas');
      }
      const data = await response.json();
      authToken = data.token;
      localStorage.setItem('token', authToken);

      document.getElementById('auth-section').classList.add('d-none');
      document.getElementById('app-section').classList.remove('d-none');

      cargarUsuarios();
      cargarCuadrantes();
      cargarIncidencias();
      
    } catch (err) {
      document.getElementById('login-message').textContent = err.message;
    }
  });

  // ------------------ Cierre de sesión ------------------
  document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('token');
    authToken = null;
    document.getElementById('auth-section').classList.remove('d-none');
    document.getElementById('app-section').classList.add('d-none');
  });

  // ------------------ Manejo de navegación entre pestañas ------------------
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.tab-pane').forEach(tab => tab.classList.remove('show', 'active'));
      const targetTab = document.querySelector(e.target.getAttribute('href'));
      targetTab.classList.add('show', 'active');
      document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('active'));
      e.target.classList.add('active');
    });
  });

  if (localStorage.getItem('token')) {
    authToken = localStorage.getItem('token');
    document.getElementById('auth-section').classList.add('d-none');
    document.getElementById('app-section').classList.remove('d-none');
    cargarUsuarios();
    cargarCuadrantes();
    cargarIncidencias();
  }

  // ------------------ Manejo de formularios para crear registros ------------------

  // Mostrar/Cerrar formulario para crear usuario
  const btnShowCreateUser = document.getElementById('btn-show-create-user');
  if (btnShowCreateUser) {
    btnShowCreateUser.addEventListener('click', () => {
      document.getElementById('create-user-form').classList.remove('d-none');
    });
  }
  const btnCancelCreateUser = document.getElementById('cancel-create-user');
  if (btnCancelCreateUser) {
    btnCancelCreateUser.addEventListener('click', () => {
      document.getElementById('create-user-form').classList.add('d-none');
      limpiarFormularioUsuario();
    });
  }
  const formCreateUser = document.getElementById('form-create-user');
  if (formCreateUser) {
    formCreateUser.addEventListener('submit', async (e) => {
      e.preventDefault();
      await crearUsuario();
    });
  }

  // Mostrar/Cerrar formulario para crear cuadrante
  const btnShowCreateCuadrante = document.getElementById('btn-show-create-cuadrante');
  if (btnShowCreateCuadrante) {
    btnShowCreateCuadrante.addEventListener('click', () => {
      document.getElementById('create-cuadrante-form').classList.remove('d-none');
    });
  }
  const btnCancelCreateCuadrante = document.getElementById('cancel-create-cuadrante');
  if (btnCancelCreateCuadrante) {
    btnCancelCreateCuadrante.addEventListener('click', () => {
      document.getElementById('create-cuadrante-form').classList.add('d-none');
      limpiarFormularioCuadrante();
    });
  }
  const formCreateCuadrante = document.getElementById('form-create-cuadrante');
  if (formCreateCuadrante) {
    formCreateCuadrante.addEventListener('submit', async (e) => {
      e.preventDefault();
      await crearCuadrante();
    });
  }

  // Mostrar/Cerrar formulario para crear incidencia
  const btnShowCreateIncidencia = document.getElementById('btn-show-create-incidencia');
  if (btnShowCreateIncidencia) {
    btnShowCreateIncidencia.addEventListener('click', () => {
      document.getElementById('create-incidencia-form').classList.remove('d-none');
    });
  }
  const btnCancelCreateIncidencia = document.getElementById('cancel-create-incidencia');
  if (btnCancelCreateIncidencia) {
    btnCancelCreateIncidencia.addEventListener('click', () => {
      document.getElementById('create-incidencia-form').classList.add('d-none');
      limpiarFormularioIncidencia();
    });
  }
  const formCreateIncidencia = document.getElementById('form-create-incidencia');
  if (formCreateIncidencia) {
    formCreateIncidencia.addEventListener('submit', async (e) => {
      e.preventDefault();
      await crearIncidencia();
    });
  }
});

/* ======================== FUNCIONES PARA CARGAR DATOS ======================== */

async function cargarUsuarios() {
  try {
    const resp = await fetch('http://localhost:3000/usuarios', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken
      }
    });
    if (!resp.ok) {
      throw new Error('Error al obtener usuarios');
    }
    const data = await resp.json();
    const usersList = document.getElementById('users-list');
    usersList.innerHTML = '';
    if (data.length === 0) {
      usersList.textContent = 'No hay usuarios registrados.';
      return;
    }
    const ul = document.createElement('ul');
    ul.classList.add('list-group');
    data.forEach(user => {
      const li = document.createElement('li');
      li.classList.add('list-group-item');
      li.textContent = `${user.nombre} | ${user.email} | Rol: ${user.rol}`;
      ul.appendChild(li);
    });
    usersList.appendChild(ul);
  } catch (error) {
    console.error(error);
  }
}

async function cargarCuadrantes() {
  try {
    const resp = await fetch('http://localhost:3000/cuadrantes', {
      headers: { 'Authorization': authToken }
    });
    if (!resp.ok) {
      throw new Error('Error al obtener cuadrantes');
    }
    const data = await resp.json();
    const cuadrantesList = document.getElementById('cuadrantes-list');
    cuadrantesList.innerHTML = '';
    if (data.length === 0) {
      cuadrantesList.textContent = 'No hay cuadrantes registrados.';
      return;
    }
    const table = document.createElement('table');
    table.classList.add('table', 'table-bordered');
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th>ID</th>
        <th>Vigilante</th>
        <th>Fecha</th>
        <th>Hora Inicio</th>
        <th>Hora Fin</th>
        <th>Área de Vigilancia</th>
        <th>Acciones</th>
      </tr>
    `;
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    const payload = getPayloadFromToken(authToken);
    const esAdmin = payload && payload.rol === 'administrador';
    data.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.id_cuadrante}</td>
        <td>${item.vigilante}</td>
        <td>${item.fecha}</td>
        <td>${item.hora_inicio}</td>
        <td>${item.hora_fin}</td>
        <td>${item.area_vigilancia}</td>
        <td></td>
      `;
      if (esAdmin) {
        const btnDelete = document.createElement('button');
        btnDelete.textContent = 'Borrar';
        btnDelete.classList.add('btn', 'btn-danger', 'btn-sm');
        btnDelete.addEventListener('click', () => {
          if (confirm('¿Estás seguro de borrar este cuadrante?')) {
            borrarCuadrante(item.id_cuadrante);
          }
        });
        row.lastElementChild.appendChild(btnDelete);
      }
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    cuadrantesList.appendChild(table);
  } catch (error) {
    console.error(error);
  }
}

async function cargarIncidencias() {
  try {
    const resp = await fetch('http://localhost:3000/incidencias', {
      headers: { 'Authorization': authToken }
    });
    if (!resp.ok) {
      throw new Error('Error al obtener incidencias');
    }
    const data = await resp.json();
    const incidenciasList = document.getElementById('incidencias-list');
    incidenciasList.innerHTML = '';
    if (data.length === 0) {
      incidenciasList.textContent = 'No hay incidencias registradas.';
      return;
    }
    const table = document.createElement('table');
    table.classList.add('table', 'table-bordered');
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th>ID</th>
        <th>Vigilante</th>
        <th>Fecha</th>
        <th>Hora</th>
        <th>Descripción</th>
        <th>Estado</th>
        <th>Acciones</th>
      </tr>
    `;
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    const payload = getPayloadFromToken(authToken);
    const esAdmin = payload && payload.rol === 'administrador';
    data.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.id_incidencia}</td>
        <td>${item.vigilante}</td>
        <td>${item.fecha}</td>
        <td>${item.hora}</td>
        <td>${item.descripcion}</td>
        <td>${item.estado}</td>
        <td></td>
      `;
      if (esAdmin) {
        const btnDelete = document.createElement('button');
        btnDelete.textContent = 'Borrar';
        btnDelete.classList.add('btn', 'btn-danger', 'btn-sm');
        btnDelete.addEventListener('click', () => {
          if (confirm('¿Estás seguro de borrar esta incidencia?')) {
            borrarIncidencia(item.id_incidencia);
          }
        });
        row.lastElementChild.appendChild(btnDelete);
      }
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    incidenciasList.appendChild(table);
  } catch (error) {
    console.error(error);
  }
}

/* ======================== FUNCIONES PARA CREAR REGISTROS ======================== */

async function crearUsuario() {
  const nombre = document.getElementById('nuevo-nombre').value;
  const email = document.getElementById('nuevo-email').value;
  const password = document.getElementById('nuevo-password').value;
  const rol = document.getElementById('nuevo-rol').value;
  try {
    const resp = await fetch('http://localhost:3000/usuarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken
      },
      body: JSON.stringify({ nombre, email, password, rol })
    });
    const msgElem = document.getElementById('create-user-message');
    if (!resp.ok) {
      const errorData = await resp.json();
      throw new Error(errorData.error || 'Error al crear usuario');
    }
    const data = await resp.json();
    msgElem.textContent = data.message || 'Usuario creado correctamente';
    cargarUsuarios();
    setTimeout(() => {
      document.getElementById('create-user-form').classList.add('d-none');
      limpiarFormularioUsuario();
    }, 1500);
  } catch (error) {
    const msgElem = document.getElementById('create-user-message');
    msgElem.textContent = error.message;
    msgElem.classList.remove('text-success');
    msgElem.classList.add('text-danger');
  }
}

function limpiarFormularioUsuario() {
  document.getElementById('form-create-user').reset();
  const msg = document.getElementById('create-user-message');
  msg.textContent = '';
  msg.classList.remove('text-danger');
  msg.classList.add('text-success');
}

async function crearCuadrante() {
  const id_vigilante = document.getElementById('cua-id-vigilante').value;
  const fecha = document.getElementById('cua-fecha').value;
  const hora_inicio = document.getElementById('cua-hora-inicio').value;
  const hora_fin = document.getElementById('cua-hora-fin').value;
  const area_vigilancia = document.getElementById('cua-area').value;
  try {
    const resp = await fetch('http://localhost:3000/cuadrantes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken
      },
      body: JSON.stringify({ id_vigilante, fecha, hora_inicio, hora_fin, area_vigilancia })
    });
    const msgElem = document.getElementById('create-cuadrante-message');
    if (!resp.ok) {
      const errorData = await resp.json();
      throw new Error(errorData.error || 'Error al crear cuadrante');
    }
    const data = await resp.json();
    msgElem.textContent = data.message || 'Cuadrante creado exitosamente';
    cargarCuadrantes();
    setTimeout(() => {
      document.getElementById('create-cuadrante-form').classList.add('d-none');
      limpiarFormularioCuadrante();
    }, 1500);
  } catch (error) {
    const msgElem = document.getElementById('create-cuadrante-message');
    msgElem.textContent = error.message;
    msgElem.classList.remove('text-success');
    msgElem.classList.add('text-danger');
  }
}

function limpiarFormularioCuadrante() {
  document.getElementById('form-create-cuadrante').reset();
  const msg = document.getElementById('create-cuadrante-message');
  msg.textContent = '';
  msg.classList.remove('text-danger');
  msg.classList.add('text-success');
}

async function crearIncidencia() {
  const id_vigilante = document.getElementById('inc-id-vigilante').value;
  const fecha = document.getElementById('inc-fecha').value;
  const hora = document.getElementById('inc-hora').value;
  const descripcion = document.getElementById('inc-descripcion').value;
  try {
    const resp = await fetch('http://localhost:3000/incidencias', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken
      },
      body: JSON.stringify({ id_vigilante, fecha, hora, descripcion })
    });
    const msgElem = document.getElementById('create-incidencia-message');
    if (!resp.ok) {
      const errorData = await resp.json();
      throw new Error(errorData.error || 'Error al crear incidencia');
    }
    const data = await resp.json();
    msgElem.textContent = data.message || 'Incidencia registrada exitosamente';
    cargarIncidencias();
    setTimeout(() => {
      document.getElementById('create-incidencia-form').classList.add('d-none');
      limpiarFormularioIncidencia();
    }, 1500);
  } catch (error) {
    const msgElem = document.getElementById('create-incidencia-message');
    msgElem.textContent = error.message;
    msgElem.classList.remove('text-success');
    msgElem.classList.add('text-danger');
  }
}

function limpiarFormularioIncidencia() {
  document.getElementById('form-create-incidencia').reset();
  const msg = document.getElementById('create-incidencia-message');
  msg.textContent = '';
  msg.classList.remove('text-danger');
  msg.classList.add('text-success');
}

/* ======================== FUNCIONES PARA BORRAR REGISTROS ======================== */

async function borrarCuadrante(id) {
  try {
    const resp = await fetch(`http://localhost:3000/cuadrantes/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authToken
      }
    });
    if (!resp.ok) {
      const errorData = await resp.json();
      throw new Error(errorData.error || 'Error al borrar cuadrante');
    }
    const data = await resp.json();
    alert(data.message);
    cargarCuadrantes();
  } catch (error) {
    alert('Error: ' + error.message);
    console.error(error);
  }
}

async function borrarIncidencia(id) {
  try {
    const resp = await fetch(`http://localhost:3000/incidencias/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authToken
      }
    });
    if (!resp.ok) {
      const errorData = await resp.json();
      throw new Error(errorData.error || 'Error al borrar incidencia');
    }
    const data = await resp.json();
    alert(data.message);
    cargarIncidencias();
  } catch (error) {
    alert('Error: ' + error.message);
    console.error(error);
  }
}
