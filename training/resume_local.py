"""
Smart Waste Hub - MANUAL RESUME LOCAL
======================================
This version builds the model from scratch locally 
to avoid version mismatch errors when loading. 
Then it tries to load JUST the weights.
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
from sklearn.utils.class_weight import compute_class_weight

# --- 1. CONFIG ---
IMG_SIZE = (300, 300)
BATCH_SIZE = 8
CLASSES = ["GREEN_BIN", "BLUE_BIN", "RED_BIN"]
DATASET_DIR = "./dataset"
PREVIOUS_MODEL = "./model_output/best_p1.keras"

# --- 2. LOAD DATA ---
print("[INFO] Loading local dataset...")
train_ds = keras.utils.image_dataset_from_directory(
    f"{DATASET_DIR}/train", image_size=IMG_SIZE, batch_size=BATCH_SIZE,
    label_mode="categorical", class_names=CLASSES)

val_ds = keras.utils.image_dataset_from_directory(
    f"{DATASET_DIR}/val", image_size=IMG_SIZE, batch_size=BATCH_SIZE,
    label_mode="categorical", class_names=CLASSES)

# --- 3. CLASS WEIGHTS ---
y_train = np.concatenate([y for x, y in train_ds], axis=0)
y_indices = np.argmax(y_train, axis=1)
weights = compute_class_weight('balanced', classes=np.unique(y_indices), y=y_indices)
class_weight_dict = dict(enumerate(weights))

# --- 4. MANUALLY BUILD ARCHITECTURE ---
print("[INFO] Re-building architecture locally to match your version...")
base = EfficientNetV2S(include_top=False, weights="imagenet", input_shape=(300, 300, 3))
base.trainable = False 

inp = keras.Input((300, 300, 3))
x = base(inp, training=False); x = layers.GlobalAveragePooling2D()(x); x = layers.BatchNormalization()(x)
x = layers.Dense(1024, activation="relu")(x); x = layers.Dropout(0.5)(x)
x = layers.Dense(512, activation="relu")(x); x = layers.Dropout(0.4)(x)
out = layers.Dense(3, activation="softmax", name="predictions")(x)
model = keras.Model(inp, out)

# --- 5. TRY LOADING WEIGHTS ONLY ---
print(f"[INFO] Attempting to load weights from: {PREVIOUS_MODEL}")
try:
    # Try loading as weights
    model.load_weights(PREVIOUS_MODEL)
    print("[SUCCESS] Training history successfully restored!")
except Exception as e:
    print(f"[ERROR] Could not load Colab weights: {e}")
    print("[INFO] Starting training from scratch (Phase 1) locally.")

# --- 6. START TRAINING ---
print("\n[STEP] Starting Training on your RTX 3050...")
model.compile(optimizer=keras.optimizers.Adam(1e-5), 
              loss="categorical_crossentropy", metrics=["accuracy"])

model.fit(train_ds, validation_data=val_ds, epochs=30, 
          class_weight=class_weight_dict)

model.save("./model_output/waste_model_final.keras")
print("[SUCCESS] Local Training Complete!")
