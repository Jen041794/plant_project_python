"""
organize_only.py
直接從 data/extracted 整理 train/val，不需要下載或 kaggle 套件
"""
import os, json, shutil, random
from pathlib import Path

BASE_DIR    = Path(__file__).parent
EXTRACT_DIR = BASE_DIR / "data" / "extracted"
TRAIN_DIR   = BASE_DIR / "data" / "train"
VAL_DIR     = BASE_DIR / "data" / "val"
VAL_SPLIT   = 0.2
RANDOM_SEED = 42

print("=" * 60)
print("  資料集整理工具（從 extracted 直接整理）")
print("=" * 60)

# 掃描所有含圖片的資料夾
print(f"\n掃描 {EXTRACT_DIR} ...")
source_dirs = []
for d in EXTRACT_DIR.rglob("*"):
    if d.is_dir():
        imgs = (list(d.glob("*.jpg")) + list(d.glob("*.JPG")) +
                list(d.glob("*.jpeg")) + list(d.glob("*.png")) +
                list(d.glob("*.PNG")))
        if len(imgs) > 10:
            source_dirs.append((d.name, imgs))

if not source_dirs:
    print("❌ 找不到圖片！請確認 data/extracted 內有資料")
    exit(1)

print(f"找到 {len(source_dirs)} 個類別\n")

# 整理
random.seed(RANDOM_SEED)
total_train, total_val = 0, 0
classes = []

for class_name, imgs in sorted(source_dirs):
    random.shuffle(imgs)
    split_idx  = int(len(imgs) * (1 - VAL_SPLIT))
    train_imgs = imgs[:split_idx]
    val_imgs   = imgs[split_idx:]

    (TRAIN_DIR / class_name).mkdir(parents=True, exist_ok=True)
    (VAL_DIR   / class_name).mkdir(parents=True, exist_ok=True)

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
    classes.append(class_name)
    print(f"  ✓ {class_name:<50} train={len(train_imgs):>5}  val={len(val_imgs):>4}")

# 儲存 class_names.json
class_json = BASE_DIR / "data" / "class_names.json"
with open(class_json, "w", encoding="utf-8") as f:
    json.dump({"classes": classes, "num_classes": len(classes)}, f, ensure_ascii=False, indent=2)

print(f"\n{'='*60}")
print(f"  整理完成！")
print(f"  類別數：{len(classes)}")
print(f"  訓練集：{total_train} 張")
print(f"  驗證集：{total_val} 張")
print(f"  class_names.json 已更新")
print(f"{'='*60}")
print("\n下一步：執行 python train_model.py 開始訓練")