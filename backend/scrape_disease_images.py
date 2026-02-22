"""
scrape_disease_images.py
爬取植物病害圖片並更新 diseases.json
執行方式：python scrape_disease_images.py
"""

import os
import time
import json
import hashlib
import requests
from pathlib import Path

# ── 設定 ──────────────────────────────────────────────────────────────────────
SAVE_DIR     = Path("static/disease_images")   # 圖片儲存資料夾
DATA_FILE    = Path("diseases.json")            # 你的病害資料 JSON
OUTPUT_FILE  = Path("diseases_updated.json")    # 更新後輸出
HEADERS      = {"User-Agent": "Mozilla/5.0 (compatible; PhytoScan/1.0)"}
TIMEOUT      = 10

# ── 每個病害對應的 Wikimedia 搜尋關鍵字 ─────────────────────────────────────
# key = disease id，value = [搜尋關鍵字列表（依優先順序）]
DISEASE_QUERIES = {
    "apple_scab":              ["Apple scab Venturia inaequalis", "Apple scab leaf"],
    "apple_black_rot":         ["Apple black rot Botryosphaeria", "Apple black rot fruit"],
    "apple_cedar_rust":        ["Apple cedar rust Gymnosporangium", "Cedar apple rust leaf"],
    "corn_cercospora":         ["Corn gray leaf spot Cercospora zeae", "Maize gray leaf spot"],
    "corn_common_rust":        ["Corn common rust Puccinia sorghi", "Maize rust leaf"],
    "corn_northern_blight":    ["Northern corn leaf blight Exserohilum", "Corn turcicum blight"],
    "grape_black_rot":         ["Grape black rot Guignardia bidwellii", "Grape black rot lesion"],
    "grape_esca":              ["Grape esca disease leaf", "Grape black measles"],
    "grape_leaf_blight":       ["Grape Isariopsis leaf blight", "Grape leaf spot"],
    "orange_haunglongbing":    ["Citrus greening Huanglongbing", "Citrus HLB disease"],
    "peach_bacterial_spot":    ["Peach bacterial spot Xanthomonas", "Peach leaf spot bacteria"],
    "pepper_bacterial_spot":   ["Pepper bacterial spot Xanthomonas", "Bell pepper leaf spot"],
    "potato_early_blight":     ["Potato early blight Alternaria solani", "Potato alternaria leaf"],
    "potato_late_blight":      ["Potato late blight Phytophthora infestans", "Potato blight lesion"],
    "squash_powdery_mildew":   ["Squash powdery mildew Podosphaera xanthii", "Cucurbit powdery mildew"],
    "strawberry_leaf_scorch":  ["Strawberry leaf scorch Diplocarpon earlianum", "Strawberry scorch"],
    "tomato_bacterial_spot":   ["Tomato bacterial spot Xanthomonas", "Tomato leaf bacterial spot"],
    "tomato_early_blight":     ["Tomato early blight Alternaria solani", "Tomato alternaria blight"],
    "tomato_late_blight":      ["Tomato late blight Phytophthora infestans", "Tomato blight leaf"],
    "tomato_leaf_mold":        ["Tomato leaf mold Passalora fulva", "Tomato cladosporium leaf"],
    "tomato_septoria":         ["Tomato septoria leaf spot", "Septoria lycopersici leaf"],
    "tomato_spider_mites":     ["Tomato spider mite damage leaf", "Tetranychus urticae tomato"],
    "tomato_target_spot":      ["Tomato target spot Corynespora", "Tomato Corynespora leaf"],
    "tomato_yellow_leaf_curl": ["Tomato yellow leaf curl virus TYLCV", "Tomato TYLCV symptom"],
    "tomato_mosaic_virus":     ["Tomato mosaic virus ToMV leaf", "Tomato mosaic symptom"],
    "healthy":                 ["Healthy tomato plant leaf", "Green healthy plant leaf"],
}

