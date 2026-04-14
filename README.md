# Smart Waste Hub

A modern, comprehensive web platform for efficient and intelligent waste management. Smart Waste Hub connects citizens, waste collection workers, and facility administrators via an integrated dashboard, enabling real-time tracking, AI-powered sorting detection, complaint resolution, and a gamified rewards system for sustainable practices.

## 🚀 Live Site 
[**View Smart Waste Hub Live**](https://om051105.github.io/smart-waste-hub/)

## ✨ Key Features
- **Role-Based Dashboards**: Tailored views for Citizens, Champions (Waste Workers), and Administrators.
- **AI Waste Detection Mockup**: Identify and categorize waste for correct disposal.
- **Complaints & Reporting**: Integrated geotagging for tracking uncollected waste or overflowing bins.
- **Gamified Rewards System**: Earn points and badges by participating in proper waste disposal and recycling initiatives.
- **Facilities & Collections Management**: Real-time maps, facility status monitoring, and route management.

## 🛠️ Tech Stack
- **Frontend Framework**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS & shadcn/ui
- **Routing**: React Router (`HashRouter` for static host compatibility)
- **Icons**: Lucide React
- **CI/CD**: GitHub Actions & GitHub Pages Custom Workflow

## 💻 Local Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/om051105/smart-waste-hub.git
   cd smart-waste-hub
   ```

2. **Install dependencies**
   Use `npm` to install the required packages.
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **View the App**
   Open your browser and navigate to `http://localhost:8080` (or the port specified in your terminal).

## 🚢 Deployment

This application automatically builds and deploys to GitHub Pages via a **GitHub Actions** workflow whenever code is pushed to the `main` branch. 

To manually build the production bundle locally:
```bash
npm run build
```
The optimized static files will be generated in the `dist/` directory.

## 🧠 AI Waste Classifier (The "Massive" Model)

The core feature of this platform is a **custom-trained EfficientNetV2-S** deep learning model that performs real-time waste classification directly in the browser.

### 📊 Dataset Details
The model was trained on a massive merged dataset of **~70,000 images** from the following 5 verified Kaggle sources:
1. [Garbage Classification (Mostafa Abla)](https://www.kaggle.com/datasets/mostafaabla/garbage-classification)
2. [TrashNet Standard (asdasdasasdas)](https://www.kaggle.com/datasets/asdasdasasdas/garbage-classification)
3. [Garbage-Classification-6-classes (quangtheng)](https://www.kaggle.com/datasets/quangtheng/garbage-classification-6-classes-775class)
4. [Garbage Classification V2 (sumn2u)](https://www.kaggle.com/datasets/sumn2u/garbage-classification-v2)
5. [Garbage Dataset (zlatan599)](https://www.kaggle.com/datasets/zlatan599/garbage-dataset-classification)

### ⚙️ Training Specs
- **Architecture**: EfficientNetV2-S (22M parameters)
- **Framework**: TensorFlow & Keras
- **Inference**: TensorFlow.js (Offline Browser Inference)
- **Time**: 6-8 Hours on Google Colab T4 GPU


