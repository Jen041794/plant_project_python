"""
train_model.py
分 11 輪訓練，每輪 5 個 epoch，支援斷點續訓
採用 MobileNetV2 遷移學習，第 6 輪起進行 Fine-tuning
"""
import os
import sys
import json
import time
import numpy as np
from pathlib import Path

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"  # 減少 TF 日誌


import tensorflow as tf
import keras
from keras import layers

# ─── 路徑與超參數 ──────────────────────────────────────────────────────────────
BASE_DIR       = Path(__file__).parent
TRAIN_DIR      = BASE_DIR / "data" / "train"
VAL_DIR        = BASE_DIR / "data" / "val"
MODEL_DIR      = BASE_DIR / "models"
CKPT_DIR       = BASE_DIR / "checkpoints"
CLASS_JSON     = BASE_DIR / "data" / "class_names.json"
PROGRESS_FILE  = CKPT_DIR / "progress.json"

IMG_SIZE       = (224, 224)
BATCH_SIZE     = 32
TOTAL_ROUNDS   = 11
EPOCHS_PER_ROUND = 5
LR_INITIAL     = 1e-3
LR_FINETUNE    = 1e-4
FINETUNE_START = 6       # 第幾輪開始解凍 base model
UNFREEZE_LAYERS = 30     # 解凍最後幾層

MODEL_DIR.mkdir(parents=True, exist_ok=True)
CKPT_DIR.mkdir(parents=True, exist_ok=True)

# ─── 進度管理 ──────────────────────────────────────────────────────────────────
def load_progress():
    if PROGRESS_FILE.exists():
        with open(PROGRESS_FILE) as f:
            return json.load(f)
    return {"completed_rounds": 0, "history": [], "best_val_acc": 0.0}

def save_progress(prog):
    with open(PROGRESS_FILE, "w") as f:
        json.dump(prog, f, indent=2)

# ─── 資料集 ────────────────────────────────────────────────────────────────────
def build_datasets():
    if not TRAIN_DIR.exists():
        print("❌ 找不到訓練資料，請先執行 python download_dataset.py")
        sys.exit(1)

    augmentation = keras.Sequential([
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.2),
        layers.RandomZoom(0.15),
        layers.RandomContrast(0.1),
        layers.RandomBrightness(0.1),
    ], name="augmentation")

    AUTOTUNE = tf.data.AUTOTUNE

    def preprocess_train(x, y):
        x = augmentation(x, training=True)
        return tf.cast(x, tf.float32) / 255.0, y

    def preprocess_val(x, y):
        return tf.cast(x, tf.float32) / 255.0, y

    train_ds = tf.keras.utils.image_dataset_from_directory(
        TRAIN_DIR,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode="categorical",
        shuffle=True,
        seed=42,
    ).map(preprocess_train, num_parallel_calls=AUTOTUNE).prefetch(AUTOTUNE)

    val_ds = tf.keras.utils.image_dataset_from_directory(
        VAL_DIR,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode="categorical",
        shuffle=False,
    ).map(preprocess_val, num_parallel_calls=AUTOTUNE).prefetch(AUTOTUNE)

    # 取得類別名稱
    raw_ds = tf.keras.utils.image_dataset_from_directory(TRAIN_DIR, batch_size=1)
    class_names = raw_ds.class_names
    num_classes = len(class_names)

    # 儲存類別名稱
    with open(CLASS_JSON, "w", encoding="utf-8") as f:
        json.dump({"classes": class_names, "num_classes": num_classes}, f, ensure_ascii=False, indent=2)

    print(f"✅ 資料集載入完成：{num_classes} 個類別")
    return train_ds, val_ds, class_names, num_classes

# ─── 模型建構 ──────────────────────────────────────────────────────────────────
def build_model(num_classes, lr=LR_INITIAL):
    base = keras.applications.MobileNetV2(
        input_shape=(*IMG_SIZE, 3),
        include_top=False,
        weights="imagenet",
    )
    base.trainable = False

    inputs = keras.Input(shape=(*IMG_SIZE, 3))
    x = base(inputs, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dense(512, activation="relu")(x)
    x = layers.Dropout(0.4)(x)
    x = layers.Dense(256, activation="relu")(x)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)

    model = keras.Model(inputs, outputs)
    model.compile(
        optimizer=keras.optimizers.Adam(lr),
        loss="categorical_crossentropy",
        metrics=["accuracy",
                 keras.metrics.TopKCategoricalAccuracy(k=3, name="top3_acc")],
    )
    return model, base

def unfreeze_base(model, base_model, lr=LR_FINETUNE):
    """解凍 base model 最後 N 層用於 Fine-tuning"""
    base_model.trainable = True
    for layer in base_model.layers[:-UNFREEZE_LAYERS]:
        layer.trainable = False
    trainable = sum(1 for l in base_model.layers if l.trainable)
    print(f"🔓 Fine-tuning：解凍 {trainable} 層（共 {len(base_model.layers)} 層）")
    model.compile(
        optimizer=keras.optimizers.Adam(lr),
        loss="categorical_crossentropy",
        metrics=["accuracy",
                 keras.metrics.TopKCategoricalAccuracy(k=3, name="top3_acc")],
    )

