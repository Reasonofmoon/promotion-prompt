import re
import json

source_path = r"c:\Users\sound\Documents\MyZettelkasten\320-LectureContent\2026_01_20_Gumaetan_Market_Lecture\05_100_Magic_Prompts.md"
output_path = r"c:\Users\sound\Documents\MyZettelkasten\promotion-prompt\prompts.js"

def parse_markdown(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    categories = []
    current_category = None
    current_subcategory = None
    prompts = []

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Chapter (Category)
        if line.startswith("## "):
            current_category = line.replace("## ", "").strip()
            # Reset subcategory when new chapter starts
            current_subcategory = None 
            continue
        
        # Subcategory
        if line.startswith("### "):
            current_subcategory = line.replace("### ", "").strip()
            continue

        # Prompt Item
        # Matches: "1. **Title**: "Content"" or "1. **Title**: Content"
        match = re.match(r"^\d+\.\s*\*\*(.*?)\*\*:\s*\"?(.*?)\"?$", line)
        if match:
            # If we had a previous multi-line prompt, save it? 
            # (Simple parsing for now, assuming 1-line prompts based on file view)
            title = match.group(1)
            content = match.group(2)
            
            prompts.append({
                "id": len(prompts) + 1,
                "category": current_category,
                "subcategory": current_subcategory,
                "title": title,
                "content": content
            })

    return prompts

data = parse_markdown(source_path)

# Convert to JS file export
js_content = f"const promptData = {json.dumps(data, indent=2, ensure_ascii=False)};"

with open(output_path, 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"Parsed {len(data)} prompts.")
