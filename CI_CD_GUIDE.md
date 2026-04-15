# Smart Waste Hub - CI/CD & Deployment Guide

This project is configured with a professional **CI/CD (Continuous Integration / Continuous Deployment)** pipeline using **GitHub** and **Vercel**. 

## 🚀 How CI/CD Works in This Project

1.  **Code Change**: Developers (including you and me!) make changes to the code locally.
2.  **Git Push**: When code is pushed to the `main` branch on GitHub:
    - **Continuous Integration (CI)**: GitHub notifies Vercel. Vercel automatically starts a "Build" process. It installs dependencies, compiles TypeScript, and checks for errors.
    - **Continuous Deployment (CD)**: If the build is successful, Vercel instantly deploys the new version to your live URL (`smart-waste-hub.vercel.app`).

## 🛠️ Monitoring Your Pipeline

- **GitHub Actions**: You can see your commit status in your GitHub repository.
- **Vercel Dashboard**: Log into [vercel.com](https://vercel.com) to see live logs of every deployment.
- **Environment Variables**: Managed securely through the Vercel dashboard (e.g., `MONGO_URI`).

## 🤖 Automated Machine Learning (AutoML)

This project features a **Self-Learning Feedback Loop**:
- **Dataset Collection**: Every time a user provides feedback in the AI Detection tool, the image and correct label are saved to MongoDB.
- **Model Evolution**: In the **Admin Dashboard**, you can see these "Learning Samples" and trigger a **Model Retrain**.
- **Version Control**: The system tracks model versions (e.g., `v2.0.x`) and updates them dynamically as the dataset grows.

## 🏋️ How to Retrain with Google Colab

If you want to make your AI **actually smarter** using your collected data, follow these steps:

1.  **Open the Trainer**: In your **Admin Dashboard**, click **"Open Colab Trainer"**.
2.  **Connect Data**: In the first cell of the Google Colab notebook, paste your **MONGO_URI**. 
3.  **Run All**: Click **Runtime ➔ Run all**. The notebook will download all your user-submitted feedback images from MongoDB and start retraining a new AI model!
4.  **Download & Replace**: Once finished, download the `model.json` and `.bin` weights from Colab. 
5.  **Deploy**: Upload these files to your project's `public/tfjs_model/` folder and **Git Push**. Vercel will automatically deploy your smarter AI!

---
*Developed for Smart Waste Hub Pro*
