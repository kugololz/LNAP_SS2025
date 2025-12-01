from flask import Flask, request, Response
from flask_cors import CORS
import ollama
import os
import re

app = Flask(__name__)
CORS(app)

MODEL_NAME = os.getenv("OLLAMA_MODEL", "codellama")

PYTHON_SYSTEM_PROMPT = """
Eres un asistente que convierte instrucciones en código Python.
Reglas IMPORTANTES:
- Responde SOLO con código Python válido.
- NO expliques nada, no hables en texto plano.
- NO incluyas bloques ``` en tu respuesta, solo el código.
"""

CPP_SYSTEM_PROMPT = """
Eres un asistente que convierte instrucciones en código C++ moderno (C++17 o superior).
Reglas IMPORTANTES:
- Responde SOLO con código C++ válido.
- NO expliques nada, no hables en texto plano.
- NO incluyas bloques ``` en tu respuesta, solo el código.
"""

def build_prompt(user_prompt: str, language: str) -> str:
    language = (language or "python").lower()
    if language == "cpp":
        system_prompt = CPP_SYSTEM_PROMPT
    else:
        system_prompt = PYTHON_SYSTEM_PROMPT

    return f"{system_prompt.strip()}\n\nUsuario:\n{user_prompt.strip()}\n\nCódigo:\n"

def clean_code_block(text: str) -> str:
    """
    Quita cualquier ```python, ```cpp o ``` suelto que devuelva el modelo,
    y se queda solo con el código.
    """
    if not text:
        return ""

    t = text.strip()

    # Quitar fence inicial tipo ```python, ```cpp o ```
    t = re.sub(r"^```[a-zA-Z0-9]*\s*", "", t)

    # Quitar fence final ``` al final del texto
    t = re.sub(r"```$", "", t.strip())

    return t.strip()

@app.route("/api/generate", methods=["POST"])
def generate():
    try:
        data = request.get_json(force=True, silent=False)
        user_prompt = (data.get("prompt") or "").strip()
        language = (data.get("language") or "python").lower()

        if not user_prompt:
            return Response("ERROR: El prompt está vacío.", status=400)

        full_prompt = build_prompt(user_prompt, language)

        res = ollama.generate(
            model=MODEL_NAME,
            prompt=full_prompt,
            stream=False
        )

        raw_text = res.get("response", "")
        if not raw_text:
            return Response("ERROR: Ollama no devolvió texto.", status=500)

        code_only = clean_code_block(raw_text)

        # Elegimos el fence según el lenguaje
        if language == "cpp":
            fence = "cpp"
        else:
            fence = "python"

        output = f"```{fence}\n{code_only}\n```"
        return Response(output, mimetype="text/plain")

    except Exception as e:
        return Response(f"ERROR: Problema en el servidor: {str(e)}", status=500)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
