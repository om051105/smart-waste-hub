# Smart Waste Hub - Load Trained Model from Google Drive
# ========================================================
# This script loads the pre-trained model from Google Drive

import os
import sys
import tensorflow as tf
from pathlib import Path

# --- 1. COLAB CHECK & DRIVE MOUNT ---
USE_COLAB = 'google.colab' in sys.modules
if USE_COLAB:
    from google.colab import drive
    print("[INFO] Mounting Google Drive...")
    drive.mount('/content/drive')
    DRIVE_PATH = "/content/drive/MyDrive/smart_waste_hub/model_output"
else:
    # For local testing, download from Drive manually or set path to local copy
    DRIVE_PATH = "./model_output"

# --- 2. MODEL CONFIG ---
MODEL_NAME = "colab_final.keras"
CLASSES = ["GREEN_BIN", "BLUE_BIN", "RED_BIN"]

# --- 3. LOAD MODEL FROM DRIVE ---
def load_model_from_drive():
    """Load the trained model from Google Drive"""
    model_path = os.path.join(DRIVE_PATH, MODEL_NAME)
    
    if not os.path.exists(model_path):
        print(f"[ERROR] Model not found at {model_path}")
        print(f"[INFO] Available files in {DRIVE_PATH}:")
        if os.path.exists(DRIVE_PATH):
            print(os.listdir(DRIVE_PATH))
        return None
    
    print(f"[INFO] Loading model from {model_path}...")
    try:
        model = tf.keras.models.load_model(model_path)
        print(f"[SUCCESS] Model loaded successfully!")
        print(f"[INFO] Model shape: {model.input_shape}")
        print(f"[INFO] Classes: {CLASSES}")
        return model
    except Exception as e:
        print(f"[ERROR] Failed to load model: {e}")
        return None

# --- 4. INFERENCE EXAMPLE ---
def predict_from_image(model, image_path):
    """Make prediction on a single image"""
    if model is None:
        print("[ERROR] Model not loaded")
        return None
    
    try:
        # Load and preprocess image
        IMG_SIZE = (300, 300)
        img = tf.keras.preprocessing.image.load_img(image_path, target_size=IMG_SIZE)
        img_array = tf.keras.preprocessing.image.img_to_array(img)
        img_array = tf.expand_dims(img_array, 0)
        img_array /= 255.0
        
        # Predict
        predictions = model.predict(img_array, verbose=0)
        predicted_class_idx = tf.argmax(predictions[0]).numpy()
        confidence = predictions[0][predicted_class_idx].numpy()
        
        print(f"[PREDICTION] {CLASSES[predicted_class_idx]} ({confidence:.2%} confidence)")
        return CLASSES[predicted_class_idx], confidence
    except Exception as e:
        print(f"[ERROR] Prediction failed: {e}")
        return None

# --- 5. MODEL SUMMARY ---
def print_model_info(model):
    """Print detailed model information"""
    if model is None:
        return
    
    print("\n" + "="*60)
    print("MODEL INFORMATION")
    print("="*60)
    model.summary()
    
    print(f"\n[INFO] Total parameters: {model.count_params():,}")
    print(f"[INFO] Input shape: {model.input_shape}")
    print(f"[INFO] Output classes: {len(CLASSES)}")
    print(f"[INFO] Classes: {', '.join(CLASSES)}")
    print("="*60 + "\n")

# --- 6. SAVE MODEL LOCALLY (for development) ---
def save_model_locally(model, output_path="./model_output"):
    """Save model locally for development/testing"""
    if model is None:
        print("[ERROR] Model not loaded")
        return
    
    os.makedirs(output_path, exist_ok=True)
    local_path = os.path.join(output_path, MODEL_NAME)
    
    print(f"[INFO] Saving model to {local_path}...")
    model.save(local_path)
    print(f"[SUCCESS] Model saved locally!")

# --- MAIN ---
if __name__ == "__main__":
    print("[PHASE] Loading Trained Model from Drive\n")
    
    # Load model
    model = load_model_from_drive()
    
    if model is not None:
        # Print model info
        print_model_info(model)
        
        # Optional: Test on a sample image (if available)
        # Example:
        # predict_from_image(model, "/path/to/test/image.jpg")
        
        # Optional: Save locally
        # save_model_locally(model)
        
        print("[SUCCESS] Model ready for use!")
        print("[NEXT STEPS]:")
        print("  1. Use predict_from_image() for inference")
        print("  2. Export to TFLite or TF.js using export_model.py")
        print("  3. Integrate with your web application")
    else:
        print("[ERROR] Failed to initialize model")
        sys.exit(1)
