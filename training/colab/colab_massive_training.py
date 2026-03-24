# Smart Waste Hub - Google Colab Massive Trainer
# ============================================
# Optimized for Colab T4/L4 GPU (16GB VRAM)

import os, sys, random, shutil
from pathlib import Path
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import EfficientNetV2S
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau

# --- 1. COLAB CHECK & DRIVE MOUNT ---
USE_COLAB = 'google.colab' in sys.modules
if USE_COLAB:
    from google.colab import drive
    print("[INFO] Mounting Google Drive...")
    drive.mount('/content/drive')
    OUT_DIR = "/content/drive/MyDrive/smart_waste_hub/model_output"
    os.makedirs(OUT_DIR, exist_ok=True)
else:
    OUT_DIR = "./model_output" 

# --- 2. CONFIG ---
IMG_SIZE = (300, 300)
BATCH_SIZE = 32 # Higher than local 3050 because Colab has 16GB VRAM
CLASSES = ["GREEN_BIN", "BLUE_BIN", "RED_BIN"]
DATASET_DIR = "/content/dataset"

# --- 3. DOWNLOAD DATASET ON COLAB ---
if USE_COLAB:
    print("[INFO] Installing kagglehub...")
    os.system("pip install kagglehub tqdm")
    import kagglehub
    from tqdm.auto import tqdm
    
    print("[INFO] Fetching Massive Dataset from Kaggle...")
    paths = [
        kagglehub.dataset_download("mostafaabla/garbage-classification"),
        kagglehub.dataset_download("asdasdasasdas/garbage-classification"),
        kagglehub.dataset_download("quangtheng/garbage-classification-6-classes-775class"),
        kagglehub.dataset_download("sumn2u/garbage-classification-v2"),
        kagglehub.dataset_download("zlatan599/garbage-dataset-classification")
    ]
    
    # Simple Organization for Colab local storage (fast)
    BASE = Path(DATASET_DIR)
    MASTER_MAP = {
        "biological": "GREEN_BIN", "organic": "GREEN_BIN", "o": "GREEN_BIN",
        "compost": "GREEN_BIN", "food": "GREEN_BIN",
        "plastic": "BLUE_BIN", "paper": "BLUE_BIN", "glass": "BLUE_BIN",
        "metal": "BLUE_BIN", "cardboard": "BLUE_BIN", "clothes": "BLUE_BIN", 
        "shoes": "BLUE_BIN", "green-glass": "BLUE_BIN", "brown-glass": "BLUE_BIN",
        "white-glass": "BLUE_BIN", "r": "BLUE_BIN", "recycle": "BLUE_BIN",
        "battery": "RED_BIN", "batteries": "RED_BIN", "trash": "RED_BIN",
        "hazardous": "RED_BIN", "non-recyclable": "RED_BIN", "e-waste": "RED_BIN"
    }

    if BASE.exists(): shutil.rmtree(BASE)
    for split in ["train", "val"]:
        for b in ["GREEN_BIN", "BLUE_BIN", "RED_BIN"]:
            (BASE / split / b).mkdir(parents=True, exist_ok=True)

    def process_it(src_path, prefix):
        src = Path(src_path)
        all_folders = [f for f in list(src.rglob("*")) if f.is_dir() and f.name.lower().strip() in MASTER_MAP]
        for folder in tqdm(all_folders, desc=f"Scanning {prefix}"):
            target = MASTER_MAP[folder.name.lower().strip()]
            imgs = []
            for ext in [".jpg", ".JPG", ".jpeg", ".JPEG", ".png", ".PNG"]:
                imgs.extend(list(folder.glob(f"*{ext}")))
            if not imgs: continue
            random.shuffle(imgs)
            tr_idx = int(len(imgs) * 0.85)
            for i, img in enumerate(imgs):
                split = "train" if i < tr_idx else "val"
                shutil.copy2(img, BASE / split / target / f"{prefix}_{i}{img.suffix}")
    
    for i, p in enumerate(paths): process_it(p, f"source_{i+1}")

# --- 4. DATASET LOADER ---
print("[INFO] Finalizing dataset loaders...")
train_ds = keras.utils.image_dataset_from_directory(
    f"{DATASET_DIR}/train", image_size=IMG_SIZE, batch_size=BATCH_SIZE,
    label_mode="categorical", class_names=CLASSES, seed=42)

val_ds = keras.utils.image_dataset_from_directory(
    f"{DATASET_DIR}/val", image_size=IMG_SIZE, batch_size=BATCH_SIZE,
    label_mode="categorical", class_names=CLASSES, seed=42)

# Prefetch/Augmentation
AUTOTUNE = tf.data.AUTOTUNE
aug = keras.Sequential([layers.RandomFlip("horizontal"), layers.RandomRotation(0.2)])
train_ds = train_ds.map(lambda x,y: (aug(x, training=True), y)).prefetch(AUTOTUNE)
val_ds = val_ds.prefetch(AUTOTUNE)

# --- 5. MODEL (EfficientNetV2S) ---
print("[INFO] Initializing Model...")
base = EfficientNetV2S(include_top=False, weights="imagenet", input_shape=(300, 300, 3))
base.trainable = False 

inp = keras.Input((300, 300, 3))
x = base(inp, training=False); x = layers.GlobalAveragePooling2D()(x); x = layers.BatchNormalization()(x)
x = layers.Dense(1024, activation="relu")(x); x = layers.Dropout(0.5)(x)
x = layers.Dense(512, activation="relu")(x); x = layers.Dropout(0.4)(x)
out = layers.Dense(3, activation="softmax", name="predictions")(x)
model = keras.Model(inp, out)

# --- 6. PHASE 1: TRAIN HEAD ---
print("[PHASE 1] Starting...")
model.compile(optimizer=keras.optimizers.Adam(1e-3), 
              loss="categorical_crossentropy", metrics=["accuracy"])

model.fit(train_ds, validation_data=val_ds, epochs=15, 
          callbacks=[EarlyStopping(patience=5, restore_best_weights=True), 
                     ModelCheckpoint(f"{OUT_DIR}/colab_p1.keras", save_best_only=True)])

# --- 7. PHASE 2: FINE-TUNE ---
print("[PHASE 2] Starting Fine-tuning...")
base.trainable = True
for layer in base.layers[:int(len(base.layers)*0.60)]: layer.trainable = False

model.compile(optimizer=keras.optimizers.Adam(1e-5), 
              loss="categorical_crossentropy", metrics=["accuracy"])

model.fit(train_ds, validation_data=val_ds, epochs=30, 
          callbacks=[EarlyStopping(patience=8, restore_best_weights=True), 
                     ModelCheckpoint(f"{OUT_DIR}/colab_final.keras", save_best_only=True),
                     ReduceLROnPlateau(patience=4, factor=0.3)])

print(f"[SUCCESS] Model saved to your Google Drive: {OUT_DIR}/colab_final.keras")
