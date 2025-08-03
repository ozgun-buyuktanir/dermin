from datetime import datetime
from storage import load_json, save_json, PROMPT_FILE

def save_prompt(prompt, tag="general"):
    prompts = load_json(PROMPT_FILE)
    prompts.append({
        "prompt": prompt,
        "tag": tag,
        "timestamp": datetime.utcnow().isoformat()
    })
    save_json(PROMPT_FILE, prompts)
    return prompt

def get_all_prompts():
    return load_json(PROMPT_FILE)
