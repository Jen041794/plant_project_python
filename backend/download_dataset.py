"""
download_dataset.py
1. 設定 Kaggle 憑證（從 .kaggle/kaggle.json 複製至使用者目錄）
2. 下載 PlantVillage 資料集（emmarex/plantdisease）
3. 解壓縮 ZIP 檔
4. 將圖片分類整理至 data/train / data/val（80/20 切割）
5. 刪除原始壓縮檔釋放空間
"""
import os
import sys
import json
import shutil
import zipfile
import random
import subprocess
from pathlib import Path

# ─── 路徑設定 ──────────────────────────────────────────────────────────────────
BASE_DIR        = Path(__file__).parent
KAGGLE_JSON_SRC = BASE_DIR / ".kaggle" / "kaggle.json"
KAGGLE_JSON_DST = Path.home() / ".kaggle" / "kaggle.json"
DOWNLOAD_DIR    = BASE_DIR / "data" / "raw"
EXTRACT_DIR     = BASE_DIR / "data" / "extracted"
TRAIN_DIR       = BASE_DIR / "data" / "train"
VAL_DIR         = BASE_DIR / "data" / "val"

DATASET_SLUG    = "emmarex/plantdisease"
ZIP_NAME        = "plantdisease.zip"
VAL_SPLIT       = 0.2
RANDOM_SEED     = 42


def setup_kaggle_credentials():
    """複製 kaggle.json 到使用者 home 目錄"""
    if not KAGGLE_JSON_SRC.exists():
        print(f"❌ 找不到 {KAGGLE_JSON_SRC}")
        print("   請先編輯 backend/.kaggle/kaggle.json，填入你的 Kaggle username 和 API key")
        print("   取得方式：https://www.kaggle.com/ → Settings → API → Create New Token")
        sys.exit(1)

    # 檢查是否為範本（未填寫）
    with open(KAGGLE_JSON_SRC) as f:
        creds = json.load(f)
    if creds.get("username") == "YOUR_KAGGLE_USERNAME":
        print("❌ 請先填寫 backend/.kaggle/kaggle.json 中的 username 和 key！")
        sys.exit(1)

    KAGGLE_JSON_DST.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(KAGGLE_JSON_SRC, KAGGLE_JSON_DST)
    KAGGLE_JSON_DST.chmod(0o600)
    print(f"✅ Kaggle 憑證已設定：{KAGGLE_JSON_DST}")


def download_dataset():
    """使用 Kaggle CLI 下載資料集"""
    DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)
    zip_path = DOWNLOAD_DIR / ZIP_NAME

    if zip_path.exists():
        print(f"⚡ 已存在壓縮檔，跳過下載：{zip_path}")
        return zip_path

    print(f"📥 下載資料集：{DATASET_SLUG}")
    print(f"   目標目錄：{DOWNLOAD_DIR}")
    cmd = [
        sys.executable, "-m", "kaggle",
        "datasets", "download",
        "-d", DATASET_SLUG,
        "-p", str(DOWNLOAD_DIR),
        "--force"
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"❌ 下載失敗：\n{result.stderr}")
        sys.exit(1)

    # Kaggle CLI 下載的檔案名稱可能不同，尋找 zip
    zips = list(DOWNLOAD_DIR.glob("*.zip"))
    if not zips:
        print("❌ 找不到下載的 ZIP 檔")
        sys.exit(1)
    print(f"✅ 下載完成：{zips[0]}")
    return zips[0]


def extract_dataset(zip_path: Path):
    """解壓縮資料集"""
    if EXTRACT_DIR.exists() and any(EXTRACT_DIR.iterdir()):
        print(f"⚡ 已解壓縮，跳過：{EXTRACT_DIR}")
        return

    EXTRACT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"📦 解壓縮中：{zip_path} → {EXTRACT_DIR}")
    with zipfile.ZipFile(zip_path, "r") as zf:
        total = len(zf.namelist())
        for i, member in enumerate(zf.namelist(), 1):
            zf.extract(member, EXTRACT_DIR)
            if i % 5000 == 0:
                print(f"   {i}/{total} 檔案解壓完成...")
    print(f"✅ 解壓縮完成，共 {total} 個檔案")


