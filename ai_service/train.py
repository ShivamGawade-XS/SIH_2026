"""
HoneyChain AI Service — Model Training Script
Trains a RandomForestRegressor on 5,000 synthetic FSSAI honey spectrometry samples.
Author: Shivam Gawade (ShivamGawade-XS)
"""

import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error
import joblib

def generate_synthetic_fssai_dataset(n_samples=5000, random_seed=42):
    np.random.seed(random_seed)
    
    # 1. Moisture % (Normal distribution centered at 17.5%, range 13% - 25%)
    moisture = np.clip(np.random.normal(17.5, 2.0, n_samples), 13.0, 26.0)
    
    # 2. Brix Index (Normal distribution centered at 81.0, range 65 - 86)
    brix = np.clip(np.random.normal(81.0, 3.5, n_samples), 60.0, 88.0)
    
    # 3. HMF Content mg/kg (Exponential distribution centered around 15, tail up to 100)
    hmf = np.clip(np.random.exponential(15.0, n_samples), 2.0, 110.0)
    
    # 4. Diastase Activity DN (Normal distribution centered around 16.0, range 2 - 35)
    diastase = np.clip(np.random.normal(16.0, 5.0, n_samples), 2.0, 40.0)
    
    # 5. Electrical Conductivity mS/cm (Normal distribution centered around 0.45)
    conductivity = np.clip(np.random.normal(0.45, 0.15, n_samples), 0.1, 1.2)
    
    # Ground truth FSSAI Purity Score formulation
    purity_score = 100.0 - np.maximum(0, (moisture - 20.0) * 15.0) \
                         - np.maximum(0, (80.0 - brix) * 4.0) \
                         - np.maximum(0, (hmf - 40.0) * 2.5) \
                         - np.maximum(0, (8.0 - diastase) * 6.0) \
                         - np.maximum(0, (conductivity - 0.8) * 20.0)
    
    # Add realistic lab measurement noise (+/- 2 pts)
    noise = np.random.normal(0, 1.5, n_samples)
    purity_score = np.clip(np.round(purity_score + noise), 0, 100)
    
    df = pd.DataFrame({
        "moisture_percent": moisture,
        "brix_index": brix,
        "hmf_mg_kg": hmf,
        "diastase_activity": diastase,
        "electrical_conductivity": conductivity,
        "purity_score": purity_score
    })
    return df

def train_and_save_models():
    print("Generating 5,000 synthetic FSSAI honey spectrometry samples...")
    df = generate_synthetic_fssai_dataset(5000)
    
    X = df[["moisture_percent", "brix_index", "hmf_mg_kg", "diastase_activity", "electrical_conductivity"]]
    y = df["purity_score"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training RandomForestRegressor...")
    model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    r2 = r2_score(y_test, preds)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    print(f"Model Trained! R2 Score: {r2:.4f}, RMSE: {rmse:.4f}")
    
    # IsolationForest for Hive Sensor Anomaly Detection
    print("Training IsolationForest for Hive Anomaly Detection...")
    anomaly_data = np.random.normal(loc=[35.0, 60.0, 0.0], scale=[2.0, 10.0, 0.5], size=(2000, 3))
    iso_forest = IsolationForest(contamination=0.05, random_state=42)
    iso_forest.fit(anomaly_data)
    
    # Save artifacts
    os.makedirs("model", exist_ok=True)
    joblib.dump(model, "model/quality_model.pkl")
    joblib.dump(iso_forest, "model/anomaly_model.pkl")
    print("Models saved successfully to model/quality_model.pkl and model/anomaly_model.pkl")

if __name__ == "__main__":
    train_and_save_models()
