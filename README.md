# Gestor de cuadrantes

Aplicación web **Full-Stack** desarrollada como proyecto final del ciclo **Desarrollo de Aplicaciones Web (DAW)**.  
Permite gestionar personal, horarios y permisos de forma segura, con autenticación por roles y base de datos MySQL.

---

## 🚀 Tecnologías utilizadas

- **Frontend:** HTML5, CSS3, Bootstrap
- **Backend:** Node.js, Express
- **Base de datos:** MySQL
- **Control de versiones:** Git + GitHub

---

## ✨ Características principales

- 🔐 **Autenticación y roles** (admin y usuario estándar)  
- 📅 **CRUD completo** para usuarios, horarios y permisos  
- 📱 **Diseño responsive** adaptado a móviles y escritorio  
- 🗄 **Base de datos segura** con MySQL  
- 🎯 **Interfaz intuitiva** para la gestión del personal  

---

## 📂 Estructura del proyecto

gestor-cuadrantes/

├── backend/ # Código del servidor (Node.js + Express)

├── frontend/ # Archivos HTML, CSS, JS (Bootstrap)

├── database/ # Scripts SQL (estructura y datos de prueba)

├── .gitignore

├── README.md

---

## ⚙️ Instalación y uso

1. **Clonar el repositorio**
    ```bash
    git clone https://github.com/AlbertoLorente/gestor-cuadrantes.git
    cd gestor-cuadrantes

2. **Configurar variables de entorno**
    Copia el archivo .env.example a .env y ajusta tus credenciales:
    DB_HOST=localhost
    DB_USER=root
    DB_PASS=1234
    DB_NAME=gestor_cuadrantes
    PORT=3000

3. **Instalar dependencias**
    Copiar
    Editar
    cd backend
    npm install

4. **Importar base de datos**
    En MySQL ejecuta el script database/database.sql

5. **Iniciar la aplicación**
    Copiar
    Editar
    npm start

6. **Abrir en el navegador**
    Copiar
    Editar
    http://localhost:3000

📜 Licencia
Este proyecto se distribuye bajo la licencia MIT. Puedes usarlo libremente con fines educativos o profesionales.
