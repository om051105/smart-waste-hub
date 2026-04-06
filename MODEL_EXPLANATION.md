# 🤖 Smart Waste Hub — AI Model Explanation
## For Teacher Presentation | By Om Singh

---

## 📌 1. What Problem Does the AI Solve?

In cities, millions of people throw waste in the wrong bin every day:
- A plastic bottle goes in the organic bin → cannot be recycled.
- A dead battery goes in the regular trash → leaks toxic chemicals into soil.
- Food scraps go in the recycling bin → contaminate the entire batch.

Our AI model solves this by **looking at a photo** of the waste item and instantly telling you:
> "Put this in the **Blue Bin** (Recyclable) — it's a plastic bottle."

No guessing. No manual rules. Just a photo → correct bin → in under 1 second.

---

## 🧠 2. What Type of AI Is It?

**Type:** Convolutional Neural Network (CNN) — a class of Deep Learning models designed for image recognition.

**Specific Model:** `EfficientNetV2-S` — created by Google Brain in 2021.

| Property | Value |
|---|---|
| Model Name | EfficientNetV2-S |
| Total Parameters | **22,000,000 (22 Million)** |
| Input | A 300×300 pixel colour image |
| Output | 3 class probabilities → highest wins |
| Classes | `GREEN_BIN`, `BLUE_BIN`, `RED_BIN` |
| Expected Accuracy | **~95–99%** |
| Base Framework | TensorFlow 2.10 + Keras (Python) |
| Browser Runtime | TensorFlow.js + WebGL |

---

## 📦 3. Training Dataset — Where the Data Comes From

We did NOT collect images manually. We downloaded **5 publicly available Kaggle datasets** and merged them.

| # | Dataset (Kaggle) | Images |
|---|---|---|
| 1 | `mostafaabla/garbage-classification` | ~15,000 |
| 2 | `asdasdasasdas/garbage-classification` (TrashNet) | ~2,500 |
| 3 | `quangtheng/garbage-classification-6-classes-775class` | ~20,000 |
| 4 | `sumn2u/garbage-classification-v2` | ~15,000 |
| 5 | `zlatan599/garbage-dataset-classification` | ~17,500 |
| **TOTAL** | **Smart Waste Hub Master Dataset** | **~70,000 images** |

### How We Mapped Categories to Bins:

Each dataset had different category names. We unified them:

| Raw Category Name | Maps To |
|---|---|
| `plastic`, `paper`, `glass`, `metal`, `cardboard`, `clothes` | ✅ `BLUE_BIN` (Recyclable) |
| `organic`, `biological`, `food`, `compost` | ✅ `GREEN_BIN` (Biodegradable) |
| `battery`, `batteries`, `hazardous`, `trash`, `e-waste` | ✅ `RED_BIN` (Hazardous) |

This mapping is done automatically by `training/1_download_datasets.py`.

---

## 🏗️ 4. Model Architecture — What's Inside

Think of the model as an assembly line. The raw image enters at the top and gets processed step by step until a final answer comes out at the bottom.

```
┌───────────────────────────────────────────────────┐
│  INPUT: 300 × 300 × 3 colour image (RGB pixels)  │
└─────────────────────┬─────────────────────────────┘
                      │
┌─────────────────────▼──────────────────────────────┐
│  EfficientNetV2-S BASE  (Pre-trained, ~20M params) │
│  - Trained on 1.2 million ImageNet images          │
│  - Already knows: edges, textures, shapes, objects │
│  - We DON'T train this from scratch (Transfer!)    │
└─────────────────────┬──────────────────────────────┘
                      │
┌─────────────────────▼──────────────────────────────┐
│  GlobalAveragePooling2D                            │
│  Converts 3D feature maps (h×w×channels) → 1D     │
│  Example: (9×9×1280) → (1280,)                    │
└─────────────────────┬──────────────────────────────┘
                      │
┌─────────────────────▼──────────────────────────────┐
│  BatchNormalization                                │
│  Normalizes values so training is stable            │
│  Prevents gradient explosion/vanishing             │
└─────────────────────┬──────────────────────────────┘
                      │
┌─────────────────────▼──────────────────────────────┐
│  Dense(1024 neurons, ReLU activation)              │
│  Parameters = (1280 × 1024) + 1024 = 1,312,768    │
│  Learns: "What patterns = which bin?"              │
└─────────────────────┬──────────────────────────────┘
                      │
┌─────────────────────▼──────────────────────────────┐
│  Dropout(0.5) — 50% of neurons randomly off        │
│  Forces the network to not rely on any one neuron  │
│  Prevents OVERFITTING (memorising training data)   │
└─────────────────────┬──────────────────────────────┘
                      │
┌─────────────────────▼──────────────────────────────┐
│  Dense(512 neurons, ReLU activation)               │
│  Parameters = (1024 × 512) + 512 = 524,800         │
│  Refines and compresses learned patterns           │
└─────────────────────┬──────────────────────────────┘
                      │
┌─────────────────────▼──────────────────────────────┐
│  Dropout(0.4) — 40% of neurons randomly off        │
│  More regularization for better generalisation     │
└─────────────────────┬──────────────────────────────┘
                      │
┌─────────────────────▼──────────────────────────────┐
│  Dense(3, Softmax activation)  ← OUTPUT LAYER      │
│  Parameters = (512 × 3) + 3 = 1,539                │
│  Output: [0.04, 0.91, 0.05]                        │
│           GREEN   BLUE   RED  ← probabilities      │
│  Winner: BLUE (91%) → "Dispose in Blue Bin"        │
└────────────────────────────────────────────────────┘
```

