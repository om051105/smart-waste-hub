"""
Smart Waste Hub - Step 3: Export Model to TF.js
================================================
Run AFTER 2_train_model.py finishes.
Clean version: No emojis.
"""

import os, json, shutil
import tensorflow as tf

MODEL_PATH = "./model_output/waste_model_final.keras"
TFJS_OUT   = "./tfjs_model"

os.makedirs(TFJS_OUT, exist_ok=True)

# --- LOAD MODEL ---
print("[INFO] Loading trained model...")
model = tf.keras.models.load_model(MODEL_PATH)
print(f"[INFO] Model Parameters: {model.count_params():,}")

# --- CONVERT TO TF.JS ---
print("\n[INFO] Converting to TF.js format for browser...")
os.system(f"tensorflowjs_converter --input_format=keras {MODEL_PATH} {TFJS_OUT}")

# --- SAVE CLASS METADATA ---
with open(f"{TFJS_OUT}/class_names.json", "w") as f:
    json.dump({
        "classes": ["GREEN_BIN", "BLUE_BIN", "RED_BIN"],
        "input_size": [300, 300],
        "labels": {
            "GREEN_BIN": "Green Bin 🟢 (Organic / Biodegradable)",
            "BLUE_BIN":  "Blue Bin 🔵 (Recyclable Material)",
            "RED_BIN":   "Red Bin 🔴 (Hazardous / General Waste)"
        },
        "training": {
            "architecture": "EfficientNetV2S (22M Params)",
            "total_images": "~13.5k Cleaned",
            "datasets": "Merged 5-Source Massive Dataset"
        }
    }, f, indent=2)

print("[INFO] Mapping data: class_names.json saved.")

# --- LIST SIZE ---
total_mb = 0
for f_name in os.listdir(TFJS_OUT):
    path = os.path.join(TFJS_OUT, f_name)
    mb = os.path.getsize(path) / (1024 * 1024)
    total_mb += mb
    print(f"   {f_name}  ({mb:.2f} MB)")
print(f"\n[INFO] Final Model Size: {total_mb:.1f} MB")

# --- ZIP FOR DOWNLOADING ---
print("\n[STEP] Zipping for download...")
shutil.make_archive("/content/tfjs_model_massive", "zip", TFJS_OUT)
print("[SUCCESS] /content/tfjs_model_massive.zip ready for local project use.")
