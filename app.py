from flask import Flask, render_template, request, jsonify
import pickle
import os
import re

app = Flask(__name__)

# Load Model
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'model/scam_model.pkl')

model = None
try:
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
except FileNotFoundError:
    print("Model not found. Please run model/train_model.py first.")

# Heuristic Rules
SUSPICIOUS_KEYWORDS = ['fee', 'registration', 'bank details', 'western union', 'moneygram', 'crypto', 'investment', 'consultancy charge']
URGENCY_KEYWORDS = ['immediate', 'urgent', 'start today', 'hiring now', 'limited spots']
FREE_EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com']

def check_heuristics(data):
    flags = []
    score_modifier = 0

    description = data.get('description', '').lower()
    email = data.get('email', '').lower()
    salary = data.get('salary', '').lower()

    # Rule 1: Money/Fee requests
    for word in SUSPICIOUS_KEYWORDS:
        if word in description or word in salary:
            flags.append(f"Suspicious keyword found: '{word}'")
            score_modifier += 40

    # Rule 2: Urgency
    for word in URGENCY_KEYWORDS:
        if word in description:
            flags.append(f"Sense of urgency detected: '{word}'")
            score_modifier += 10

    # Rule 3: Free Email for Official Business
    if email:
        domain = email.split('@')[-1]
        if domain in FREE_EMAIL_DOMAINS:
            flags.append(f"Using free email provider ({domain}) instead of corporate email.")
            score_modifier += 20

    return score_modifier, flags

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if not model:
        return jsonify({'error': 'Model not loaded'}), 500

    data = request.json
    description = data.get('description', '')
    
    # ML Prediction
    try:
        # The pipeline handles vectorization
        ml_prob = model.predict_proba([description])[0][1] # Probability of being scam (class 1)
        ml_score = ml_prob * 100
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    # Heuristic Prediction
    heuristic_score, reasons = check_heuristics(data)

    # Combined Score (Weighted Average or Max)
    # Let's verify: If heuristics strictly find a "fee", it's definitely a scam.
    final_score = min(100, ml_score + heuristic_score)
    
    # Classification
    if final_score > 70:
        prediction = "SCAM" 
    elif final_score > 30:
        prediction = "SUSPICIOUS"
    else:
        prediction = "REAL"

    reasons.append(f"ML Model detected signs with {ml_score:.1f}% confidence.")

    return jsonify({
        'prediction': prediction,
        'confidence': f"{final_score:.1f}%",
        'reasons': reasons
    })

if __name__ == '__main__':
    app.run(debug=True)
