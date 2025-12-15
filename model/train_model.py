import pandas as pd
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
import os

# Define paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, '../data/job_postings.csv')
MODEL_PATH = os.path.join(BASE_DIR, 'scam_model.pkl')
VECTORIZER_PATH = os.path.join(BASE_DIR, 'vectorizer.pkl')

def train_model():
    print("Loading dataset...")
    try:
        df = pd.read_csv(DATA_PATH)
    except FileNotFoundError:
        print(f"Error: Dataset not found at {DATA_PATH}")
        return

    # Basic preprocessing
    X = df['description']
    y = df['label']

    print("Training model...")
    # Create a pipeline with TF-IDF and Naive Bayes
    model = make_pipeline(TfidfVectorizer(stop_words='english'), MultinomialNB())
    model.fit(X, y)

    print("Saving model and vectorizer...")
    # Save the pipeline (which includes vectorizer and classifier)
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(model, f)
    
    print("Model trained and saved successfully.")

if __name__ == "__main__":
    train_model()
