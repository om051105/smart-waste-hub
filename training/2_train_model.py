"""
Smart Waste Hub - Step 2: Final Massive Training Cycle
======================================================
Everything in one script: Load -> Build -> Phase 1 -> Phase 2.
Memory-Safe (Streaming) | Batch Size 16 | EfficientNetV2S (22M)
Clean version: No emojis.
"""

import os, sys
# ---------------------------------------------------------
# Windows Conda GPU Fix: explicitly point to CUDA .dll files
import site
_conda_base = sys.prefix
os.add_dll_directory(os.path.join(_conda_base, 'Library', 'bin'))
# ---------------------------------------------------------

import numpy as np, tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import EfficientNetV2S
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau
from sklearn.utils.class_weight import compute_class_weight

# --- 1. CONFIGURATION ---
IMG_SIZE = (300, 300)
BATCH_SIZE = 16 
CLASSES = ["GREEN_BIN", "BLUE_BIN", "RED_BIN"]
DATASET_DIR = "./dataset"
OUT_DIR = "./model_output"
os.makedirs(OUT_DIR, exist_ok=True)

# --- 2. DATASET LOADER ---
print("[INFO] Loading datasets from ./dataset...")
train_ds = keras.utils.image_dataset_from_directory(
    f"{DATASET_DIR}/train", image_size=IMG_SIZE, batch_size=BATCH_SIZE,
    label_mode="categorical", class_names=CLASSES, seed=42)

val_ds = keras.utils.image_dataset_from_directory(
    f"{DATASET_DIR}/val", image_size=IMG_SIZE, batch_size=BATCH_SIZE,
    label_mode="categorical", class_names=CLASSES, seed=42)

# --- 3. CLASS WEIGHTS (Balancing the dataset) ---
print("[INFO] Calculating class weights...")
y_train = np.concatenate([y for x, y in train_ds], axis=0)
y_indices = np.argmax(y_train, axis=1)
weights = compute_class_weight('balanced', classes=np.unique(y_indices), y=y_indices)
class_weight_dict = dict(enumerate(weights))

# --- 4. PREFETCH (Corrected: No .cache() to prevent RAM crash) ---
AUTOTUNE = tf.data.AUTOTUNE
aug = keras.Sequential([layers.RandomFlip("horizontal"), layers.RandomRotation(0.2)])
train_ds = train_ds.map(lambda x,y: (aug(x, training=True), y)).prefetch(AUTOTUNE)
val_ds = val_ds.prefetch(AUTOTUNE)

# --- 5. BUILD BIG MODEL (EfficientNetV2S) ---
print("[INFO] Initializing EfficientNetV2S (22M Parameters)...")
base = EfficientNetV2S(include_top=False, weights="imagenet", input_shape=(300, 300, 3))
base.trainable = False 

inp = keras.Input((300, 300, 3))
x = base(inp, training=False); x = layers.GlobalAveragePooling2D()(x); x = layers.BatchNormalization()(x)
x = layers.Dense(1024, activation="relu")(x); x = layers.Dropout(0.5)(x)
x = layers.Dense(512, activation="relu")(x); x = layers.Dropout(0.4)(x)
out = layers.Dense(3, activation="softmax", name="predictions")(x)
model = keras.Model(inp, out)

# --- 6. PHASE 1: START TRAINING! ---
print("\n[STEP] PHASE 1: Starting classifier head (Streaming Mode)...")
model.compile(optimizer=keras.optimizers.Adam(1e-3), 
              loss="categorical_crossentropy", metrics=["accuracy"])

model.fit(train_ds, validation_data=val_ds, epochs=15, 
          class_weight=class_weight_dict,
          callbacks=[EarlyStopping(patience=5, restore_best_weights=True), 
                     ModelCheckpoint(f"{OUT_DIR}/best_p1.keras", save_best_only=True)])

# --- 7. PHASE 2: FINE-TUNING ---
print("\n[STEP] PHASE 2: Fine-tuning top 40% of deep layers...")
base.trainable = True
for layer in base.layers[:int(len(base.layers)*0.60)]: layer.trainable = False

model.compile(optimizer=keras.optimizers.Adam(1e-5), 
              loss="categorical_crossentropy", metrics=["accuracy"])

model.fit(train_ds, validation_data=val_ds, epochs=30, 
          class_weight=class_weight_dict,
          callbacks=[EarlyStopping(patience=8, restore_best_weights=True), 
                     ModelCheckpoint(f"{OUT_DIR}/waste_model_final.keras", save_best_only=True),
                     ReduceLROnPlateau(patience=4, factor=0.3)])

# --- 8. FINAL SAVE ---
model.save(f"{OUT_DIR}/waste_model_final.keras")
print(f"\n[SUCCESS] Training complete. Final model: {model.count_params():,} params.")
