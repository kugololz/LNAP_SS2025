// --- 1. Variables Globales ---
const generateBtn = document.getElementById("generateBtn");
const userInput = document.getElementById("userInput");
const chatContainer = document.querySelector(".chat-container");
const BACKEND_URL = "https://api.lnap.dev/api/generate";

let currentLanguage = 'python'; // Estado inicial
const pyBtn = document.getElementById('lang-py');
const cppBtn = document.getElementById('lang-cpp');

// --- 2. Función Auxiliar: createMessageSection ---
/**
 * @param {string} role
 * @param {boolean} isCodeBlock
 * @returns {HTMLElement}
 */
function createMessageSection(role, isCodeBlock = false) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `chat-message ${role}`;

    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";
    if (isCodeBlock) {
        contentDiv.classList.add("code-block");
    }

    messageDiv.appendChild(contentDiv);
    chatContainer.appendChild(messageDiv);

    chatContainer.parentElement.scrollTop = chatContainer.parentElement.scrollHeight;
    return contentDiv;
}

// --- 3. Función Auxiliar: animateText ---
/**
 * @param {HTMLElement} element - El elemento <code> donde escribir.
 * @param {string} text - El texto completo a animar.
 */
function animateText(element, text) {
    return new Promise((resolve) => {
        let i = 0;
        element.innerText = ""; // Limpia el cursor '▍'

        const interval = setInterval(() => {
            if (i < text.length) {
                element.innerText += text[i];
                i++;
                // Mueve el scroll con cada letra
                chatContainer.parentElement.scrollTop = chatContainer.parentElement.scrollHeight;
            } else {
                clearInterval(interval);
                resolve(); // Termina la promesa
            }
        }, 10); // 10ms por letra (ajusta la velocidad aquí)
    });
}

// --- 4. Función Principal: generateCode ---
async function generateCode() {
    const prompt = userInput.value.trim();
    if (!prompt) return;

    const userMessageContent = createMessageSection('user');
    const userParagraph = document.createElement('p');
    userParagraph.innerText = prompt;
    userMessageContent.appendChild(userParagraph);
    userInput.value = "";
    userInput.style.height = 'auto';

    const aiMessageContent = createMessageSection('ai', true);
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.className = `language-${currentLanguage === 'cpp' ? 'cpp' : 'python'}`;
    code.innerText = "▍"; // Cursor de espera
    pre.appendChild(code);
    aiMessageContent.appendChild(pre);

    const copyButton = document.createElement('button');
    copyButton.className = 'copy-button';
    copyButton.innerText = 'Copiar';
    copyButton.disabled = true; // Desactivado hasta que termine
    aiMessageContent.appendChild(copyButton);

    chatContainer.parentElement.scrollTop = chatContainer.parentElement.scrollHeight;

    try {
        const response = await fetch(BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, model: "codellama", language: currentLanguage }),
        });

        if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);

        const reader = response.body.getReader(); // Corregido: 'getReader'
        const decoder = new TextDecoder();
        let fullRawCode = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            fullRawCode += decoder.decode(value);
        }

        const cleanCode = fullRawCode
            .replace(/```[a-zA-Z0-9]*\n?/g, "") // quita ```python, ```cpp, ```js, etc.
            .replace(/```/g, "")                // por si queda algún ``` suelto
            .trim();

        await animateText(code, cleanCode);

        if (cleanCode.startsWith('ERROR:')) {
            code.style.color = '#ff9b9b';
            copyButton.innerText = 'Error';
            copyButton.disabled = true;
        } else {
            const highlightedCodeHTML = hljs.highlight(cleanCode, { language: currentLanguage }).value;
            code.innerHTML = highlightedCodeHTML;

            copyButton.disabled = false;
            copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(cleanCode).then(() => {
                    copyButton.innerText = '¡Copiado!';
                    setTimeout(() => {
                        copyButton.innerText = 'Copiar';
                    }, 2000);
                }).catch(err => {
                    console.error('Error al copiar el texto: ', err);
                    copyButton.innerText = 'Error';
                });
            });
        }

    } catch (error) {
        code.innerText = `Ocurrió un error: ${error.message}`;
        copyButton.innerText = 'Error';
    }
}

// --- 5. Event Listeners (Botones de Lenguaje) ---
pyBtn.addEventListener('click', () => {
    currentLanguage = 'python';
    pyBtn.classList.add('active');
    cppBtn.classList.remove('active');
});

cppBtn.addEventListener('click', () => {
    currentLanguage = 'cpp';
    cppBtn.classList.add('active');
    pyBtn.classList.remove('active');
});

// --- 6. Event Listeners (Input y Envío) ---
generateBtn.addEventListener("click", generateCode);

userInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        generateCode();
    }
});

userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = `${userInput.scrollHeight}px`;
});

// --- 7. Lógica de Clippy ---
const programmingTips = [
    "Python: Usa 'list comprehensions' para crear listas de forma concisa. Ej: `cuadrados = [x*x for x in range(10)]`",
    "Fundamentos: El princi pio 'DRY' (Don't Repeat Yourself) te ayuda a escribir código más limpio evitando la duplicación.",
    "Python: ¿Necesitas un diccionario con un valor por defecto? Usa `collections.defaultdict`.",
    "Fundamentos: 'KISS' (Keep It Simple, Stupid) es un principio de diseño que prefiere la simplicidad.",
    "Python: Para unir una lista de strings, es más eficiente usar `'-'.join(mi_lista)` que un bucle `for`.",
    "Fundamentos: Comenta tu código para explicar el 'por qué', no el 'qué'. El código debe explicar qué hace por sí mismo.",
    "Python: Usa 'f-strings' (ej: `f'Hola, {nombre}'`) para formatear strings. Es más rápido y legible que `.format()`."
];

const clippyIcon = document.getElementById('clippy-icon');
const clippyBubble = document.getElementById('clippy-bubble');
const clippyTipText = document.getElementById('clippy-tip-text');
const clippyCloseBtn = document.getElementById('clippy-close-btn');

clippyIcon.addEventListener('click', () => {
    const randomIndex = Math.floor(Math.random() * programmingTips.length);
    const randomTip = programmingTips[randomIndex];

    clippyTipText.innerText = randomTip;
    clippyBubble.classList.add('show');
});

clippyCloseBtn.addEventListener('click', () => {
    clippyBubble.classList.remove('show');
});