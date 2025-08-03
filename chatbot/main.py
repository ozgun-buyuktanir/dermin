from flask import Flask, request, jsonify, render_template
from chat import get_chat_history, add_message
from prompts import save_prompt, get_all_prompts
from gemini_api import get_gemini_response

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")  # web arayüzünü aç

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_id = data.get("user_id", "default_user")
    message = data.get("message", "")

    if not message:
        return jsonify({"error": "Mesaj boş olamaz"}), 400

    # geçmişi al
    history = get_chat_history(user_id)
    past_texts = [h["message"] for h in history]

    # gemini yanıtını al
    reply = get_gemini_response(past_texts, message)

    # mesajları kaydet
    add_message(user_id, "user", message)
    add_message(user_id, "assistant", reply)

    return jsonify({"reply": reply})

@app.route("/get_history", methods=["GET"])
def history():
    user_id = request.args.get("user_id", "default_user")
    return jsonify(get_chat_history(user_id))

@app.route("/save_prompt", methods=["POST"])
def save_prompt_api():
    data = request.json
    prompt = data.get("prompt", "")
    tag = data.get("tag", "general")

    if not prompt:
        return jsonify({"error": "Prompt boş olamaz"}), 400

    saved = save_prompt(prompt, tag)
    return jsonify({"status": "ok", "saved_prompt": saved})

@app.route("/get_prompts", methods=["GET"])
def get_prompts_api():
    return jsonify(get_all_prompts())

if __name__ == "__main__":
    app.run(debug=True)