def organize_dataset():
    """
    將解壓縮後的圖片整理至 data/train 和 data/val
    原始結構：extracted/PlantVillage/<類別>/<圖片>
    目標結構：
      data/train/<類別>/<圖片>
      data/val/<類別>/<圖片>
    """
    if TRAIN_DIR.exists() and VAL_DIR.exists():
        train_count = sum(1 for _ in TRAIN_DIR.rglob("*.jpg"))
        if train_count > 100:
            print(f"⚡ 資料集已整理（{train_count} 張訓練圖），跳過")
            return

    # 找到類別資料夾（遞迴搜尋包含圖片的資料夾）
    source_dirs = []
    for d in EXTRACT_DIR.rglob("*"):
        if d.is_dir():
            imgs = list(d.glob("*.jpg")) + list(d.glob("*.JPG")) + \
                   list(d.glob("*.png")) + list(d.glob("*.PNG")) + \
                   list(d.glob("*.jpeg"))
            if len(imgs) > 10:
                source_dirs.append((d.name, imgs))

    if not source_dirs:
        print("❌ 找不到圖片資料夾，請確認解壓縮是否成功")
        return

    print(f"\n📂 整理 {len(source_dirs)} 個類別到 train/val 資料夾...")
    random.seed(RANDOM_SEED)

    total_train, total_val = 0, 0
    class_summary = []

    for class_name, imgs in sorted(source_dirs):
        random.shuffle(imgs)
        split_idx = int(len(imgs) * (1 - VAL_SPLIT))
        train_imgs = imgs[:split_idx]
        val_imgs   = imgs[split_idx:]

        # 建立目標資料夾
        (TRAIN_DIR / class_name).mkdir(parents=True, exist_ok=True)
        (VAL_DIR   / class_name).mkdir(parents=True, exist_ok=True)

        # 複製（用 hard link 節省空間，若跨磁碟則用 copy）
        for src in train_imgs:
            dst = TRAIN_DIR / class_name / src.name
            if not dst.exists():
                try:
                    os.link(src, dst)
                except OSError:
                    shutil.copy2(src, dst)

        for src in val_imgs:
            dst = VAL_DIR / class_name / src.name
            if not dst.exists():
                try:
                    os.link(src, dst)
                except OSError:
                    shutil.copy2(src, dst)

        total_train += len(train_imgs)
        total_val   += len(val_imgs)
        class_summary.append({
            "class": class_name,
            "train": len(train_imgs),
            "val": len(val_imgs)
        })
        print(f"  ✓ {class_name:<40} train={len(train_imgs):>5}  val={len(val_imgs):>4}")

    # 儲存類別清單
    classes = [s["class"] for s in class_summary]
    with open(BASE_DIR / "data" / "class_names.json", "w", encoding="utf-8") as f:
        json.dump({"classes": classes, "num_classes": len(classes)}, f, ensure_ascii=False, indent=2)

    print(f"\n✅ 整理完成！")
    print(f"   訓練集：{total_train} 張 | 驗證集：{total_val} 張 | 類別：{len(class_summary)} 種")


def cleanup_zip(zip_path: Path):
    """刪除原始壓縮檔"""
    if zip_path.exists():
        size_mb = zip_path.stat().st_size / 1024 / 1024
        zip_path.unlink()
        print(f"🗑️  已刪除壓縮檔（釋放 {size_mb:.0f} MB）：{zip_path.name}")


def main():
    print("=" * 60)
    print("🌿 PlantVillage 資料集下載與整理工具")
    print("=" * 60)

    setup_kaggle_credentials()
    zip_path = download_dataset()
    extract_dataset(zip_path)
    organize_dataset()
    cleanup_zip(zip_path)

    print("\n" + "=" * 60)
    print("✅ 全部完成！資料集已整理至：")
    print(f"   訓練集：{TRAIN_DIR}")
    print(f"   驗證集：{VAL_DIR}")
    print("   下一步：執行 python train_model.py 開始訓練")
    print("=" * 60)


if __name__ == "__main__":
    main()