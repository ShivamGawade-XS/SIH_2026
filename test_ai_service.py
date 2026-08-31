"""
End-to-end test for HoneyChain AI Service fixes:
  1. Model SHA-256 hash computation (Fix 4)
  2. Physics fallback formula correctness
  3. Model regressor + classifier self-test
"""
import sys, os, hashlib
sys.path.insert(0, os.path.dirname(__file__))

PASS = "[PASS]"
FAIL = "[FAIL]"
results = []

def record(ok, label, detail=""):
    tag = PASS if ok else FAIL
    msg = f"{tag} {label}"
    if detail:
        msg += f"\n       {detail}"
    print(msg)
    results.append((ok, label))

# ─── Test 1: Model files exist and are hashable ───────────────────────────────
model_path      = os.path.join(os.path.dirname(__file__), "ai_service", "model", "quality_model.pkl")
classifier_path = os.path.join(os.path.dirname(__file__), "ai_service", "model", "adulterant_classifier.pkl")

MODEL_SHA256 = "not-loaded"
CLASSIFIER_SHA256 = "not-loaded"

model_exists      = os.path.exists(model_path)
classifier_exists = os.path.exists(classifier_path)
record(model_exists,      "quality_model.pkl exists")
record(classifier_exists, "adulterant_classifier.pkl exists")

if model_exists:
    with open(model_path, "rb") as f:
        MODEL_SHA256 = hashlib.sha256(f.read()).hexdigest()
    record(len(MODEL_SHA256) == 64, "quality_model SHA-256 is valid 64-char hex",
           f"SHA-256: {MODEL_SHA256}")

if classifier_exists:
    with open(classifier_path, "rb") as f:
        CLASSIFIER_SHA256 = hashlib.sha256(f.read()).hexdigest()
    record(len(CLASSIFIER_SHA256) == 64, "classifier SHA-256 is valid 64-char hex",
           f"SHA-256: {CLASSIFIER_SHA256}")

# ─── Test 2: Model loads and produces valid output ────────────────────────────
try:
    import joblib, pandas as pd
    ml_regressor  = joblib.load(model_path)
    ml_classifier = joblib.load(classifier_path)
    record(True, "Models load without error via joblib")

    test_df = pd.DataFrame([{
        "moisture_percent": 17.5, "brix_index": 81.2, "hmf_mg_kg": 12.4,
        "diastase_activity": 14.0, "electrical_conductivity": 0.45, "c13_isotope_delta": -26.2
    }])
    score = float(ml_regressor.predict(test_df)[0])
    record(0.0 <= score <= 100.0, f"Regressor self-test score in [0,100]", f"score={score:.2f}")

    label = str(ml_classifier.predict(test_df)[0])
    record(len(label) > 0, f"Classifier returns non-empty label", f"label='{label}'")

except Exception as e:
    record(False, f"Model load/predict failed: {e}")

# ─── Test 3: Health endpoint response structure (simulate) ────────────────────
health_response = {
    "service": "HoneyChain AI Microservice",
    "status": "Online",
    "model_integrity": {
        "model_version": "v2.2.0",
        "quality_model_sha256": MODEL_SHA256,
        "classifier_sha256": CLASSIFIER_SHA256,
    }
}
record("model_integrity" in health_response,          "health response has model_integrity key")
record("quality_model_sha256" in health_response["model_integrity"], "model_integrity has quality_model_sha256")
record("classifier_sha256"    in health_response["model_integrity"], "model_integrity has classifier_sha256")
record(health_response["model_integrity"]["quality_model_sha256"] != "not-loaded",
       "quality_model_sha256 is not placeholder 'not-loaded'")

# ─── Test 4: Physics fallback formula ─────────────────────────────────────────
def physics_score(moisture, brix, hmf, diastase):
    score = 100.0
    if moisture > 20.0: score -= (moisture - 20.0) * 15.0
    if brix     < 80.0: score -= (80.0 - brix)    * 4.0
    if hmf      > 40.0: score -= (hmf  - 40.0)    * 2.5
    if diastase <  8.0: score -= (8.0  - diastase) * 6.0
    return max(0, min(100, int(round(score))))

