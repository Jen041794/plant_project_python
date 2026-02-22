"""
clean_images.py
清理 diseases.json 中的非圖片 URL（.pdf、.ogv 等）
執行方式：python clean_images.py
"""
import json
import os

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"}
JSON_PATH  = os.path.join("scraped_data", "diseases.json")


def is_image_url(url: str) -> bool:
    """判斷 URL 是否為圖片"""
    # 去掉 query string 後取副檔名
    path = url.split("?")[0].lower()
    ext  = "." + path.rsplit(".", 1)[-1] if "." in path else ""
    return ext in IMAGE_EXTS


def clean():
    with open(JSON_PATH, encoding="utf-8") as f:
        data = json.load(f)

    total_removed = 0

    for disease in data["diseases"]:
        before = disease.get("images", [])
        after  = [img for img in before if is_image_url(img.get("url", ""))]

        removed = len(before) - len(after)
        if removed:
            print(f"  [{disease['name_zh']}] 移除 {removed} 筆非圖片：")
            for img in before:
                if img not in after:
                    print(f"    ✗ {img['url'][:80]}")
            total_removed += removed

        disease["images"] = after

    # 存回
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\n✅ 清理完成！共移除 {total_removed} 筆非圖片 URL")
    print(f"   已存回 {JSON_PATH}")


if __name__ == "__main__":
    clean()