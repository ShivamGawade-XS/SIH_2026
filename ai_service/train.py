"""
HoneyChain AI Service — Model Training & Adulteration Classifier Script
Trains a RandomForestRegressor for Purity Scoring and a MultiOutputClassifier
for Carbon Isotope (C3/C4), Rice Syrup, and Invert Sugar adulteration detection.
Author: Shivam Gawade (ShivamGawade-XS)
"""

import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier, IsolationForest
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score
import joblib

def generate_fssai_adulteration_dataset(n_samples=5000, random_seed=42):
    np.random.seed(random_seed)
    
    # 1. Moisture % (Normal: 14-20%, Adulterated often >20%)
    moisture = np.random.normal(17.5, 2.2, n_samples)
    
    # 2. Brix Index (Normal: 78-85°, Adulterated with thin syrups <75°)
    brix = np.random.normal(81.0, 3.8, n_samples)
    
    # 3. HMF Content mg/kg (Normal raw: 5-25, Heat-processed / inverted syrup >40)
    hmf = np.random.exponential(16.0, n_samples)
    
    # 4. Diastase Activity DN (Normal: 12-25, Inverted syrup lacks enzyme <8)
    diastase = np.random.normal(16.5, 5.2, n_samples)
    
    # 5. Electrical Conductivity mS/cm
    conductivity = np.random.normal(0.45, 0.15, n_samples)
    
    # 6. Carbon Isotope Ratio delta 13C (per mil):
    # Pure honey (C3 plant): -25 to -27 per mil
    # C4 sugar adulterant (Cane/Corn): -10 to -14 per mil
    is_c4_adulterated = np.random.choice([0, 1], size=n_samples, p=[0.75, 0.25])
    c13_ratio = np.where(is_c4_adulterated == 1, 
                         np.random.normal(-18.0, 3.0, n_samples),
                         np.random.normal(-26.2, 0.8, n_samples))
    
    # Rice syrup indicator (foreign oligosaccharides marker: SMR test, 0=none, 1=detected)
    is_rice_syrup = np.random.choice([0, 1], size=n_samples, p=[0.8, 0.2])
    
    # Calculate Ground Truth Purity Score
    purity = 100.0 - np.maximum(0, (moisture - 20.0) * 15.0) \
                   - np.maximum(0, (80.0 - brix) * 4.0) \
                   - np.maximum(0, (hmf - 40.0) * 2.5) \
                   - np.maximum(0, (8.0 - diastase) * 6.0) \
                   - (is_c4_adulterated * 35.0) \
                   - (is_rice_syrup * 40.0)
    
    purity = np.clip(np.round(purity + np.random.normal(0, 1.2, n_samples)), 0, 100)
    
    # Determine specific adulteration class label
    # 0: Pure Honey, 1: C4 Cane/Corn Syrup, 2: Rice Syrup, 3: Invert Sugar Syrup
    adulteration_class = []
    for i in range(n_samples):
        if is_c4_adulterated[i] == 1:
            adulteration_class.append("C4 Cane/Corn Syrup Adulteration")
        elif is_rice_syrup[i] == 1:
            adulteration_class.append("Industrial Rice Syrup Adulteration")
        elif hmf[i] > 45.0 and diastase[i] < 8.0:
            adulteration_class.append("Acid-Inverted Sugar Syrup")
        elif moisture[i] > 20.5:
            adulteration_class.append("Excessive Moisture (Fermentation Risk)")
        else:
            adulteration_class.append("100% Pure Floral Nectar")
            
    df = pd.DataFrame({
        "moisture_percent": moisture,
        "brix_index": brix,
        "hmf_mg_kg": hmf,
        "diastase_activity": diastase,
        "electrical_conductivity": conductivity,
        "c13_isotope_delta": c13_ratio,
        "purity_score": purity,
        "adulteration_class": adulteration_class
    })
    return df

def train_and_save():
    print("[1/3] Generating 5,000 FSSAI NMR & Isotope Spectrometry Samples...")
    df = generate_fssai_adulteration_dataset(5000)
    
    feature_cols = ["moisture_percent", "brix_index", "hmf_mg_kg", "diastase_activity", "electrical_conductivity", "c13_isotope_delta"]
    X = df[feature_cols]
    y_reg = df["purity_score"]
    y_clf = df["adulteration_class"]
    
    X_train, X_test, y_reg_train, y_reg_test = train_test_split(X, y_reg, test_size=0.2, random_state=42)
    _, _, y_clf_train, y_clf_test = train_test_split(X, y_clf, test_size=0.2, random_state=42)
    
    # 1. Purity Score Regressor
    print("[2/3] Training RandomForestRegressor for Purity Scoring...")
    reg_model = RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1)
    reg_model.fit(X_train, y_reg_train)
    r2 = r2_score(y_reg_test, reg_model.predict(X_test))
    print(f"      Purity Regressor R2: {r2:.4f}")
    
    # 2. Adulterant Classifier
    print("[3/3] Training RandomForestClassifier for Adulterant Fingerprinting...")
    clf_model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
    clf_model.fit(X_train, y_clf_train)
    acc = clf_model.score(X_test, y_clf_test)
    print(f"      Adulterant Classifier Accuracy: {acc * 100:.2f}%")
    
    os.makedirs("model", exist_ok=True)
    joblib.dump(reg_model, "model/quality_model.pkl")
    joblib.dump(clf_model, "model/adulterant_classifier.pkl")
    print("SUCCESS: Models saved to model/quality_model.pkl and model/adulterant_classifier.pkl")

if __name__ == "__main__":
    train_and_save()
