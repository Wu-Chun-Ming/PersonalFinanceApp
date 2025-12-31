import base64
import json
import requests
import re

def extract_date_category(image_bytes: bytes, model: str, api_key: str, prompt: str):
    # Convert image to base64
    image_base64_string = base64.b64encode(image_bytes).decode('utf-8')

    # Prepare the payload
    payload = {
        "model": model,
        "messages": [{
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_base64_string}"}}
            ]
        }]
    }

    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        },
        data=json.dumps(payload)
    )

    # Parse and clean the response
    data = response.json()
    raw_content = data["choices"][0]["message"]["content"]
    # Remove markdown fences
    cleaned_content = re.sub(r"^```[a-zA-Z]*\n|\n```$", "", raw_content.strip(), flags=re.MULTILINE)

    # Convert cleaned content to JSON
    try:
        result_json = json.loads(cleaned_content)
    except json.JSONDecodeError:
        raise ValueError(f"Failed to decode JSON response from the API.")
    
    # Wrap in list if it's a single object
    if not isinstance(result_json, list):
        result_json = [result_json]

    response_list = [
        {
            "date": item.get("date"), 
            "category": item.get("category")
        } for item in result_json
    ]

    return response_list