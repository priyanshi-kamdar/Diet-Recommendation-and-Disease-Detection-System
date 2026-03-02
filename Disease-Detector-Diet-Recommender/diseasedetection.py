import warnings
warnings.filterwarnings("ignore")

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from flask import Flask, request, jsonify
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# -----------------------------
# 1️⃣ Load Dataset
# -----------------------------
print("\n📂 Loading dataset...")
df = pd.read_csv("Diseases_and_Symptoms_balanced_25rows.csv")

X = df.drop(columns=['diseases'])
y = df['diseases']

# -----------------------------
# 2️⃣ Split and Train Model
# -----------------------------
print("🚀 Training model...")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

model = RandomForestClassifier(
    n_estimators=200,     # good balance for i5
    max_depth=18,         # prevents overfitting
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)

# -----------------------------
# 3️⃣ Evaluate Model
# -----------------------------
y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"\n✅ Model trained successfully with {acc * 100:.2f}% accuracy!\n")

# -----------------------------
# 4️⃣ Prediction Function
# -----------------------------
def predict_disease(symptom_input):
    user_symptoms = [s.strip().lower() for s in symptom_input.split(",") if s.strip()]
    input_vector = np.zeros(len(X.columns))

    for i, col in enumerate(X.columns):
        col_clean = col.lower().replace("_", " ").strip()
        if col_clean in user_symptoms:
            input_vector[i] = 1

    # Get predicted class and probability
    probas = model.predict_proba([input_vector])[0]
    best_idx = np.argmax(probas)
    best_disease = model.classes_[best_idx]
    confidence = probas[best_idx] * 100

    return best_disease, confidence

# -----------------------------
# 5️⃣ Flask Routes
# -----------------------------
@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    symptoms = data.get('symptoms', '')
    if not symptoms:
        return jsonify({'error': 'No symptoms provided'}), 400

    disease, confidence = predict_disease(symptoms)
    return jsonify({
        'disease': disease,
        'confidence': round(confidence, 2)
    })

@app.route('/')
def home():
    return "Disease Detection API is running!"

# -----------------------------
# 6️⃣ Run the App
# -----------------------------
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
