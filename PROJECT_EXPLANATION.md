# 🌍 Smart Waste Hub — Full Project Explanation
## For Teacher Presentation | By Om Singh

---

## 📌 1. What is Smart Waste Hub?

Smart Waste Hub is a **full-stack AI-powered web platform** for intelligent waste management. It solves the real-world problem of incorrect waste disposal by using **Artificial Intelligence** to tell citizens exactly which bin to use — Green, Blue, or Red — just by taking a photo of the waste item.

### 🌐 Real-World Use Case
In cities, incorrect waste disposal is a massive problem:
- Recyclable items go to landfills instead of being recycled.
- Organic food waste is mixed with hazardous material.
- Hospital batteries end up in regular trash, causing pollution.

Smart Waste Hub solves this by:
1. Giving citizens a camera-based AI scanner to identify waste.
2. Connecting them with real local waste collection schedules.
3. Gamifying proper disposal with points and badges to encourage good habits.
4. Giving administrators a real-time dashboard to track compliance and route efficiency.

---

## 🤖 2. About the AI Model (The Brain of the Project)

### What Model Did We Use?
We used **EfficientNetV2-S** — a state-of-the-art deep learning model from Google Brain.

| Property | Detail |
|---|---|
| **Model Name** | EfficientNetV2-S |
| **Total Parameters** | 22,000,000 (22 Million) |
| **Input Size** | 300×300 pixels (colour image) |
| **Output** | 3 Classes: GREEN_BIN, BLUE_BIN, RED_BIN |
| **Base Framework** | TensorFlow & Keras (Python) |
| **Final Accuracy** | ~95-99% |

---

## 🔢 3. How Do We Calculate Parameters?

A "parameter" is a single learnable number inside the neural network. The model has **22 million** of them. Here is how they are counted:

### Example: A Simple Dense (Fully Connected) Layer
If a layer has **1024 neurons** and receives **1280 inputs**, the parameters are:
```
Parameters = (Inputs × Neurons) + Neurons (bias)
           = (1280 × 1024) + 1024
           = 1,311,744 + 1,024
           = 1,312,768 parameters
```
The EfficientNetV2-S base model alone has **~20 million** such parameters across hundreds of convolutional layers. We added our custom head with another **~2 million**.

### Our Full Architecture:
```
Input (300×300×3 image)
    ↓
EfficientNetV2S Base (Pre-trained on ImageNet — 20M params)
    ↓
GlobalAveragePooling2D     → Compresses feature maps to 1D
    ↓
BatchNormalization         → Stabilizes learning
    ↓
Dense(1024, ReLU)          → Learns waste-specific patterns
    ↓
Dropout(0.5)               → Prevents overfitting
    ↓
Dense(512, ReLU)           → Refines the patterns
    ↓
Dropout(0.4)               → More regularization
    ↓
Dense(3, Softmax)          → Final output: probabilities for 3 bins
```

---

## 🔬 4. Which Algorithm and Why?

### Algorithm: Transfer Learning + Fine-Tuning

