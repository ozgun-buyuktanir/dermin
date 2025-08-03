import os
import torch
import numpy as np
from PIL import Image
from ultralytics import YOLO
from typing import Dict, List, Any, Optional
import tempfile
import logging

logger = logging.getLogger(__name__)

class YOLOPredictor:
    def __init__(self):
        self.model = None
        self.model_path = None
        self.class_names = {
            0: "acne",
            1: "blackhead", 
            2: "dark_spot",
            3: "redness",
            4: "normal",
            5: "whitehead",
            6: "pimple", 
            7: "skin_blemish",
            8: "acne_scar",
            9: "skin_lesion"
        }
        
    def load_model(self, model_path: str = None):
        """Load YOLO model"""
        try:
            if model_path is None:
                # Try different possible paths
                possible_paths = [
                    "models/yolov8s_50epochs.pt",  # Primary model
                    "models/yolov8n_custom.pt",   # Backup model
                    "backend/models/yolov8s_50epochs.pt",
                    "backend/models/yolov8n_custom.pt",
                    "../models/yolov8s_50epochs.pt",
                    "../models/yolov8n_custom.pt"
                ]
                
                for path in possible_paths:
                    if os.path.exists(path):
                        model_path = path
                        break
                
                if model_path is None:
                    raise FileNotFoundError("YOLO model file not found in any expected location")
            
            logger.info(f"Loading YOLO model from: {model_path}")
            self.model = YOLO(model_path)
            self.model_path = model_path
            
            # Get actual class names from the model
            if hasattr(self.model.model, 'names'):
                self.class_names = self.model.model.names
                logger.info(f"Model classes: {self.class_names}")
            else:
                logger.warning("Could not get class names from model, using defaults")
            
            # Check if CUDA is available
            device = 'cuda' if torch.cuda.is_available() else 'cpu'
            logger.info(f"Using device: {device}")
            if torch.cuda.is_available():
                logger.info(f"GPU: {torch.cuda.get_device_name(0)}")
            
            logger.info("YOLO model loaded successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to load YOLO model: {str(e)}")
            return False
    
    def predict_image(self, image_data: bytes, confidence_threshold: float = 0.25) -> Dict[str, Any]:
        """
        Predict skin conditions from image bytes
        
        Args:
            image_data: Image as bytes
            confidence_threshold: Minimum confidence for predictions
            
        Returns:
            Dictionary with predictions and metadata
        """
        if self.model is None:
            if not self.load_model():
                raise RuntimeError("YOLO model not loaded")
        
        try:
            # Create temporary file for image
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp_file:
                tmp_file.write(image_data)
                tmp_path = tmp_file.name
            
            try:
                # Run prediction
                results = self.model(tmp_path, conf=confidence_threshold)
                
                # Process results
                prediction_results = self._process_results(results[0])
                
                return {
                    "success": True,
                    "predictions": prediction_results,
                    "model_info": {
                        "model_path": self.model_path,
                        "confidence_threshold": confidence_threshold,
                        "device": 'cuda' if torch.cuda.is_available() else 'cpu'
                    }
                }
                
            finally:
                # Clean up temporary file
                if os.path.exists(tmp_path):
                    os.unlink(tmp_path)
                    
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "predictions": []
            }
    
    def _process_results(self, result) -> List[Dict[str, Any]]:
        """Process YOLO results into structured format"""
        predictions = []
        
        if result.boxes is not None:
            boxes = result.boxes.xyxy.cpu().numpy()  # Bounding boxes
            scores = result.boxes.conf.cpu().numpy()  # Confidence scores
            classes = result.boxes.cls.cpu().numpy()  # Class indices
            
            for i in range(len(boxes)):
                box = boxes[i]
                score = float(scores[i])
                class_id = int(classes[i])
                class_name = self.class_names.get(class_id, f"class_{class_id}")
                
                prediction = {
                    "class_id": class_id,
                    "class_name": class_name,
                    "confidence": score,
                    "bounding_box": {
                        "x1": float(box[0]),
                        "y1": float(box[1]), 
                        "x2": float(box[2]),
                        "y2": float(box[3])
                    },
                    "area": float((box[2] - box[0]) * (box[3] - box[1]))
                }
                predictions.append(prediction)
        
        # Sort by confidence
        predictions.sort(key=lambda x: x["confidence"], reverse=True)
        
        return predictions
    
    def get_analysis_summary(self, predictions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate analysis summary from predictions"""
        if not predictions:
            return {
                "overall_status": "clear",
                "detected_conditions": [],
                "total_detections": 0,
                "confidence_avg": 0.0,
                "recommendations": ["Your skin appears clear! Keep up with your current skincare routine."]
            }
        
        # Count conditions
        condition_counts = {}
        total_confidence = 0
        
        for pred in predictions:
            condition = pred["class_name"]
            if condition not in condition_counts:
                condition_counts[condition] = 0
            condition_counts[condition] += 1
            total_confidence += pred["confidence"]
        
        avg_confidence = total_confidence / len(predictions)
        
        # Determine overall status
        serious_conditions = ["acne", "redness", "dark_spot"]
        has_serious = any(cond in condition_counts for cond in serious_conditions)
        overall_status = "needs_attention" if has_serious else "mild_concerns"
        
        # Generate recommendations
        recommendations = self._generate_recommendations(condition_counts)
        
        return {
            "overall_status": overall_status,
            "detected_conditions": list(condition_counts.keys()),
            "condition_counts": condition_counts,
            "total_detections": len(predictions),
            "confidence_avg": round(avg_confidence, 3),
            "recommendations": recommendations
        }
    
    def _generate_recommendations(self, condition_counts: Dict[str, int]) -> List[str]:
        """Generate personalized recommendations based on detected conditions"""
        recommendations = []
        
        if "acne" in condition_counts:
            recommendations.append("Consider using salicylic acid or benzoyl peroxide products for acne treatment.")
            recommendations.append("Maintain a consistent cleansing routine with gentle, non-comedogenic products.")
        
        if "blackhead" in condition_counts:
            recommendations.append("Use BHA (beta hydroxy acid) products to help unclog pores.")
            recommendations.append("Consider regular exfoliation with gentle chemical exfoliants.")
        
        if "dark_spot" in condition_counts:
            recommendations.append("Apply vitamin C serum in the morning for dark spot treatment.")
            recommendations.append("Use retinol products at night to promote skin cell turnover.")
            recommendations.append("Always apply SPF 30+ sunscreen to prevent further dark spots.")
        
        if "redness" in condition_counts:
            recommendations.append("Use products with niacinamide to reduce redness and inflammation.")
            recommendations.append("Avoid harsh scrubs and opt for gentle, fragrance-free products.")
            recommendations.append("Consider products with centella asiatica or aloe vera for soothing effects.")
        
        if not recommendations:
            recommendations.append("Your skin looks great! Maintain your current routine.")
            recommendations.append("Don't forget daily SPF protection.")
        
        # Add general recommendations
        recommendations.append("Stay hydrated and maintain a healthy diet for optimal skin health.")
        recommendations.append("If concerns persist, consider consulting a dermatologist.")
        
        return recommendations

# Global predictor instance
yolo_predictor = YOLOPredictor()
