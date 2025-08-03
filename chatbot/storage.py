import os
import json

CHAT_FILE = "chat_history.json"
PROMPT_FILE = "prompts.json"

def load_json(file):
    if not os.path.exists(file):
        with open(file, "w") as f:
            json.dump([], f)
    with open(file, "r") as f:
        return json.load(f)

def save_json(file, data):
    with open(file, "w") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
