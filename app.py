from flask import Flask, request, jsonify
from flask_cors import CORS
from flask import Response
import ollama
import re


app = Flask(__name__)
CORS(app)

@app.route('/api/generate', methods=['POST'])
def generate():
    """
    Esta función se activa cuando alguien envía una petición POST a http://127.0.0.1:5000/api/generate
    :return:
    """

    try:
        data = request.get_json()
        user_prompt = data.get("prompt")
        model_name = data.get("model", "codellama")

        if not  user_prompt:
            return jsonify({"error": "Por favor escriba un prompt"}), 400

        full_prompt = f"""
        INSTRUCCIÓN: Convierte el siguiente texto a codigo Python. Responde unicamente con el codigo
        en formato raw, sin explicaciones, sin comentarios, sin comentarios introductorios 
        y sin usar markdown.
        TEXTO: '{user_prompt}'
        """

        def event_stream():
            stream = ollama.generate(
                model=model_name,
                prompt=full_prompt,
                stream=True
            )

            for chunk in stream:
                yield chunk['response']

        return Response(event_stream(), mimetype='text/plain')

    except Exception as e:
        return Response(f"Error en el servidor: {str(e)}", status=500)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)