# ─── 主訓練流程 ────────────────────────────────────────────────────────────────
def train():
    print("=" * 62)
    print("🌿 PhytoScan 模型訓練")
    print(f"   {TOTAL_ROUNDS} 輪 × {EPOCHS_PER_ROUND} epochs = "
          f"{TOTAL_ROUNDS * EPOCHS_PER_ROUND} total epochs")
    print(f"   斷點續訓：{PROGRESS_FILE}")
    print("=" * 62)

    prog = load_progress()
    start_round = prog["completed_rounds"] + 1

    if start_round > TOTAL_ROUNDS:
        print("🎉 訓練已全部完成！")
        return

    if start_round > 1:
        print(f"🔄 偵測到進度檔，從第 {start_round} 輪繼續")

    # 載入資料集
    train_ds, val_ds, class_names, num_classes = build_datasets()

    # 建立或載入模型
    prev_ckpt = CKPT_DIR / f"round_{start_round - 1}.keras"
    if start_round > 1 and prev_ckpt.exists():
        print(f"📂 載入上輪模型：{prev_ckpt}")
        model = keras.models.load_model(prev_ckpt)
        base_model = None   # 已融合，Fine-tuning 需重新取得
    else:
        model, base_model = build_model(num_classes)
        print(f"🆕 建立新模型（類別：{num_classes}）")

    # ── 逐輪訓練 ────────────────────────────────────────────────────────────────
    for rnd in range(start_round, TOTAL_ROUNDS + 1):
        epoch_start = (rnd - 1) * EPOCHS_PER_ROUND + 1
        epoch_end   =  rnd      * EPOCHS_PER_ROUND

        print(f"\n{'─' * 62}")
        print(f"  第 {rnd:>2}/{TOTAL_ROUNDS} 輪  │  Epoch {epoch_start}–{epoch_end}")
        print(f"{'─' * 62}")

        # Fine-tuning 切換
        if rnd == FINETUNE_START:
            if base_model is None:
                # 從已儲存模型重建時需要取回 base_model
                for layer in model.layers:
                    if "mobilenetv2" in layer.name:
                        base_model = layer
                        break
            if base_model:
                unfreeze_base(model, base_model)
            else:
                print("⚠️  無法取得 base_model，跳過解凍")

        callbacks = [
            keras.callbacks.EarlyStopping(
                monitor="val_accuracy", patience=3,
                restore_best_weights=True, verbose=1
            ),
            keras.callbacks.ReduceLROnPlateau(
                monitor="val_loss", factor=0.5, patience=2,
                min_lr=1e-7, verbose=1
            ),
            keras.callbacks.ModelCheckpoint(
                filepath=str(CKPT_DIR / f"round_{rnd}_best.keras"),
                monitor="val_accuracy", save_best_only=True, verbose=0
            ),
        ]

        t0 = time.time()
        history = model.fit(
            train_ds,
            epochs=EPOCHS_PER_ROUND,
            validation_data=val_ds,
            callbacks=callbacks,
            verbose=1,
        )
        elapsed = time.time() - t0

        best_val_acc  = max(history.history.get("val_accuracy", [0]))
        best_val_loss = min(history.history.get("val_loss",     [999]))

        # 儲存本輪完整模型（供下輪載入）
        ckpt_path = CKPT_DIR / f"round_{rnd}.keras"
        model.save(ckpt_path)

        # 更新進度
        if best_val_acc > prog["best_val_acc"]:
            prog["best_val_acc"] = float(best_val_acc)
            # 同時更新最佳模型
            best_path = MODEL_DIR / "best_model.keras"
            model.save(best_path)
            print(f"🏆 新最佳模型！val_acc = {best_val_acc:.4f}")

        prog["completed_rounds"] = rnd
        prog["history"].append({
            "round": rnd,
            "val_accuracy":  float(best_val_acc),
            "val_loss":      float(best_val_loss),
            "elapsed_sec":   round(elapsed, 1),
        })
        save_progress(prog)
        print(f"\n  ✅ 第 {rnd} 輪完成  val_acc={best_val_acc:.4f}  "
              f"耗時={elapsed:.0f}s  已存：{ckpt_path.name}")

    # ── 最終模型 ─────────────────────────────────────────────────────────────────
    final_path = MODEL_DIR / "plant_disease_model.keras"
    model.save(final_path)
    print("\n" + "=" * 62)
    print(f"🎉 訓練全部完成！最終模型：{final_path}")
    print(f"   最佳 val_acc：{prog['best_val_acc']:.4f}")
    print("\n  輪次摘要：")
    print(f"  {'輪':>4}  {'val_acc':>9}  {'val_loss':>9}  {'耗時(s)':>8}")
    print("  " + "-" * 38)
    for h in prog["history"]:
        print(f"  {h['round']:>4}  {h['val_accuracy']:>9.4f}  "
              f"{h['val_loss']:>9.4f}  {h['elapsed_sec']:>8.1f}")
    print("=" * 62)


if __name__ == "__main__":
    train()