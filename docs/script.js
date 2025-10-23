const generateBtn = document.getElementById("generateBtn");
const userInput = document.getElementById("userInput");
const chatContainer = document.querySelector(".chat-container");
const BACKEND_URL = "https://api.lnap.dev/api/generate";/**
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
    code.className = 'language-python';
    code.innerText = "▍";
    pre.appendChild(code);
    aiMessageContent.appendChild(pre);

    const copyButton = document.createElement('button');
    copyButton.className = 'copy-button';
    copyButton.innerText = 'Copiar';
    aiMessageContent.appendChild(copyButton);

    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(code.innerText).then(() => {
            copyButton.innerText = '¡Copiado!';
            setTimeout(() => {
                copyButton.innerText = 'Copiar';
            }, 2000);
        }).catch(err => {
            console.error('Error al copiar el texto: ', err);
            copyButton.innerText = 'Error';
        });
    });


    chatContainer.parentElement.scrollTop = chatContainer.parentElement.scrollHeight;

    try {
        const response = await fetch(BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, model: "codellama" }),
        });

        if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        code.innerText = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            code.innerText += decoder.decode(value);
            chatContainer.parentElement.scrollTop = chatContainer.parentElement.scrollHeight;
        }

        const rawCode = code.innerText;
        const cleanCode = rawCode.replace(/```python\n|```/g, "").trim();
        const highlightedCodeHTML = hljs.highlight(cleanCode, { language: 'python' }).value;
        code.innerHTML = highlightedCodeHTML;

    } catch (error) {
        code.innerText = `Ocurrió un error: ${error.message}`;
    }
}

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