"""
Smart Waste Hub - Step 1: Download & Organize Massive Dataset
=============================================================
Features: 5 Kaggle Sources | Case-Insensitive | Tqdm Progress Bar
Clean version: No emojis.
"""

import os, shutil, random
from pathlib import Path
import kagglehub
from tqdm.auto import tqdm

# --- 1. DOWNLOAD THE DATASETS ---
print("[INFO] Fetching Massive Datasets from Kaggle...")
paths = [
    kagglehub.dataset_download("mostafaabla/garbage-classification"),
    kagglehub.dataset_download("asdasdasasdas/garbage-classification"),
    kagglehub.dataset_download("quangtheng/garbage-classification-6-classes-775class"),
    kagglehub.dataset_download("sumn2u/garbage-classification-v2"),
    kagglehub.dataset_download("zlatan599/garbage-dataset-classification")
]

# --- 2. CONFIG MAPPING ---
BASE = Path("./dataset")
MASTER_MAP = {
    "biological": "GREEN_BIN", "organic": "GREEN_BIN", "o": "GREEN_BIN",
    "compost": "GREEN_BIN", "food": "GREEN_BIN",
    "plastic": "BLUE_BIN", "paper": "BLUE_BIN", "glass": "BLUE_BIN",
    "metal": "BLUE_BIN", "cardboard": "BLUE_BIN", "clothes": "BLUE_BIN", 
    "shoes": "BLUE_BIN", "green-glass": "BLUE_BIN", "brown-glass": "BLUE_BIN",
    "white-glass": "BLUE_BIN", "r": "BLUE_BIN", "recycle": "BLUE_BIN",
    "battery": "RED_BIN", "batteries": "RED_BIN", "trash": "RED_BIN",
    "hazardous": "RED_BIN", "non-recyclable": "RED_BIN", "e-waste": "RED_BIN"
}

if BASE.exists(): shutil.rmtree(BASE)
for split in ["train", "val"]:
    for b in ["GREEN_BIN", "BLUE_BIN", "RED_BIN"]:
        (BASE / split / b).mkdir(parents=True, exist_ok=True)

def process_it(src_path, prefix):
    print(f"\n[INFO] Organizing {prefix} images...")
    src = Path(src_path)
    count = 0
    all_folders = [f for f in list(src.rglob("*")) if f.is_dir() and f.name.lower().strip() in MASTER_MAP]
    
    for folder in tqdm(all_folders, desc=f"Scanning {prefix}"):
        key = folder.name.lower().strip()
        target = MASTER_MAP[key]
        imgs = []
        for ext in [".jpg", ".JPG", ".jpeg", ".JPEG", ".png", ".PNG"]:
            imgs.extend(list(folder.glob(f"*{ext}")))
        
        if not imgs: continue
        random.shuffle(imgs)
        tr_idx = int(len(imgs) * 0.85)
        for i, img in enumerate(imgs):
            split = "train" if i < tr_idx else "val"
            shutil.copy2(img, BASE / split / target / f"{prefix}_{i}{img.suffix}")
            count += 1
    return count

total_images = sum([process_it(p, f"source_{i+1}") for i, p in enumerate(paths)])

# --- 3. SUMMARY ---
print(f"\n[SUCCESS] BIG DATASET READY! Total images: {total_images}")
for split in ["train", "val"]:
    print(f"\n  [{split.upper()}]")
    for b in ["GREEN_BIN", "BLUE_BIN", "RED_BIN"]:
        n = len(os.listdir(BASE/split/b))
        print(f"    {b}: {n} images")
