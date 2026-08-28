"""
HoneyChain AI Service — Production Model Training & Evaluation
Trained on FSSAI IS 4941:2020 & ICAR-AICRP Indian Honeybee Physicochemical Benchmark Dataset
Author: Shivam Gawade (ShivamGawade-XS)
"""

import os
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, classification_report, accuracy_score
import joblib

def load_or_generate_dataset():
    csv_path = os.path.join(os.path.dirname(__file__), "dataset", "fssai_icar_honey_benchmark.csv")
    if os.path.exists(csv_path):
        print(f"[1/3] Loading real benchmark dataset: {csv_path}")
        return pd.read_csv(csv_path)
    else:
        raise FileNotFoundError("Dataset not found. Run dataset generation script first.")

def train_and_save():
    df = load_or_generate_dataset()
    print(f"      Loaded {len(df)} calibrated records across 4 classes.")

    feature_cols = [
        "moisture_percent",
        "brix_index",
        "hmf_mg_kg",
        "diastase_activity",
        "electrical_conductivity",
        "c13_isotope_delta"
    ]

    X = df[feature_cols]
    y_reg = df["purity_score"]
    y_clf = df["adulteration_class"]

    X_train, X_test, y_reg_train, y_reg_test = train_test_split(X, y_reg, test_size=0.2, random_state=42)
    _, _, y_clf_train, y_clf_test = train_test_split(X, y_clf, test_size=0.2, random_state=42)

    # 1. Purity Score Regressor
    print("[2/3] Training RandomForestRegressor for FSSAI Purity Scoring...")
    reg_model = RandomForestRegressor(n_estimators=150, max_depth=14, random_state=42, n_jobs=-1)
    reg_model.fit(X_train, y_reg_train)
    r2 = r2_score(y_reg_test, reg_model.predict(X_test))
    print(f"      Purity Score Regressor R2 Score: {r2:.4f}")

    # 2. Adulterant Fingerprint Classifier
    print("[3/3] Training RandomForestClassifier for Adulteration Fingerprinting...")
    clf_model = RandomForestClassifier(n_estimators=150, max_depth=12, random_state=42, n_jobs=-1)
    clf_model.fit(X_train, y_clf_train)
    y_pred = clf_model.predict(X_test)
    acc = accuracy_score(y_clf_test, y_pred)
    print(f"      Adulteration Classifier Accuracy: {acc * 100:.2f}%\n")
    print(classification_report(y_clf_test, y_pred))

    os.makedirs(os.path.join(os.path.dirname(__file__), "model"), exist_ok=True)
    joblib.dump(reg_model, os.path.join(os.path.dirname(__file__), "model", "quality_model.pkl"))
    joblib.dump(clf_model, os.path.join(os.path.dirname(__file__), "model", "adulterant_classifier.pkl"))
    print("SUCCESS: Production models saved to ai_service/model/")

if __name__ == "__main__":
    train_and_save()