**Transfer Learning** means we started with a model that was already trained on 1.2 million images (Google's ImageNet). Instead of starting from scratch, we "transferred" that knowledge to our waste classification task.

**Why this approach?**
| Reason | Explanation |
|---|---|
| **Speed** | Training from scratch would take weeks. Transfer learning reduced it to hours. |
| **Accuracy** | The base model already knows edges, textures, and shapes — the building blocks of any image. |
| **Small Dataset** | We only had ~13,000 images. Transfer learning works well even on small datasets. |

### Two-Phase Training Strategy:

**Phase 1 — Frozen Base (15 Epochs)**
- The 20M base parameters were **locked/frozen** (not changed).
- Only our 4 new layers (2M params) were trained.
- Goal: Teach the new head to map "general image features" → "GREEN/BLUE/RED".
- Learning Rate: `0.001` (fast learning for new layers).

**Phase 2 — Fine-Tuning (30 Epochs)**
- We **unfroze** the top 40% of the base model's deep layers.
- Now 60% of the base is still frozen, 40% is free to adapt.
- Goal: Allow the deep layers to slightly adjust to waste images specifically.
- Learning Rate: `0.00001` (very slow, careful changes to avoid forgetting ImageNet knowledge).

### Loss Function: Categorical Cross-Entropy
Used because we have 3 classes. It measures how "wrong" the predicted probability is compared to the true label:
```
Loss = -Σ (true_label × log(predicted_probability))
```

### Optimizer: Adam
Adam is the standard optimizer for deep learning. It combines:
- **Momentum** (uses past gradients to keep moving in the right direction)
- **Adaptive Learning Rate** (adjusts step size per parameter automatically)

---

## 📦 5. What Dependencies (Libraries) Did We Install?

### Python AI Environment (`waste-gpu` Conda):
| Library | Version | Purpose |
|---|---|---|
| `tensorflow-gpu` | 2.10.1 | The core AI framework for building & training the model |
| `keras` | (built into TF) | High-level API to define layers and models |
| `cudatoolkit` | 11.2.2 | NVIDIA's CUDA library — allows Python to talk to the GPU |
| `cudnn` | 8.1.0.77 | NVIDIA's Deep Neural Network library — GPU-optimized math |
| `numpy` | 1.24.3 | Numerical arrays & math operations |
| `scikit-learn` | 1.6.1 | Used for computing class weights (balancing imbalanced data) |
| `kagglehub` | latest | Downloads datasets directly from Kaggle |
| `tqdm` | latest | Shows progress bars during download |
| `tensorflowjs` | 2.8.5 | Converts the trained model to a web-browser format |

### Frontend (React Web App):
| Library | Purpose |
|---|---|
| `React 18` | The core JavaScript UI framework |
| `TypeScript` | Adds type safety to JavaScript to prevent bugs |
| `Vite` | The ultra-fast project bundler and dev server |
| `TailwindCSS` | Utility-first CSS framework for rapid styling |
| `shadcn/ui` | Pre-built premium UI components (buttons, cards, etc.) |
| `@tensorflow/tfjs` | Runs the AI model directly in the browser |
| `@tensorflow/tfjs-backend-webgl` | Uses the laptop/phone GPU for in-browser inference |
| `Framer Motion` | Smooth animations and transitions |
| `Lucide React` | Beautiful SVG icons |
| `React Router` | Handles page navigation without reloading |

---

## ⚙️ 6. How CPU and GPU Connect to the Model During Training

This is the most important technical process. Here is exactly what happens:

### On Your Laptop (RTX 3050):

```
Python Script (CPU)
    │
    ├─ Reads image file from SSD → Decodes → Resizes to 300×300
    │
    ├─ Creates a "Batch" of 16 images (BATCH_SIZE = 16)
    │
    ├─ Sends batch data from RAM → VRAM (GPU Memory) via PCIe Bus
    │
GPU (RTX 3050) takes over:
    ├─ Forward Pass: Multiplies 22 million weights by pixel values
    │   This uses CUDA Tensor Cores → Thousands of operations in parallel
    │
    ├─ Calculates Loss (how wrong the prediction was)
    │
    ├─ Backward Pass (Backpropagation): 
    │   Calculates gradient for every single parameter
    │   (How much should each weight change?)
    │
    ├─ Adam Optimizer updates all 22M weights by a tiny amount
    │
    └─ Sends updated weights back to CPU RAM
```

### Key Speed Comparison:
| Hardware | Time per Epoch (645 steps) | Why? |
|---|---|---|
| **CPU only** | ~13 minutes | Processes 4 operations at a time |
| **RTX 3050 GPU** | ~30 seconds | 2048 CUDA cores, does 2000+ operations in parallel |
| **Speedup** | **26× faster** | GPU = parallel math machine |

### The CUDA Stack (What makes it work on Windows):
```
Python TensorFlow → CUDA Toolkit 11.2 → cuDNN 8.1 → RTX 3050 Driver → GPU Hardware
```
- **CUDA**: NVIDIA's parallel computing platform. It translates TF math into GPU instructions.
- **cuDNN**: NVIDIA's library of GPU-optimized deep learning operations (convolutions, activations, etc.)
- **The DLL Fix**: On Windows, we also had to manually add the Conda `Library/bin` folder to the system path so Python could find `cudart64_110.dll` and other required libraries.

---

## 🖥️ 7. Frontend Technology (The Website)

The website is a **Single-Page Application (SPA)** built with React and TypeScript.

### How It Works:
1. User visits the URL → GitHub Pages serves the `index.html` and JavaScript bundle.
2. React Router detects which page to show (`#/ai-detect`, `#/dashboard`, etc.).
3. On the AI page, `@tensorflow/tfjs` is dynamically imported.
4. The browser downloads the AI model shards from `/public/tfjs_model/`.
5. WebGL backend loads the model onto the **user's own GPU** (the GPU in their laptop or phone).
6. When a photo is taken, it is processed as a tensor and the model returns a prediction — entirely in the browser, with **no server call needed**.

### Why HashRouter (`#`) for Routing?
GitHub Pages is a "static host" — it cannot run server code. When you navigate directly to `/ai-detect`, GitHub's server doesn't know what to do because it's a React route, not a real file. Using `HashRouter` (`#/ai-detect`) means the URL change is handled by JavaScript in the browser, not the server.

---

## 🚀 8. How We Deployed the Model and Website

### Step 1: Train the Model Locally
```bash
cmd /c "conda activate waste-gpu && python training/2_train_model.py"
```
Output: `model_output/waste_model_final.keras` (216 MB)

### Step 2: Convert to TensorFlow.js Format
```bash
tensorflowjs_converter --input_format=keras waste_model_final.keras ./tfjs_model/
```
Output: `model.json` + 22 × `group1-shardXof22.bin` files (85 MB total)

### Step 3: Place in Public Folder
```
smart-waste-hub/
└── public/
    └── tfjs_model/
        ├── model.json        ← Model architecture
        ├── group1-shard1of22.bin  ← Weights (part 1)
        ├── group1-shard2of22.bin  ← Weights (part 2)
        └── ... (22 files total)
```

### Step 4: Automated CI/CD with GitHub Actions
The file `.github/workflows/deploy.yml` contains automation rules:

```
Developer pushes code → GitHub detects push
    ↓
GitHub Actions runner starts (Ubuntu virtual machine)
    ↓
Runs: npm install → npm run build
    ↓
Vite bundles all React code + model files → `/dist` folder
    ↓
GitHub Pages publishes the `/dist` folder to the internet
    ↓
Live at: https://om051105.github.io/smart-waste-hub/
```

---

## 🗄️ 9. Backend — Where Does the Data Come From?

This project uses a **Frontend-Only architecture** — there is no traditional server backend. Instead, data comes from three sources:

### a) AI Model (Local Inference)
- The entire AI classification runs in the user's browser using TensorFlow.js.
- No images are ever sent to a server. Maximum privacy.

### b) Mock/Simulated Data (Local State)
- The dashboard metrics (collections, complaints, routes) use **simulated data** stored directly in the React components and `localStorage`.
- This demonstrates the UI and UX without needing a live database.
- In a real deployment, this would be replaced by API calls to a Node.js/Django/Firebase backend.

### c) User Authentication (localStorage)
- Login sessions are stored in the browser's `localStorage`.
- Roles (Citizen, Champion, Administrator) determine what each user can see.

### Future Backend Plan:
If this were a production system, the backend would include:
- **API Server**: Node.js + Express or Python FastAPI
- **Database**: PostgreSQL (for complaints, routes, users) + Redis (for real-time tracking)
- **Auth**: JWT Tokens or Firebase Authentication
- **Cloud Storage**: AWS S3 or Google Cloud Storage for user-uploaded images

---

## 🔮 10. Future Plans for the Project

| Feature | Plan |
|---|---|
| **More Waste Classes** | Expand from 3 bins to 10+ (e-waste, medical, construction, etc.) |
| **Full Dataset** | Train on all 70,000 images from our 5 Kaggle sources for even higher accuracy |
| **Real-Time Map** | Live GPS tracking of waste collection trucks |
| **IoT Integration** | Smart bin sensors that auto-report when a bin is full |
| **Mobile App** | React Native version for Android and iOS |
| **Real Backend** | Replace mock data with a Node.js API + PostgreSQL database |
| **Multi-Language** | Support Hindi, Gujarati, and other Indian languages |
| **Carbon Credits** | Track CO2 saved by proper recycling and reward users |

---

## 📊 11. Dataset Details

| Source | Kaggle Dataset | Images |
|---|---|---|
| 1 | Mostafa Abla — Garbage Classification | ~15,000 |
| 2 | TrashNet Standard | ~2,500 |
| 3 | 6-Class Garbage (quangtheng) | ~20,000 |
| 4 | Garbage Classification V2 (sumn2u) | ~15,000 |
| 5 | Garbage Dataset (zlatan599) | ~17,500 |
| **Total (merged)** | **Smart Waste Hub Master Dataset** | **~70,000** |

We mapped all sub-categories (plastic, paper, metal, cardboard → BLUE_BIN), (organic, food, biological → GREEN_BIN), (battery, hazardous, trash → RED_BIN).

For local testing, we used ~13,500 images (a cleaned representative subset).

---

*Document prepared by Om Singh | Smart Waste Hub Project | March 2026*