# ── Wikimedia API 搜尋 ────────────────────────────────────────────────────────
def search_wikimedia(query: str, count: int = 3) -> list[dict]:
    """用 Wikimedia API 搜尋圖片，回傳 [{url, caption, source}] 列表"""
    api_url = "https://en.wikipedia.org/w/api.php"
    params = {
        "action":      "query",
        "generator":   "search",
        "gsrsearch":   f"filetype:bitmap {query}",
        "gsrnamespace": 6,   # File: namespace
        "gsrlimit":    count * 2,
        "prop":        "imageinfo",
        "iiprop":      "url|extmetadata",
        "iiurlwidth":  800,
        "format":      "json",
    }
    try:
        r = requests.get(api_url, params=params, headers=HEADERS, timeout=TIMEOUT)
        r.raise_for_status()
        pages = r.json().get("query", {}).get("pages", {})
        results = []
        for page in pages.values():
            info = page.get("imageinfo", [{}])[0]
            url  = info.get("thumburl") or info.get("url", "")
            if not url or not url.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                continue
            meta    = info.get("extmetadata", {})
            caption = meta.get("ImageDescription", {}).get("value", "")
            # 去掉 HTML tag
            caption = caption.replace("<p>", "").replace("</p>", "").strip()[:100]
            results.append({
                "url":     url,
                "caption": caption or query,
                "source":  "Wikimedia Commons",
            })
            if len(results) >= count:
                break
        return results
    except Exception as e:
        print(f"  [Wikimedia] 搜尋失敗 ({query}): {e}")
        return []

# ── 下載圖片到本地 ────────────────────────────────────────────────────────────
def download_image(url: str) -> str | None:
    """下載圖片，回傳本地相對路徑（失敗回傳 None）"""
    SAVE_DIR.mkdir(parents=True, exist_ok=True)
    ext      = url.split(".")[-1].split("?")[0].lower()
    if ext not in ("jpg", "jpeg", "png", "webp"):
        ext = "jpg"
    filename = hashlib.md5(url.encode()).hexdigest() + f".{ext}"
    filepath = SAVE_DIR / filename
    local_path = f"/static/disease_images/{filename}"

    if filepath.exists():
        print(f"  [快取] {filename}")
        return local_path

    try:
        r = requests.get(url, headers=HEADERS, timeout=TIMEOUT, stream=True)
        r.raise_for_status()
        with open(filepath, "wb") as f:
            for chunk in r.iter_content(8192):
                f.write(chunk)
        print(f"  [下載] {filename}  ← {url[:60]}")
        return local_path
    except Exception as e:
        print(f"  [失敗] {url[:60]} → {e}")
        return None

# ── 主流程 ────────────────────────────────────────────────────────────────────
def main():
    # 讀取現有 diseases.json（若沒有則用空清單）
    if DATA_FILE.exists():
        with open(DATA_FILE, encoding="utf-8") as f:
            data = json.load(f)
        diseases = data if isinstance(data, list) else data.get("diseases", [])
    else:
        # 若沒有 JSON，直接用 DISEASE_QUERIES 的 key 建立最小骨架
        diseases = [{"id": k} for k in DISEASE_QUERIES]
        print(f"找不到 {DATA_FILE}，將只下載圖片並建立基本結構")

    updated = []
    for d in diseases:
        did     = d.get("id") or d.get("_id") or d.get("disease_id", "")
        queries = DISEASE_QUERIES.get(did)

        if not queries:
            print(f"[跳過] {did}（無對應搜尋關鍵字）")
            updated.append(d)
            continue

        # 若已有圖片且都是本地路徑，直接跳過
        existing = d.get("images", [])
        if existing and all(img.get("url", "").startswith("/static/") for img in existing):
            print(f"[已有] {did}")
            updated.append(d)
            continue

        print(f"\n── {did} ──")
        new_images = []

        for query in queries:
            results = search_wikimedia(query, count=2)
            for item in results:
                local = download_image(item["url"])
                if local:
                    new_images.append({
                        "url":     local,
                        "caption": item["caption"],
                        "source":  item["source"],
                    })
            if new_images:
                break   # 第一個成功的關鍵字就夠了
            time.sleep(0.5)

        d["images"] = new_images if new_images else existing
        updated.append(d)
        time.sleep(1)   # 避免過快請求

    # 寫出更新後的 JSON
    output = {"diseases": updated} if not isinstance(data if DATA_FILE.exists() else [], list) else updated
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n✅ 完成！輸出至 {OUTPUT_FILE}")
    print(f"   共處理 {len(updated)} 筆病害")
    print(f"   圖片存放於 {SAVE_DIR}/")
    print(f"\n接下來：")
    print(f"  1. 確認 {OUTPUT_FILE} 內容正確後，取代原本的 diseases.json")
    print(f"  2. 確保 Flask/FastAPI 有 serve static/disease_images/ 目錄")


if __name__ == "__main__":
    main()