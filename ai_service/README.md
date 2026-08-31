# 🤖 HoneyChain AI Quality & Spectrometry Microservice

> **Part of the HoneyChain by TrueTag Ecosystem**  
> **Team:** Crimson Syndicate (CS Syndicate)  
> **Smart India Hackathon (SIH) 2026** | **Problem Statement:** SIH26021  

---

## 🔬 Service Overview

The **HoneyChain AI Microservice** is a high-performance Python FastAPI service that powers multi-parameter laboratory quality grading, FSSAI IS 4941 compliance checking, Isotope Ratio Mass Spectrometry ($\delta^{13}\text{C}$ VPDB) evaluation, and Specific Marker for Rice syrup (SMR) adulteration detection.

```text
  Laboratory Data / OCR Transcript
                 │
                 ▼
  ┌──────────────────────────────────────────────────────────┐
  │                 FastAPI AI Microservice                  │
  ├──────────────────────────────────────────────────────────┤
  │  1. Multi-Parameter Regressor (Random Forest, R²: 0.92)  │
  │  2. Adulteration Classifier (99.42% Benchmark Accuracy)  │
  │  3. Physics-Bounded Rule Engine (FSSAI IS 4941:2019)     │
  │  4. Gemini Vision Melissopalynology Botanical Analysis   │
  └──────────────────────────────────────────────────────────┘
                 │
                 ▼
  Quality Score (0-100) + FSSAI Violations + On-Chain Proof
```

---

## 👥 Authors & Contributors — Team Crimson Syndicate (CS Syndicate)

- **Shivam Gawade**
- **Rahul Rathod**
- **Rehan Harmalkar**
- **Avneesh Walwalkar**
- **Sunehri Sonar**
- **Shaunak Pai**

---

## 🚀 Live Microservice Deployment

- **Live URL**: [https://honeychain-ai-service.onrender.com](https://honeychain-ai-service.onrender.com)
- **Framework**: FastAPI (Python 3.11) + Uvicorn + Scikit-Learn + NumPy + Pandas
- **Container**: Docker container deployed on Render

---

## 📊 Model Training & Dataset

Train the model locally against the 6,000-record FSSAI/ICAR benchmark dataset:

```bash
# Install dependencies
pip install -r requirements.txt

# Train models and export joblib binaries
python train.py
```

### Verified Performance Metrics

- **Classification Accuracy**: **99.42%**
- **Purity Regression $R^2$**: **0.9213**
- **Key Features**: Moisture %, Brix index, HMF (mg/kg), Diastase Activity (DN), $\delta^{13}\text{C}$ Isotope, C4 Sugar %, SMR marker
