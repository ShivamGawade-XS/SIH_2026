"""
FSSAI Honey Regulations 2020 & APEDA Export Standards Matrix
Reference:
- FSSAI (Food Products Standards and Food Additives) Regulations, 2020 (Gazette Notification F. No. 1-116/FSSAI/T/2014)
- FSSAI Manual of Methods of Analysis of Foods: Beverages, Sugars and Confectionery Products (Manual 14)
- Codex Alimentarius Standard for Honey (CXS 12-1981, Rev. 2001)
- Directorate of Marketing & Inspection (DMI) Agmark Rules for Honey (Grading and Marking Rules, 2008)
"""

from typing import Dict, Any, List, Tuple

FSSAI_STANDARDS = {
    "moisture_percent": {
        "name": "Moisture Content",
        "max": 20.0,
        "unit": "%",
        "rationale": "High moisture (>20%) allows osmophilic yeasts (Zygosaccharomyces) to ferment honey into alcohol and acetic acid."
    },
    "specific_gravity": {
        "name": "Specific Gravity at 27°C",
        "min": 1.35,
        "unit": "ratio",
        "rationale": "Measures density; values <1.35 indicate artificial water dilution."
    },
    "reducing_sugars": {
        "name": "Total Reducing Sugars (Fructose + Glucose)",
        "min": 65.0,
        "unit": "%",
        "rationale": "Pure blossom honey contains >65% natural reducing hexose sugars."
    },
    "f_g_ratio": {
        "name": "Fructose to Glucose Ratio",
        "min": 0.95,
        "unit": "ratio",
        "rationale": "Naturally balanced honey has F/G ratio >= 0.95. High glucose leads to premature crystallization."
    },
    "sucrose_percent": {
        "name": "Apparent Sucrose",
        "max": 5.0,
        "unit": "%",
        "rationale": "Sucrose >5% indicates cane/beet sugar feeding or table sugar syrup adulteration."
    },
    "hmf_mg_per_kg": {
        "name": "Hydroxymethylfurfural (HMF)",
        "max_domestic": 40.0,
        "max_tropical": 80.0,
        "unit": "mg/kg",
        "rationale": "Decomposition product of fructose formed by excessive heat processing or long storage at elevated temperatures."
    },
    "diastase_number": {
        "name": "Diastase (Amylase) Activity",
        "min": 8.0,
        "unit": "DN (Schade units)",
        "rationale": "Natural enzyme introduced by worker bees. Destroyed by overheating."
    },
    "c4_sugars_percent": {
        "name": "C4 Plant Sugars (EA-IRMS 13C/12C)",
        "max": 7.0,
        "unit": "%",
        "rationale": "Detects high-fructose corn syrup (HFCS) and cane sugar via stable carbon isotope ratio mass spectrometry."
    },
    "pollen_count_per_gram": {
        "name": "Absolute Pollen Count",
        "min": 25000,
        "unit": "grains/g",
        "rationale": "Microfiltration removes pollen to conceal origin; genuine honey must contain >= 25,000 pollen grains/g."
    }
}

