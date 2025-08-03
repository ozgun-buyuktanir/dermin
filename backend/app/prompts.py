from app.db import db

prompts_collection = db["chat_prompts"]

def save_prompt(prompt: str, tag: str = "general"):
    """
    Yeni bir prompt kaydeder.
    """
    new_prompt = {"prompt": prompt, "tag": tag}
    prompts_collection.insert_one(new_prompt)
    return new_prompt

def get_all_prompts():
    """
    Tüm promptları döner.
    """
    prompts = list(prompts_collection.find({}, {"_id": 0}))  # _id hariç
    return prompts
