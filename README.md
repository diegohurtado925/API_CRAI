# API CRAI - Sistema de Reserva de Salas de Estudio 🏫📱

Este repositorio contiene la API REST desarrollada en **Node.js** con **Express** para gestionar el flujo de reserva. Está optimizada para ser consumida por aplicaciones móviles nativas de Android.

El servicio se encuentra desplegado en la nube a través de **Render**.

---

## Características y Lógica de Negocio

* **Distribución Real del CRAI:** Incluye la configuración exacta de las salas, capacidades y plantas del edificio (Planta 1, Planta 2 y Planta 3).
* **Validación de Usuarios:** Restringe las reservas únicamente a la lista de estudiantes autorizados con su respectivo carnet.
* **Control de Traslapes de Horarios:** El servidor valida automáticamente que una sala no pueda ser reservada en el mismo rango de fecha y hora por dos usuarios diferentes, devolviendo un código de estado de conflicto HTTP en caso de choque.
* **Gestión de Estados:** Permite cambiar el estado de las reservas dinámicamente (`ACTIVA`, `COMPLETADA`, `CANCELADA`).
* **Soporte CORS e HTTPS:** Configurado para permitir conexiones seguras exigidas por las directivas de red de Android.

---

## 🛠️ Tecnologías Utilizadas

* **Entorno de ejecución:** [Node.js](https://nodejs.org/) (v24 o superior)
* **Framework Web:** [Express.js](https://expressjs.com/)
* **Middlewares:** `cors` para la gestión de accesos y `body-parser` para el parseo de datos JSON.
* **Plataforma de Despliegue:** [Render](https://render.com/)

---

## Endpoints

### 1. Salas de Estudio
* **`GET /study-rooms`**

### 2. Usuarios
* **`GET /users`**

### 3. Reservas
* **`GET /reservations`**

* **`GET /users/:carnet/reservations`**

* **`POST /reservations`**
    * **Cuerpo de la petición (JSON esperado):**
        ```json
        {
          "roomId": 4,
          "userCarnet": "00034124",
          "date": "2026-07-02",
          "startTime": "09:00",
          "endTime": "11:00",
          "status": "ACTIVA"
        }
        ```
* **`PATCH /reservations/:id/status`**
    * **Parámetros Query:** `status` (Ejemplo: `/reservations/1/status?status=CANCELADA`)
    * **Descripción:** Actualiza o cancela el estado de una reserva por su ID.

## Configuración Local e Instalación
Luego de clonar el repositorio:
- npm install
- npm start