**Total Parameters:** ~22,000,000

---

## 🔢 5. What is a "Parameter"?

A parameter is a single learnable decimal number inside the network. It starts random and is updated after every batch of training images until it gives correct answers.

**Simple Example — Dense Layer Calculation:**
```
Layer: Dense(1024 neurons, receives 1280 inputs)

Parameters = (Number of Inputs × Number of Neurons) + Neurons (bias)
           = (1280 × 1024) + 1024
           = 1,310,720 + 1,024
           = 1,312,768 parameters ← just for this ONE layer
```

Our model has hundreds of such layers, totalling **22 million parameters**.

---

## 🔬 6. Training Algorithm — How It Learns

### The Core Idea: Transfer Learning

We started with `EfficientNetV2-S` that was already trained by Google on **1.2 million images** from the ImageNet dataset. It already "knows" what a bottle, a leaf, a box looks like.

We then **fine-tuned** it on OUR waste images, so it learns the specific difference between wastbin categories.

Why? Because training 22 million parameters from scratch on 13,000 images would lead to very poor accuracy. Transfer learning lets us benefit from Google's 1.2M-image training for free.

---

### Two-Phase Training Strategy

#### 🧊 Phase 1 — Frozen Base (15 Epochs)

```
Base model layers:   🔒 LOCKED (weights cannot change)
Our custom layers:   ✅ TRAINING (weights update each batch)
Learning Rate:       0.001  (fast learning)
Goal:                Teach the classifier head to map features → bins
```

In Phase 1, we only train the 4 new layers (2 Dense + 2 Dropout). The goal is to quickly get the new head to produce reasonable outputs before we start touching the expensive base.

---

#### 🔥 Phase 2 — Fine-Tuning (30 Epochs)

```
Base model layers (bottom 60%):  🔒 Still LOCKED
Base model layers (top 40%):     ✅ UNLOCKED — now train slowly
Our custom layers:               ✅ TRAINING
Learning Rate:                   0.00001  (100× slower than Phase 1)
Goal:                            Allow deep layers to specialise on waste
```

In Phase 2, the top 40% of the deep EfficientNet layers can now slightly shift to become experts at recognising waste specifically. The very slow learning rate prevents them from "forgetting" ImageNet knowledge (called catastrophic forgetting).

---

### Loss Function: Categorical Cross-Entropy

This measures how wrong the model's prediction is:
```
Loss = −Σ (true_label × log(predicted_probability))

Example:
  True label:          [0, 1, 0]  ← Blue bin is correct
  Model prediction:    [0.04, 0.91, 0.05]
  Loss = −(0×log(0.04) + 1×log(0.91) + 0×log(0.05))
       = −log(0.91) = 0.094  ← very low = good prediction!
  
  If model was wrong:  [0.85, 0.10, 0.05]
  Loss = −log(0.10) = 2.30   ← very high = punish the model
```

The model's goal is to minimise this loss across all 13,000+ images.

---

### Optimizer: Adam

Adam updates all 22 million parameters after each batch:
```
New weight = Old weight − (Learning Rate × Gradient)
```

