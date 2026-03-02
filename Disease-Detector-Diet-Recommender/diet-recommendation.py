# %%
from flask import Flask, request, jsonify
import pandas as pd
from difflib import get_close_matches
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # allows frontend JS to call Flask API

# Load your diet dataset
df = pd.read_csv("disease_diet_updated_v2.csv")
df['Disease_lower'] = df['Disease'].str.lower()

def get_diet_plan(disease_name):
    disease_name = disease_name.strip().lower()
    match = df[df['Disease_lower'] == disease_name]

    if match.empty:
        possible = get_close_matches(disease_name, df['Disease_lower'], n=1, cutoff=0.6)
        if possible:
            match = df[df['Disease_lower'] == possible[0]]

    if match.empty:
        return None

    record = match.iloc[0]
    return {
        "disease": record["Disease"],
        "foods_to_eat": record["Foods_to_Eat"],
        "foods_to_avoid": record["Foods_to_Avoid"],
        "sample_plan": record["Sample_Day_Plan"]
    }

@app.route("/get_diet", methods=["POST"])
def get_diet():
    data = request.get_json()
    disease_name = data.get("disease", "")
    result = get_diet_plan(disease_name)
    if result:
        return jsonify({"status": "success", "data": result})
    else:
        return jsonify({"status": "error", "message": "Disease not found"}), 404

if __name__ == "__main__":
    app.run(debug=True, port=5002)

