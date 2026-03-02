"""
app.py  ?ï¿? PhytoScan Flask å¾Œç«¯ API
"""
import os, io, json, base64, time, re
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import numpy as np
from PIL import Image

app = Flask(__name__)
CORS(app)

BASE_DIR     = Path(__file__).parent
MODEL_PATH   = BASE_DIR / "models" / "plant_disease_model.keras"
ALT_MODEL    = BASE_DIR / "models" / "best_model.keras"
CLASS_JSON   = BASE_DIR / "data"   / "class_names.json"
DISEASE_JSON = BASE_DIR / "diseases_updated.json"
UPLOAD_DIR   = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

IMG_SIZE = (224, 224)

# ?ï¿?ï¿?ï¿?å·¥å…·ï¼šçµ±ä¸€ kaggle_class ?ï¿½ï¿½? ?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?
def normalize_kaggle_class(cls: str) -> str:
    """
    å°‡ï¿½?ç¨®æ ¼å¼çµ±ä¸€??diseases.json ?ï¿½ï¿½?åº•ï¿½??ï¿½ï¿½?
    ä¾‹ï¿½?ï¿?
      Tomato_Early_blight   ??Tomato___Early_blight
      Tomato__Early_blight  ??Tomato___Early_blight
      Tomato___Early_blight ??Tomato___Early_blightï¼ˆï¿½?è®Šï¿½?
    """
    # ?ï¿½ï¿½??ï¿?ï¿½ï¿½??åº•ï¿½?å£“ï¿½??ï¿½ï¿½?ï¿?
    cls = re.sub(r'_+', '_', cls)
    # ?ï¿½ï¿½??ï¿½ï¿½??ï¿½ï¿½?_?ï¿½å®³?ï¿½ã€ï¿½??ï¿½ï¿½??ï¿½ï¿½?ä¸‰ï¿½?ï¿?
    # è¦ï¿½?ï¼šå¤§å¯«ï¿½??ï¿½ï¿½?ç¬¬ï¿½??ï¿½å–®å­—ï¿½??ï¿½ï¿½? ___
    # ä¾‹ï¿½? Tomato_Early ??Tomato___Early
    cls = re.sub(r'_([A-Z])', r'___\1', cls)
    return cls

# ?ï¿?ï¿?ï¿??ï¿½ï¿½?æ¨¡ï¿½? (lazy load) ?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?
_model       = None
_class_names = None
_diseases_db = None      # dict: normalized_kaggle_class ??disease record
_diseases_by_id = None   # dict: id ??disease record

def get_model():
    global _model
    if _model is None:
        path = MODEL_PATH if MODEL_PATH.exists() else (ALT_MODEL if ALT_MODEL.exists() else None)
        if path:
            from tensorflow import keras
            _model = keras.models.load_model(path)
            print(f"??æ¨¡ï¿½?è¼‰å…¥ï¼š{path.name}")
        else:
            _model = "DEMO"
            print("?ï¿½ï¿½?  æ¨¡ï¿½??ï¿½ï¿½?ç·´ï¿½?ä½¿ç”¨ DEMO æ¨¡ï¿½?")
    return _model

def get_class_names():
    global _class_names
    if _class_names is None:
        if CLASS_JSON.exists():
            with open(CLASS_JSON, encoding="utf-8") as f:
                _class_names = json.load(f)["classes"]
        else:
            _class_names = list(get_diseases_db().keys())
    return _class_names

