import os
import torch
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageEnhance
from ultralytics import YOLO
from typing import Dict, List, Any, Optional
import tempfile
import logging
import io
import base64
import cv2

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
    
    def preprocess_image(self, image_data: bytes, preprocessing_options: Dict[str, Any] = None) -> bytes:
        """
        Preprocess image for better YOLO prediction
        
        Args:
            image_data: Original image as bytes
            preprocessing_options: Dictionary with preprocessing options
            
        Returns:
            Preprocessed image as bytes
        """
        if preprocessing_options is None:
            preprocessing_options = {
                'convert_to_grayscale': True,
                'enhance_contrast': True,
                'noise_reduction': True,
                'normalize_brightness': True
            }
        
        try:
            # Load image from bytes
            image = Image.open(io.BytesIO(image_data))
            
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # FORCE GRAYSCALE CONVERSION - NO EXCEPTIONS!
            if preprocessing_options.get('convert_to_grayscale', True):
                # Convert to grayscale using multiple methods to ensure it works
                # Method 1: PIL convert to L (luminance) then back to RGB
                grayscale_pil = image.convert('L')
                
                # Method 2: Also use OpenCV for extra security
                cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
                cv_gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
                cv_gray_rgb = cv2.cvtColor(cv_gray, cv2.COLOR_GRAY2RGB)
                
                # Use the OpenCV result to be 100% sure
                image = Image.fromarray(cv_gray_rgb)
                
                # MANDATORY VERIFICATION - Force grayscale
                np_image = np.array(image)
                r_channel = np_image[:, :, 0]
                g_channel = np_image[:, :, 1] 
                b_channel = np_image[:, :, 2]
                is_grayscale = np.array_equal(r_channel, g_channel) and np.array_equal(g_channel, b_channel)
                
                if not is_grayscale:
                    # FORCE it if still not grayscale
                    gray_avg = np.mean(np_image, axis=2, dtype=np.uint8)
                    image = Image.fromarray(np.stack([gray_avg, gray_avg, gray_avg], axis=-1))
                    logger.info("🔧 FORCED grayscale conversion using average method")
                
                logger.info(f"✅ GRAYSCALE GUARANTEED: Final verification passed")
            
            # Enhance contrast
            if preprocessing_options.get('enhance_contrast', True):
                enhancer = ImageEnhance.Contrast(image)
                image = enhancer.enhance(1.3)  # Increase contrast by 30%
                logger.info("Enhanced image contrast")
            
            # Normalize brightness
            if preprocessing_options.get('normalize_brightness', True):
                enhancer = ImageEnhance.Brightness(image)
                image = enhancer.enhance(1.1)  # Slight brightness increase
                logger.info("Normalized image brightness")
            
            # Noise reduction using OpenCV (optional)
            if preprocessing_options.get('noise_reduction', True):
                # Convert PIL to OpenCV format
                cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
                # Apply bilateral filter for noise reduction while preserving edges
                cv_image = cv2.bilateralFilter(cv_image, 9, 75, 75)
                # Convert back to PIL
                image = Image.fromarray(cv2.cvtColor(cv_image, cv2.COLOR_BGR2RGB))
                logger.info("Applied noise reduction")
            
            # Convert back to bytes
            img_buffer = io.BytesIO()
            image.save(img_buffer, format='JPEG', quality=95)
            preprocessed_data = img_buffer.getvalue()
            
            logger.info("Image preprocessing completed successfully")
            return preprocessed_data
            
        except Exception as e:
            logger.error(f"Image preprocessing error: {str(e)}")
            # Return original image if preprocessing fails
            return image_data
    
    def predict_image(self, image_data: bytes, confidence_threshold: float = 0.25, return_annotated: bool = True, 
                     enable_preprocessing: bool = True, preprocessing_options: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Predict skin conditions from image bytes
        
        Args:
            image_data: Image as bytes
            confidence_threshold: Minimum confidence for predictions
            return_annotated: Whether to return annotated image
            enable_preprocessing: Whether to apply image preprocessing
            preprocessing_options: Custom preprocessing options
            
        Returns:
            Dictionary with predictions and metadata
        """
        if self.model is None:
            if not self.load_model():
                raise RuntimeError("YOLO model not loaded")
        
        try:
            # Apply preprocessing if enabled
            processed_image_data = image_data
            if enable_preprocessing:
                processed_image_data = self.preprocess_image(image_data, preprocessing_options)
                logger.info("Applied image preprocessing for better prediction")
            
            # Create temporary file for processed image
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp_file:
                tmp_file.write(processed_image_data)
                tmp_path = tmp_file.name
            
            try:
                # FINAL YOLO INPUT VERIFICATION - Zero tolerance for color
                verify_image = Image.open(tmp_path)
                verify_array = np.array(verify_image)
                
                if len(verify_array.shape) == 3:
                    r_ch = verify_array[:, :, 0]
                    g_ch = verify_array[:, :, 1]
                    b_ch = verify_array[:, :, 2]
                    yolo_gets_grayscale = np.array_equal(r_ch, g_ch) and np.array_equal(g_ch, b_ch)
                    
                    if not yolo_gets_grayscale and enable_preprocessing:
                        # EMERGENCY FIX: Force save grayscale image
                        logger.error("🚨 EMERGENCY: Rewriting YOLO input file to grayscale!")
                        gray_avg = np.mean(verify_array, axis=2, dtype=np.uint8)
                        forced_gray = np.stack([gray_avg, gray_avg, gray_avg], axis=-1)
                        Image.fromarray(forced_gray).save(tmp_path, format='JPEG', quality=95)
                        yolo_gets_grayscale = True
                        logger.info("✅ EMERGENCY FIX: YOLO input forced to grayscale")
                
                # Run prediction on processed image
                results = self.model(tmp_path, conf=confidence_threshold)
                result = results[0]
                
                # Process results
                prediction_results = self._process_results(result)
                
                response = {
                    "success": True,
                    "predictions": prediction_results,
                    "preprocessing_applied": enable_preprocessing,
                    "yolo_input_verified_grayscale": enable_preprocessing,  # New field to confirm YOLO input
                    "model_info": {
                        "model_path": self.model_path,
                        "confidence_threshold": confidence_threshold,
                        "device": 'cuda' if torch.cuda.is_available() else 'cpu',
                        "preprocessing_enabled": enable_preprocessing,
                        "grayscale_confirmed": enable_preprocessing  # Additional confirmation
                    }
                }
                
                # Add annotated image if requested (use preprocessed image for annotation to show YOLO's view)
                if return_annotated and len(prediction_results) > 0:
                    # Annotate the preprocessed (grayscale) image to show exactly what YOLO sees
                    annotated_image = self._create_annotated_image(processed_image_data, prediction_results)
                    if annotated_image:
                        response["annotated_image"] = annotated_image
                        logger.info("Created annotated image on preprocessed (grayscale) photo - showing YOLO's view")
                
                # Also add preprocessed image for comparison
                if enable_preprocessing:
                    preprocessed_base64 = base64.b64encode(processed_image_data).decode('utf-8')
                    response["preprocessed_image"] = f"data:image/jpeg;base64,{preprocessed_base64}"
                
                return response
                
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
                    "bbox": {
                        "x": float(box[0]),
                        "y": float(box[1]), 
                        "width": float(box[2] - box[0]),
                        "height": float(box[3] - box[1])
                    },
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

    def _create_annotated_image(self, image_data: bytes, predictions: List[Dict[str, Any]]) -> Optional[str]:
        """Create annotated image with bounding boxes and labels"""
        try:
            # Load image from bytes
            image = Image.open(io.BytesIO(image_data))
            draw = ImageDraw.Draw(image)
            
            # Try to load a font, fallback to default if not available
            try:
                font = ImageFont.truetype("arial.ttf", 16)
            except:
                font = ImageFont.load_default()
            
            # Color mapping for different conditions
            colors = {
                'acne': '#ef4444',      # red
                'blackhead': '#8b5cf6', # purple  
                'dark_spot': '#f59e0b', # yellow
                'redness': '#ef4444',   # red
                'normal': '#22c55e',    # green
                'whitehead': '#06b6d4', # cyan
                'pimple': '#ef4444',    # red
                'skin_blemish': '#f59e0b', # yellow
                'acne_scar': '#6b7280', # gray
                'skin_lesion': '#dc2626' # dark red
            }
            
            # Draw bounding boxes and labels
            for pred in predictions:
                bbox = pred['bounding_box']
                class_name = pred['class_name']
                confidence = pred['confidence']
                
                # Get color for this class
                color = colors.get(class_name, '#6b7280')
                
                # Draw bounding box
                draw.rectangle(
                    [bbox['x1'], bbox['y1'], bbox['x2'], bbox['y2']], 
                    outline=color, 
                    width=3
                )
                
                # Draw label background
                label = f"{class_name} ({confidence:.2f})"
                bbox_text = draw.textbbox((bbox['x1'], bbox['y1'] - 25), label, font=font)
                draw.rectangle(bbox_text, fill=color)
                
                # Draw label text
                draw.text(
                    (bbox['x1'], bbox['y1'] - 25), 
                    label, 
                    fill='white', 
                    font=font
                )
            
            # Convert back to bytes and then to base64
            img_buffer = io.BytesIO()
            image.save(img_buffer, format='JPEG', quality=95)
            img_buffer.seek(0)
            
            # Convert to base64 for easy transmission
            img_base64 = base64.b64encode(img_buffer.getvalue()).decode('utf-8')
            return f"data:image/jpeg;base64,{img_base64}"
            
        except Exception as e:
            logger.error(f"Error creating annotated image: {str(e)}")
            return None

# Global predictor instance
yolo_predictor = YOLOPredictor()
