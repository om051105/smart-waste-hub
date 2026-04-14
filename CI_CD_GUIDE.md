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

---
*Developed for Smart Waste Hub Pro*