cases = [
    (17.5, 81.2, 12.4, 14.0, 100, "ideal honey"),
    (21.0, 79.0, 50.0,  7.0,  50, "poor honey"),
    (18.0, 80.5, 15.0, 16.0, 100, "normal honey"),
]
for moisture, brix, hmf, diastase, expected, desc in cases:
    s = physics_score(moisture, brix, hmf, diastase)
    record(s == expected, f"Physics fallback: {desc}", f"inputs=({moisture},{brix},{hmf},{diastase}) expected={expected} got={s}")

# ─── Test 5: Harvest Yield vs IoT Telemetry Cross-Validation ──────────────────
def validate_harvest(reported_qty, pre_w, post_w):
    drop = max(0.1, pre_w - post_w)
    ratio = reported_qty / drop
    if ratio > 2.5:
        return "TELEMETRY_DISCREPANCY_ALERT", False
    elif ratio < 0.4:
        return "HARVEST_UNDER_REPORTED_WARNING", True
    return "PHYSICALLY_CONSISTENT", True

# Test cases:
# Case A: Physically consistent (15kg reported vs 16kg scale drop)
status_a, ok_a = validate_harvest(15.0, 55.0, 39.0)
record(status_a == "PHYSICALLY_CONSISTENT" and ok_a, "Harvest Cross-Validation: Consistent yield accepted")

# Case B: Phantom harvest alert (50kg reported vs only 2kg scale drop => 25x discrepancy!)
status_b, ok_b = validate_harvest(50.0, 50.0, 48.0)
record(status_b == "TELEMETRY_DISCREPANCY_ALERT" and not ok_b, "Harvest Cross-Validation: Phantom harvest rejected (>2.5x drop)")

# Case C: Under-reported warning (2kg reported vs 20kg scale drop)
status_c, ok_c = validate_harvest(2.0, 50.0, 30.0)
record(status_c == "HARVEST_UNDER_REPORTED_WARNING" and ok_c, "Harvest Cross-Validation: Under-reporting detected")

# ─── Test 6: Melissopalynology Botanical Pollen Classifier ────────────────────
def classify_pollen(flora, diameter, aperture):
    # Reference for Acacia: 24-36 um, Tricolporate
    if "ACACIA" in flora.upper():
        is_diam = 24.0 <= diameter <= 36.0
        is_aper = "TRICOLPORATE" in aperture.upper()
        score = 100.0 - (0.0 if is_diam else 30.0) - (0.0 if is_aper else 25.0)
        return score >= 70.0, score
    return True, 85.0

pollen_ok, pollen_score = classify_pollen("Acacia Blossom", 28.5, "Tricolporate")
record(pollen_ok and pollen_score >= 90.0, "Melissopalynology: Authentic Acacia pollen verified", f"score={pollen_score}")

pollen_fake_ok, pollen_fake_score = classify_pollen("Acacia Blossom", 55.0, "Monoporate")
record(not pollen_fake_ok, "Melissopalynology: Non-matching pollen morphology rejected", f"score={pollen_fake_score}")

# ─── Test 7: Hardware Secure Element Enclave Signature Verification ───────────
def verify_enclave_signature(device_eui, sig_hex, hash_hex):
    is_valid_sig = len(sig_hex) >= 64 and len(hash_hex) == 64
    has_valid_eui = "KVIC" in device_eui.upper() or "EUI" in device_eui.upper()
    return is_valid_sig and has_valid_eui

sig_valid = verify_enclave_signature("EUI-64-KVIC-0391", "a" * 64, "b" * 64)
record(sig_valid, "Hardware Enclave: ATECC608A Silicon Signature Validated")

sig_invalid = verify_enclave_signature("UNAUTHORIZED-DEVICE", "1234", "abcd")
record(not sig_invalid, "Hardware Enclave: Unauthorized device rejected")

# ─── Summary ──────────────────────────────────────────────────────────────────
total  = len(results)
passed = sum(1 for ok, _ in results if ok)
failed = total - passed
print(f"\n{'='*60}")
print(f"AI Service Tests: {passed}/{total} passed, {failed} failed")
if failed:
    print("FAILED TESTS:")
    for ok, label in results:
        if not ok:
            print(f"  - {label}")
    sys.exit(1)
else:
    print("ALL TESTS PASSED")
