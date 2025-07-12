import pandas as pd
import numpy as np
import os
import torch
from ultralytics import YOLO



print(f"Is Cuda available      :{torch.cuda.is_available()}")
print(f"Number of Cuda devices :{torch.cuda.device_count()}")
print(f"Name of the GPU        :{torch.cuda.get_device_name(0)}")

# Load the YOLO model
print("Loading YOLO model...")
if not os.path.exists("yolo/yolov8n_custom.pt"):
    raise FileNotFoundError("YOLO model file 'yolov8n_custom.pt' not found in 'yolo/' directory.")
else:
    model = YOLO("yolo/yolov8n_custom.pt")
    print("Model loaded successfully.")