def get_diseases_db():
    """?ï¿½å‚³ï¿?normalized kaggle_class ??key ?ï¿½ï¿½???""
    global _diseases_db, _diseases_by_id
    if _diseases_db is None:
        if DISEASE_JSON.exists():
            with open(DISEASE_JSON, encoding="utf-8") as f:  # ??ä¿®æ­£ç·¨ç¢¼
                data = json.load(f)
            _diseases_db    = {}
            _diseases_by_id = {}
            disease_list = data if isinstance(data, list) else data.get("diseases", [])
            for d in disease_list:
                # ?ï¿½ï¿½?å»ºï¿½??ï¿½ï¿½? key ??normalized keyï¼Œç¢ºä¿å…©ç¨®æ ¼å¼éƒ½?ï¿½æ‰¾??
                original_key   = d.get("kaggle_class", "")
                normalized_key = normalize_kaggle_class(original_key)
                _diseases_db[original_key]   = d
                _diseases_db[normalized_key] = d
                # ï¿?id ??key ?ï¿½ï¿½??ï¿½ï¿½???
                if d.get("id"):
                    _diseases_by_id[d["id"]] = d
        else:
            from scrape_diseases import STATIC_DISEASES
            _diseases_db    = {}
            _diseases_by_id = {}
            for d in STATIC_DISEASES:
                key = d.get("kaggle_class", "")
                _diseases_db[key]                          = d
                _diseases_db[normalize_kaggle_class(key)]  = d
                if d.get("id"):
                    _diseases_by_id[d["id"]] = d
    return _diseases_db

def lookup_disease(kaggle_class: str) -> dict:
    """Lookup disease by kaggle_class, fallback to normalized version."""    db = get_diseases_db()
    return (
        db.get(kaggle_class)
        or db.get(normalize_kaggle_class(kaggle_class))
        or {}
    )

# ?ï¿?ï¿?ï¿??ï¿½ï¿½??ï¿½ï¿½????ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?
def preprocess_image(img: Image.Image) -> np.ndarray:
    img = img.convert("RGB").resize(IMG_SIZE)
    arr = np.array(img, dtype=np.float32) / 255.0
    return np.expand_dims(arr, axis=0)

def demo_predict(img_array: np.ndarray):
    db      = get_diseases_db()
    classes = get_class_names()
    avg_g   = float(np.mean(img_array[0, :, :, 1]))
    healthy_idx = next(
        (i for i, c in enumerate(classes) if "healthy" in c.lower()),
        0
    )
    probs   = np.random.dirichlet(np.ones(len(classes)) * 0.4)
    primary = healthy_idx if avg_g > 0.45 else np.random.randint(0, max(len(classes) - 1, 1))
    probs[primary] = np.random.uniform(0.70, 0.92)
    probs /= probs.sum()
    return classes, probs

# ?ï¿?ï¿?ï¿?API ç«¯ï¿½? ?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?

@app.route('/')
def home():
    return {"message": "Flask API is running!"}







@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "model": "DEMO" if get_model() == "DEMO" else "loaded"})

@app.route("/api/diseases")
def diseases():
    db = get_diseases_db()
    seen = set()
    result = []
    for d in db.values():
        did = d.get("id")
        if did in seen:
            continue
        seen.add(did)
        result.append({
            "id":             d.get("id"),
            "name_zh":        d.get("name_zh"),
            "name_en":        d.get("name_en"),
            "pathogen":       d.get("pathogen"),
            "category":       d.get("category"),
            "severity":       d.get("severity"),
            "severity_level": d.get("severity_level"),
            "host_plants":    d.get("host_plants", []),
            "images":         d.get("images", [])[:1],
        })
    return jsonify({"diseases": result, "total": len(result)})

@app.route("/api/diseases/<disease_id>")
def disease_detail(disease_id):
    global _diseases_by_id
    get_diseases_db()  # ç¢ºï¿½?å·²ï¿½?å§‹ï¿½?
    record = _diseases_by_id.get(disease_id)
    if not record:
        # fallbackï¼šç”¨ kaggle_class ??
        record = lookup_disease(disease_id)
    if not record:
        return jsonify({"error": "?ï¿½ï¿½??ï¿½è©²?ï¿½å®³"}), 404
    return jsonify(record)

@app.route("/api/stats")
def stats():
    db   = get_diseases_db()
    seen = set()
    unique = []
    for d in db.values():
        if d.get("id") not in seen:
            seen.add(d.get("id"))
            unique.append(d)
    return jsonify({
        "total_diseases":        len(unique),
        "total_identifications": 1389,
        "accuracy":              "94.3%",
        "model_version":         "v2.1",
        "dataset":               "PlantVillage (Kaggle) ??54,305 ï¿?,
        "categories": {
            "?ï¿½ï¿½??ï¿½ï¿½?ï¿?: sum(1 for d in unique if d.get("category") == "?ï¿½ï¿½??ï¿½ï¿½?ï¿?),
            "ç´°ï¿½??ï¿½ï¿½?ï¿?: sum(1 for d in unique if d.get("category") == "ç´°ï¿½??ï¿½ï¿½?ï¿?),
            "?ï¿½ï¿½??ï¿½ï¿½?ï¿?: sum(1 for d in unique if d.get("category") == "?ï¿½ï¿½??ï¿½ï¿½?ï¿?),
            "?ï¿½åº·":       sum(1 for d in unique if d.get("category") == "?ï¿½åº·"),
        }
    })

@app.route("/api/predict", methods=["POST"])
def predict():
    # ?ï¿?ï¿??ï¿½ï¿½??ï¿½ï¿½? ?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?
    try:
        if "image" in request.files:
            img = Image.open(request.files["image"].stream)
        elif request.is_json and "image_data" in request.json:
            raw = request.json["image_data"]
            if "," in raw:
                raw = raw.split(",", 1)[1]
            img = Image.open(io.BytesIO(base64.b64decode(raw)))
        else:
            return jsonify({"error": "è«‹ï¿½?ä¾›ï¿½??ï¿½ï¿½?multipart image ??JSON image_dataï¿?}), 400
    except Exception as e:
        return jsonify({"error": f"?ï¿½ï¿½?ï¿??å¤±ï¿½?ï¼š{e}"}), 400

    # ?ï¿?ï¿??ï¿½ï¿½? ?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?
    t0    = time.time()
    arr   = preprocess_image(img)
    model = get_model()

    if model == "DEMO":
        classes, probs = demo_predict(arr)
        mode = "DEMO"
    else:
        raw_pred = model.predict(arr, verbose=0)[0]
        classes  = get_class_names()
        probs    = raw_pred[:len(classes)]
        mode     = "MODEL"

    elapsed = round(time.time() - t0, 2)

    # ?ï¿?ï¿??ï¿½ï¿½?çµï¿½? ?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?ï¿?
    top_idx = np.argsort(probs)[::-1]

    top3 = []
    for i in top_idx[:3]:
        cls = classes[i]
        rec = lookup_disease(cls)  # ??ä½¿ç”¨?ï¿½ï¿½? lookupï¼Œè‡ª?ï¿½ï¿½??ï¿½æ ¼å¼å·®??
        top3.append({
            "kaggle_class": cls,
            "disease_id":   rec.get("id"),
            "disease_name": rec.get("name_zh"),
            "confidence":   float(probs[i]),
            "severity":     rec.get("severity"),
        })

    primary = top3[0]
    detail  = lookup_disease(primary["kaggle_class"])

    distribution = []
    for i in top_idx[:6]:
        cls = classes[i]
        rec = lookup_disease(cls)
        distribution.append({
            "label": rec.get("name_zh") or cls,
            "value": float(probs[i]) * 100,
        })

    return jsonify({
        "success":        True,
        "mode":           mode,
        "elapsed_sec":    elapsed,
        "primary":        primary,
        "top3":           top3,
        "distribution":   distribution,
        "disease_detail": detail,
    })

if __name__ == "__main__":
    # ?ï¿½ï¿½??ï¿½ï¿½??ï¿½ï¿½??ï¿½æ¨¡??
    get_model()
    get_class_names()
    get_diseases_db()
    app.run(debug=True, host="0.0.0.0", port=5000)
