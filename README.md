# 🐾 Huellitas App - Core (Base de Desarrollo)

Repositorio base del sistema integral de gestión veterinaria "Huellitas". Este repositorio contiene el código estructural listo para ser extendido por el equipo de desarrollo.

## 🚀 Arquitectura
El proyecto está construido bajo el Stack MERN:
- **/client**: Frontend en React.js, Vite y Ant Design.
- **/server**: Backend en Node.js, Express y base de datos MongoDB.

## 🛠️ Configuración Rápida para el Equipo

### 1. Variables de Entorno (.env)
El entorno de desarrollo ya cuenta con una base de datos en la nube centralizada para todo el equipo. No necesitas instalar MongoDB.

**En el Servidor (`/server`):**
Solicita al líder del proyecto el archivo `.env` (que contiene las credenciales de acceso a la base de datos) y colócalo dentro de la carpeta `/server`.

**En el Cliente (`/client`):**
Duplica el archivo `.env.example` a `.env` (asegúrate de que apunte a `http://localhost:4000`).
```bash
cd client
cp .env.example .env
```

### 2. Instalar Dependencias y Ejecutar
Abre dos ventanas en tu terminal.

**Terminal 1 (Backend):**
```bash
cd server
npm install
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm install
npm run dev
```
La aplicación web abrirá en tu navegador en `http://localhost:5173`.

## 🧪 Pruebas y Tests (QA)
Para correr los tests y verificar la integridad:
```bash
cd server
npm run test
```
