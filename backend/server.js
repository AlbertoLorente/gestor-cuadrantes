const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const connection = require('./db');

const app = express();
const SECRET_KEY = 'tu_secreto_seguro'; // Cambia esto por una clave más segura en producción

app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde la carpeta frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Servir index.html como página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Middleware para verificar token
function verificarToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).json({ error: 'Se requiere autenticación' });
  }
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }
    req.user = decoded;
    next();
  });
}

// ----------------- Rutas para Usuarios -----------------

// Crear usuario (solo administradores)
app.post('/usuarios', verificarToken, async (req, res) => {
  if (req.user.rol !== 'administrador') {
    return res.status(403).json({ error: 'No autorizado: solo un administrador puede crear usuarios.' });
  }
  const { nombre, email, password, rol } = req.body;
  if (!nombre || !email || !password || !rol) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO Usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)';
    connection.query(query, [nombre, email, hashedPassword, rol], (err) => {
      if (err) {
        console.error('Error al crear usuario:', err);
        return res.status(500).json({ error: 'Error al crear usuario' });
      }
      res.status(201).json({ message: 'Usuario creado exitosamente' });
    });
  } catch (error) {
    console.error('Error en /usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM Usuarios WHERE email = ?';
  connection.query(query, [email], async (err, results) => {
    if (err) {
      console.error('Error al autenticar usuario:', err);
      return res.status(500).json({ error: 'Error al autenticar usuario' });
    }
    if (!results || results.length === 0) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }
    const user = results[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }
    const token = jwt.sign({ id: user.id_usuario, rol: user.rol }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  });
});

// Obtener lista de usuarios
app.get('/usuarios', verificarToken, (req, res) => {
  const query = 'SELECT id_usuario, nombre, email, rol FROM Usuarios';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener usuarios:', err);
      return res.status(500).json({ error: 'Error al obtener usuarios' });
    }
    res.json(results);
  });
});

// ----------------- Rutas para Cuadrantes -----------------

// Obtener lista de cuadrantes
app.get('/cuadrantes', verificarToken, (req, res) => {
  const query = `
    SELECT C.id_cuadrante, U.nombre AS vigilante, C.fecha, C.hora_inicio, C.hora_fin, C.area_vigilancia
    FROM Cuadrantes C
    JOIN Usuarios U ON C.id_vigilante = U.id_usuario
  `;
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener cuadrantes:', err);
      return res.status(500).json({ error: 'Error al obtener cuadrantes' });
    }
    res.json(results);
  });
});

// Crear cuadrante
app.post('/cuadrantes', verificarToken, (req, res) => {
  const { id_vigilante, fecha, hora_inicio, hora_fin, area_vigilancia } = req.body;
  if (!id_vigilante || !fecha || !hora_inicio || !hora_fin || !area_vigilancia) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  const query = `
    INSERT INTO Cuadrantes (id_vigilante, fecha, hora_inicio, hora_fin, area_vigilancia)
    VALUES (?, ?, ?, ?, ?)
  `;
  connection.query(query, [id_vigilante, fecha, hora_inicio, hora_fin, area_vigilancia], (err) => {
    if (err) {
      console.error('Error al crear cuadrante:', err);
      return res.status(500).json({ error: 'Error al crear cuadrante' });
    }
    res.status(201).json({ message: 'Cuadrante creado exitosamente' });
  });
});

// Eliminar cuadrante (solo administradores)
app.delete('/cuadrantes/:id', verificarToken, (req, res) => {
  if (req.user.rol !== 'administrador') {
    return res.status(403).json({ error: 'No autorizado: solo un administrador puede borrar cuadrantes.' });
  }
  const id = req.params.id;
  const query = 'DELETE FROM Cuadrantes WHERE id_cuadrante = ?';
  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error al borrar cuadrante:', err);
      return res.status(500).json({ error: 'Error al borrar cuadrante' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Cuadrante no encontrado' });
    }
    res.json({ message: 'Cuadrante borrado exitosamente' });
  });
});

// ----------------- Rutas para Incidencias -----------------

// Obtener lista de incidencias
app.get('/incidencias', verificarToken, (req, res) => {
  const query = `
    SELECT I.id_incidencia, U.nombre AS vigilante, I.fecha, I.hora, I.descripcion, I.estado
    FROM Incidencias I
    JOIN Usuarios U ON I.id_vigilante = U.id_usuario
  `;
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener incidencias:', err);
      return res.status(500).json({ error: 'Error al obtener incidencias' });
    }
    res.json(results);
  });
});

// Crear incidencia
app.post('/incidencias', verificarToken, (req, res) => {
  const { id_vigilante, fecha, hora, descripcion } = req.body;
  if (!id_vigilante || !fecha || !hora || !descripcion) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  const query = `
    INSERT INTO Incidencias (id_vigilante, fecha, hora, descripcion, estado)
    VALUES (?, ?, ?, ?, 'pendiente')
  `;
  connection.query(query, [id_vigilante, fecha, hora, descripcion], (err) => {
    if (err) {
      console.error('Error al registrar incidencia:', err);
      return res.status(500).json({ error: 'Error al registrar incidencia' });
    }
    res.status(201).json({ message: 'Incidencia registrada exitosamente' });
  });
});

// Eliminar incidencia (solo administradores)
app.delete('/incidencias/:id', verificarToken, (req, res) => {
  if (req.user.rol !== 'administrador') {
    return res.status(403).json({ error: 'No autorizado: solo un administrador puede borrar incidencias.' });
  }
  const id = req.params.id;
  const query = 'DELETE FROM Incidencias WHERE id_incidencia = ?';
  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error al borrar incidencia:', err);
      return res.status(500).json({ error: 'Error al borrar incidencia' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Incidencia no encontrada' });
    }
    res.json({ message: 'Incidencia borrada exitosamente' });
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
