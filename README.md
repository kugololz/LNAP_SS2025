# 💬 LNAP (Lenguaje Natural a Python)

## Live Demo: https://lnap.dev

Este proyecto es una aplicación web Full Stack que convierte instrucciones de lenguaje natural (en español) en código Python. Utiliza un modelo de IA (codellama) alojado en un servidor privado y transmite la respuesta en tiempo real a una interfaz de chat.

## ¿Qué hace esta app?

Simplemente escribe una instrucción en el chat, como "crea una función que sume dos números" o "haz una clase 'Perro' con un método para ladrar". La IA generará el código Python correspondiente y te lo mostrará.

### Características (temporales, se agregaran o eliminaran conforme progrese el proyecto)

    1. Generación de Código en Vivo: El código aparece palabra por palabra, tal como la IA lo genera.

    2. Resaltado de Sintaxis: El código de Python se colorea automáticamente para una fácil lectura.

    3. Botón de Copiar: Pasa el ratón sobre cualquier bloque de código para que aparezca un botón y puedas copiarlo.

    4. Asistente "Clippy": Haz clic en el ícono 💡 en la esquina inferior derecha para recibir un consejo aleatorio sobre Python o fundamentos de programación.

## Documentación Técnica

Esta aplicación está construida con una arquitectura desacoplada: un frontend estático y un backend de API independiente.

Arquitectura y Stack Tecnológico

    Frontend (Carpeta /docs/):

        HTML5, CSS3, y JavaScript (ES6+).

        Hosting: GitHub Pages (lnap.dev).

        Bibliotecas: highlight.js para el resaltado de sintaxis.

    Backend (Carpeta /backend/):

        Framework: Python 3 con Flask.

        IA: Ollama sirviendo el modelo codellama.

        API: Una única ruta (/api/generate) que maneja las peticiones POST.

        CORS: Flask-CORS para manejar las peticiones desde el dominio del frontend.

    Infraestructura (Despliegue):

        Backend: Alojado en una VM de Azure (Ubuntu).

        Servidor Web: Nginx configurado como proxy inverso.

        Seguridad: Certificados SSL de Let's Encrypt (manejados por Certbot) para https://api.lnap.dev.

        DNS: name.com (A-Records) apuntando a GitHub Pages (lnap.dev) y a la VM de Azure (api.lnap.dev).

## Estructura del Repositorio
```
.
├── backend/
│   └── app.py       # El servidor Flask con la lógica de Ollama
├── docs/
│   ├── index.html   # Estructura del chat y Clippy
│   ├── style.css    # Estilos de la app y Clippy
│   └── script.js    # Lógica del frontend, fetch al API, y lógica de Clippy
└── README.md        # Esta documentación
```

## API Endpoint

POST /api/generate

    Host: https://api.lnap.dev

  Descripción: Recibe un prompt del usuario y devuelve un stream de texto con el código Python generado.

    Request Body (JSON):
    JSON

    {
      "prompt": "Tu instrucción de texto aquí",
      "model": "codellama"
    }

    Response (Streaming):

    Content-Type: text/plain

  La respuesta es un stream de texto plano (no JSON) que va enviando el código a medida que se genera.

## Cómo Ejecutar el Proyecto Localmente

Prerrequisitos

    Python 3.10+ y pip.

    Ollama instalado y corriendo en tu máquina local.

    Tener el modelo codellama (ollama pull codellama)

1. Backend

`cd backend`

(Opcional) Crear un entorno virtual:

    python3 -m venv venv
    source venv/bin/activate

Instalar las dependencias de Python:

pip install Flask flask-cors ollama

Ejecuta el servidor Flask (¡Asegúrate de que Ollama esté corriendo!):
Bash

    python3 app.py

  El backend ahora estará corriendo en http://127.0.0.1:5001 (http://localhost:5001).

2. Frontend

    Abrir el archivo docs/index.html directamente en el navegador.

    Para que funcione localmente, se debe modificar docs/script.js para que apunte al servidor local:

        ❌ const BACKEND_URL = "https://api.lnap.dev/api/generate";

        ✅ const BACKEND_URL = "http://127.0.0.1:5001/api/generate";

    También se debe modificar backend/app.py para permitir peticiones desde null (que es el origen de un archivo local):

        ❌ origins = ["https://lnap.dev", "http://localhost:5173"]

        ✅ origins = ["https://lnap.dev", "http://localhost:5173", "null"]

        (Se debe reiniciar el servidor Flask después de este cambio).
