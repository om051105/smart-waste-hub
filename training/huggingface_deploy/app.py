import gradio as gr
import tensorflow as tf
import numpy as np
from PIL import Image
import json
import os

# ─── Load Model ───────────────────────────────────────────────────────────────
MODEL_PATH = "waste_model_final.keras"
CLASS_NAMES = ["BLUE_BIN ♻️", "GREEN_BIN 🌱", "RED_BIN ☣️"]
CLASS_INFO = {
    "BLUE_BIN ♻️": {
        "color": "#2196F3",
        "items": "Plastic, Paper, Metal, Glass, Cardboard",
        "tip": "Rinse containers before recycling!"
    },
    "GREEN_BIN 🌱": {
        "color": "#4CAF50", 
        "items": "Food waste, Fruit/Vegetable peels, Leaves, Garden waste",
        "tip": "Great for composting!"
    },
    "RED_BIN ☣️": {
        "color": "#F44336",
        "items": "Batteries, E-waste, Hazardous chemicals, Medical waste",
        "tip": "Never mix with regular waste — dangerous!"
    }
}

print("Loading model...")
model = tf.keras.models.load_model(MODEL_PATH)
print("Model loaded successfully!")

IMG_SIZE = (300, 300)

def classify_waste(image):
    """Main classification function."""
    if image is None:
        return "Please upload an image.", "", ""
    
    # Preprocess
    img = Image.fromarray(image).convert("RGB")
    img = img.resize(IMG_SIZE)
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    
    # Predict
    predictions = model.predict(img_array, verbose=0)[0]
    predicted_idx = np.argmax(predictions)
    confidence = float(predictions[predicted_idx]) * 100
    predicted_class = CLASS_NAMES[predicted_idx]
    
    # Build result
    info = CLASS_INFO[predicted_class]
    
    result_label = f"## {predicted_class}"
    confidence_text = f"**Confidence:** {confidence:.1f}%"
    details = f"""
**What goes here:** {info['items']}

💡 **Tip:** {info['tip']}

---
*Model: EfficientNetV2-S | Trained on 13,000+ waste images*
"""
    
    # All class probabilities
    prob_text = "### All Predictions:\n"
    for i, (cls, prob) in enumerate(zip(CLASS_NAMES, predictions)):
        bar = "█" * int(prob * 20)
        prob_text += f"- **{cls}**: {prob*100:.1f}% {bar}\n"
    
    return result_label, confidence_text + details, prob_text


# ─── Example Test Cases ────────────────────────────────────────────────────────
examples = [
    ["test_images/plastic_bottle.jpg"],
    ["test_images/banana_peel.jpg"],
    ["test_images/battery.jpg"],
    ["test_images/cardboard.jpg"],
    ["test_images/food_waste.jpg"],
]

# ─── Gradio UI ─────────────────────────────────────────────────────────────────
with gr.Blocks(
    title="Smart Waste Classifier 🌍",
    theme=gr.themes.Soft(primary_hue="green"),
    css="""
        .header { text-align: center; padding: 20px; }
        .result-box { border-radius: 12px; padding: 15px; }
    """
) as demo:
    
    gr.Markdown("""
    # 🌍 Smart Waste Hub — AI Waste Classifier
    ### Powered by EfficientNetV2-S | 22M Parameters | ~99% Accuracy
    
    Upload a photo of any waste item and the AI will tell you **which bin** to use!
    
    | 🔵 Blue Bin | 🟢 Green Bin | 🔴 Red Bin |
    |---|---|---|
    | Recyclables | Organic Waste | Hazardous Waste |
    """)
    
    with gr.Row():
        with gr.Column(scale=1):
            image_input = gr.Image(
                label="📸 Upload Waste Image",
                type="numpy",
                height=300
            )
            classify_btn = gr.Button(
                "🔍 Classify Waste", 
                variant="primary",
                size="lg"
            )
            
        with gr.Column(scale=1):
            result_output = gr.Markdown(label="Result")
            details_output = gr.Markdown(label="Details")
            probs_output = gr.Markdown(label="All Probabilities")
    
    classify_btn.click(
        fn=classify_waste,
        inputs=image_input,
        outputs=[result_output, details_output, probs_output]
    )
    
    image_input.change(
        fn=classify_waste,
        inputs=image_input,
        outputs=[result_output, details_output, probs_output]
    )
    
    gr.Markdown("## 🧪 Test Cases — Try These!")
    gr.Examples(
        examples=examples,
        inputs=image_input,
        label="Click any example to test the model"
    )
    
    gr.Markdown("""
    ---
    ### 📊 Model Details
    | Property | Value |
    |---|---|
    | Architecture | EfficientNetV2-S |
    | Parameters | 22,000,000 |
    | Input Size | 300×300 pixels |
    | Training Data | 13,500+ images (5 Kaggle datasets) |
    | Training Hardware | NVIDIA RTX 3050 GPU |
    | Framework | TensorFlow 2.10 + Keras |
    | Classes | GREEN_BIN, BLUE_BIN, RED_BIN |
    
    **GitHub:** [smart-waste-hub](https://github.com/om051105/smart-waste-hub) | 
    **Live Site:** [Smart Waste Hub](https://om051105.github.io/smart-waste-hub/)
    """)

if __name__ == "__main__":
    demo.launch()