Adam is smart because it:
- Keeps momentum from previous steps (doesn't change direction randomly)
- Adapts the learning rate per parameter (important weights change less)
- Is the industry standard for deep learning

---

### Additional Techniques

| Technique | What It Does |
|---|---|
| `EarlyStopping(patience=5)` | Stops training if accuracy stops improving for 5 epochs (prevents wasting time) |
| `ModelCheckpoint` | Saves the best model weights seen during training |
| `ReduceLROnPlateau` | Automatically halves the learning rate if loss plateaus |
| `Class Weight Balancing` | Compensates if RED_BIN has fewer images than GREEN_BIN |
| `Data Augmentation` | Randomly flips and rotates training images to make model more robust |

---

## ⚡ 7. Hardware — GPU Training Explained

Training on a CPU takes ~13 minutes per epoch. Training on the RTX 3050 GPU takes ~30 seconds per epoch — **26× faster**.

### Why Is GPU So Much Faster?

```
CPU (Intel Core i7):
  4–8 cores → does 4–8 math operations at a time
  
GPU (RTX 3050):
  2048 CUDA cores → does 2048+ operations in parallel
  
A single training step requires billions of multiplications.
The GPU does them all simultaneously.
```

### The CUDA Stack (Windows)

```
Python TensorFlow
      ↓
CUDA Toolkit 11.2 (translates TF operations to GPU instructions)
      ↓
cuDNN 8.1 (NVIDIA's GPU-optimised deep learning math library)
      ↓
RTX 3050 GPU Driver
      ↓
Hardware: 2048 CUDA Tensor Cores
```

---

## 🌐 8. How the Model Runs in the Browser (TensorFlow.js)

After training, the model is **converted** from Python format to a JavaScript-compatible format:

```bash
tensorflowjs_converter --input_format=keras waste_model_final.keras ./tfjs_model/
```

This creates:
- `model.json` — the model architecture
- `group1-shard1of22.bin` through `group1-shard22of22.bin` — the 22 million weights split into 22 files

These files are placed in the app's `public/tfjs_model/` folder.

### What Happens When You Use the AI Feature:

```
1. User opens the website → browser downloads model.json + 22 .bin files (~85 MB)
2. @tensorflow/tfjs-backend-webgl loads the model onto the user's own GPU via WebGL
3. User uploads a photo / takes a camera photo
4. Photo is resized to 300×300 and converted to a tensor (3D number array)
5. Model runs forward pass: 22M multiplications → takes under 100ms
6. Output: [GREEN%, BLUE%, RED%] → highest value wins
7. Result displayed: "Dispose in Blue Bin — 91% confidence"
8. NOTHING sent to a server. Fully private. Works offline.
```

---

## 📊 9. Training Pipeline — Step-by-Step Files

The complete training is split into 3 runnable Python scripts:

| File | What It Does |
|---|---|
| `training/1_download_datasets.py` | Downloads all 5 Kaggle datasets and organises them into `dataset/train/` and `dataset/val/` |
| `training/2_train_model.py` | Builds EfficientNetV2-S, runs Phase 1 + Phase 2, saves `waste_model_final.keras` |
| `training/3_export_tfjs.py` | Converts the `.keras` model to TF.js format + saves `class_names.json` |

To run the full pipeline:
```bash
# Step 1 — Download datasets (requires Kaggle API key)
conda activate waste-gpu
python training/1_download_datasets.py

# Step 2 — Train the model (requires NVIDIA GPU)
python training/2_train_model.py

# Step 3 — Export to browser format
python training/3_export_tfjs.py

# Step 4 — Copy output to web app
cp -r training/tfjs_model public/tfjs_model
```

---

## 🔮 10. Future Improvements

| Improvement | How |
|---|---|
| More classes (10+) | Expand beyond 3 bins to e-waste, medical, construction, etc. |
| Full 70,000 image training | Currently trained on ~13,500 cleaned images; full dataset = higher accuracy |
| Real-time video detection | Run inference on each video frame using `requestAnimationFrame` |
| Quantisation | Compress model from 85MB to ~20MB for faster loading |
| Mobile App | React Native + TFLite for offline-first Android/iOS app |
| Multi-language | Hindi, Gujarati support for Indian users |

---

*Document prepared by Om Singh | Smart Waste Hub Project | April 2026*