def evaluate_fssai_compliance(params: Dict[str, float]) -> Dict[str, Any]:
    """
    Evaluates a dictionary of lab parameters against statutory FSSAI Gazette 2020 & Agmark rules.
    """
    results: List[Dict[str, Any]] = []
    failed_params: List[str] = []
    
    # 1. Moisture
    moisture = params.get("moisture_percent", 18.2)
    m_pass = moisture <= FSSAI_STANDARDS["moisture_percent"]["max"]
    results.append({
        "parameter": "Moisture",
        "value": f"{moisture:.1f}%",
        "limit": "<= 20.0%",
        "passed": m_pass,
        "details": FSSAI_STANDARDS["moisture_percent"]["rationale"]
    })
    if not m_pass: failed_params.append("Moisture")

    # 2. HMF
    hmf = params.get("hmf_mg_per_kg", 14.5)
    hmf_pass = hmf <= FSSAI_STANDARDS["hmf_mg_per_kg"]["max_tropical"]
    results.append({
        "parameter": "HMF (Freshness)",
        "value": f"{hmf:.1f} mg/kg",
        "limit": "<= 40 mg/kg (<= 80 for tropical)",
        "passed": hmf_pass,
        "details": FSSAI_STANDARDS["hmf_mg_per_kg"]["rationale"]
    })
    if not hmf_pass: failed_params.append("HMF")

    # 3. Reducing Sugars
    sugars = params.get("reducing_sugars", 71.4)
    s_pass = sugars >= FSSAI_STANDARDS["reducing_sugars"]["min"]
    results.append({
        "parameter": "Reducing Sugars (F+G)",
        "value": f"{sugars:.1f}%",
        "limit": ">= 65.0%",
        "passed": s_pass,
        "details": FSSAI_STANDARDS["reducing_sugars"]["rationale"]
    })
    if not s_pass: failed_params.append("Reducing Sugars")

    # 4. F/G Ratio
    fg = params.get("f_g_ratio", 1.12)
    fg_pass = fg >= FSSAI_STANDARDS["f_g_ratio"]["min"]
    results.append({
        "parameter": "F/G Ratio",
        "value": f"{fg:.2f}",
        "limit": ">= 0.95",
        "passed": fg_pass,
        "details": FSSAI_STANDARDS["f_g_ratio"]["rationale"]
    })
    if not fg_pass: failed_params.append("F/G Ratio")

    # 5. Sucrose
    sucrose = params.get("sucrose_percent", 1.8)
    suc_pass = sucrose <= FSSAI_STANDARDS["sucrose_percent"]["max"]
    results.append({
        "parameter": "Apparent Sucrose",
        "value": f"{sucrose:.1f}%",
        "limit": "<= 5.0%",
        "passed": suc_pass,
        "details": FSSAI_STANDARDS["sucrose_percent"]["rationale"]
    })
    if not suc_pass: failed_params.append("Sucrose")

    # 6. Diastase
    diastase = params.get("diastase_number", 14.2)
    dia_pass = diastase >= FSSAI_STANDARDS["diastase_number"]["min"]
    results.append({
        "parameter": "Diastase Enzyme Activity",
        "value": f"{diastase:.1f} DN",
        "limit": ">= 8.0 DN",
        "passed": dia_pass,
        "details": FSSAI_STANDARDS["diastase_number"]["rationale"]
    })
    if not dia_pass: failed_params.append("Diastase")

    # 7. C4 Sugars (Isotope Ratio)
    c4 = params.get("c4_sugars_percent", 0.9)
    c4_pass = c4 <= FSSAI_STANDARDS["c4_sugars_percent"]["max"]
    results.append({
        "parameter": "C4 Sugar Adulteration (IRMS)",
        "value": f"{c4:.1f}%",
        "limit": "<= 7.0%",
        "passed": c4_pass,
        "details": FSSAI_STANDARDS["c4_sugars_percent"]["rationale"]
    })
    if not c4_pass: failed_params.append("C4 Sugars")

    # 8. Agmark Grading Classification
    is_fssai_compliant = len(failed_params) == 0
    
    agmark_grade = "Substandard"
    if is_fssai_compliant:
        if moisture <= 19.0 and hmf <= 30.0 and sucrose <= 3.5 and diastase >= 10.0 and fg >= 1.0:
            agmark_grade = "Agmark Special Grade (Premium Export)"
        else:
            agmark_grade = "Agmark Standard Grade (Commercial)"

    # Compute overall purity score (0 - 100)
    score_deductions = (
        max(0, (moisture - 18.0) * 3) +
        max(0, (hmf - 20.0) * 0.8) +
        max(0, (5.0 - min(5.0, diastase / 2.5)) * 4) +
        max(0, (sucrose - 2.0) * 5) +
        (c4 * 6)
    )
    purity_score = max(50.0, min(99.8, 99.8 - score_deductions))

    return {
        "is_fssai_compliant": is_fssai_compliant,
        "agmark_grade": agmark_grade,
        "purity_score": round(purity_score, 1),
        "failed_parameters": failed_params,
        "tests": results,
        "regulatory_gazette": "FSSAI Standards Gazette F. No. 1-116/FSSAI/T/2014 (IS 4941:2020)",
        "apeda_export_eligible": is_fssai_compliant and c4 <= 5.0 and hmf <= 40.0
    }
