# Smart Waste Hub - Colab Model Download & Export
# =================================================
# Run this in Google Colab to download trained model and prepare for export

import os
import sys
import shutil
import tensorflow as tf
from pathlib import Path

# --- COLAB SETUP ---
USE_COLAB = 'google.colab' in sys.modules
if not USE_COLAB:
    print("[WARNING] This script is optimized for Google Colab. Running locally may fail.")

from google.colab import drive
from google.colab.files import download

print("[INFO] Mounting Google Drive...")
drive.mount('/content/drive')

# --- CONFIG ---
DRIVE_MODEL_PATH = "/content/drive/MyDrive/smart_waste_hub/model_output/colab_final.keras"
LOCAL_WORK_DIR = "/content/model_workspace"
CLASSES = ["GREEN_BIN", "BLUE_BIN", "RED_BIN"]
IMG_SIZE = (300, 300)

os.makedirs(LOCAL_WORK_DIR, exist_ok=True)

# --- 1. VERIFY MODEL EXISTS ---
print("[PHASE 1] Verifying Model on Drive...")
if os.path.exists(DRIVE_MODEL_PATH):
    file_size = os.path.getsize(DRIVE_MODEL_PATH) / (1024*1024)
    print(f"[SUCCESS] Model found: {DRIVE_MODEL_PATH}")
    print(f"[INFO] Size: {file_size:.2f} MB")
else:
    print(f"[ERROR] Model not found at {DRIVE_MODEL_PATH}")
    print("[INFO] Available files:")
    print(os.listdir("/content/drive/MyDrive/smart_waste_hub/model_output"))
    sys.exit(1)

# --- 2. LOAD MODEL ---
print("\n[PHASE 2] Loading Model...")
try:
    model = tf.keras.models.load_model(DRIVE_MODEL_PATH)
    print(f"[SUCCESS] Model loaded!")
    print(f"[INFO] Input shape: {model.input_shape}")
    print(f"[INFO] Model summary:")
    model.summary()
except Exception as e:
    print(f"[ERROR] Failed to load model: {e}")
    sys.exit(1)

# --- 3. COPY TO LOCAL WORKSPACE ---
print("\n[PHASE 3] Copying to Local Workspace...")
local_model_path = os.path.join(LOCAL_WORK_DIR, "colab_final.keras")
shutil.copy(DRIVE_MODEL_PATH, local_model_path)
print(f"[SUCCESS] Model copied to {local_model_path}")

# --- 4. EVALUATE MODEL (OPTIONAL) ---
print("\n[PHASE 4] Model Information...")
print(f"[INFO] Total parameters: {model.count_params():,}")
print(f"[INFO] Output classes: {len(CLASSES)}")
print(f"[INFO] Classes: {', '.join(CLASSES)}")

# --- 5. PREPARE FOR TFJS EXPORT ---
print("\n[PHASE 5] Converting to TensorFlow.js Format...")
tfjs_dir = os.path.join(LOCAL_WORK_DIR, "model_tfjs")
os.makedirs(tfjs_dir, exist_ok=True)

try:
    # Install tensorflowjs package
    os.system("pip install tensorflowjs -q")
    
    print(f"[INFO] Converting model to TFLite...")
    
    # Convert to TFLite FP16
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    converter.target_spec.supported_types = [tf.float16]
    
    tflite_model = converter.convert()
    tflite_path = os.path.join(LOCAL_WORK_DIR, "model.tflite")
    
    with open(tflite_path, 'wb') as f:
        f.write(tflite_model)
    
    print(f"[SUCCESS] TFLite model created: {tflite_path}")
    print(f"[INFO] Size: {os.path.getsize(tflite_path)/(1024*1024):.2f} MB")
    
    # Convert to TensorFlow.js
    os.system(f"tensorflowjs_converter --input_format=keras {DRIVE_MODEL_PATH} {tfjs_dir}")
    print(f"[SUCCESS] TensorFlow.js model created in {tfjs_dir}")
    
except Exception as e:
    print(f"[WARNING] Conversion failed: {e}")
    print("[INFO] You can still use the .keras model file")

# --- 6. DOWNLOAD TO LOCAL COMPUTER ---
print("\n[PHASE 6] Preparing Downloads...")
print("[INFO] Available files for download:")
for file in os.listdir(LOCAL_WORK_DIR):
    file_path = os.path.join(LOCAL_WORK_DIR, file)
    if os.path.isfile(file_path):
        size = os.path.getsize(file_path) / (1024*1024)
        print(f"  - {file} ({size:.2f} MB)")

# Download the keras model
print("\n[ACTION REQUIRED]")
print("To download files to your computer, uncomment the code below:")
print("# download(local_model_path)")
print("# download(tflite_path)")

# Uncomment below to auto-download:
# from google.colab.files import download
# download(local_model_path)  # Downloads .keras file
# download(tflite_path)       # Downloads .tflite file

print("\n[SUCCESS] Model preparation complete!")
print("[NEXT]")
print("1. Open Files panel on left (folder icon)")
print("2. Navigate to /content/model_workspace/")
print("3. Right-click and download files to your computer")
