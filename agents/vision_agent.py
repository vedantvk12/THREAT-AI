import cv2
import time
import json
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core.event_bus import EventBus
import math
import numpy as np
from collections import deque
from datetime import datetime
from ultralytics import YOLO

# --- CONFIGURATION ---
CONF_THRESHOLD = 0.20  # Updated to 0.20 for better weapon detection
STGCN_WINDOW_SIZE = 30 
CONSISTENCY_WINDOW = 10 
PRIVACY_MODE = False   # Set True to blur faces (Issue 5: Ethical Guardrails)
# 43=Knife, 76=Scissors. 
THREAT_CLASSES = [43, 76] 

class IdentityManager:
    """
    ISSUE 1 SOLVER: Identity Persistence
    Maintains a database of visual features to re-identify people 
    who leave the frame and return.
    """
    def __init__(self):
        self.known_identities = {} # { id: { 'embedding': vector, 'last_seen': time } }
        self.lost_identities = {}  # { id: { 'embedding': vector, 'last_seen': time } }
        self.next_global_id = 1

    def get_visual_embedding(self, frame, box):
        """
        Creates a lightweight 'Visual Fingerprint' (Color Histogram)
        Real startup would use OSNet here. This is a fast, robust proxy.
        """
        try:
            x1, y1, x2, y2 = box
            # Ensure crop is within frame
            h, w, _ = frame.shape
            x1, y1 = max(0, x1), max(0, y1)
            x2, y2 = min(w, x2), min(h, y2)
            
            person_crop = frame[y1:y2, x1:x2]
            if person_crop.size == 0: return None

            # Calculate HSV Color Histogram (Robust to lighting changes)
            hsv = cv2.cvtColor(person_crop, cv2.COLOR_BGR2HSV)
            hist = cv2.calcHist([hsv], [0, 1], None, [16, 16], [0, 180, 0, 256])
            cv2.normalize(hist, hist)
            return hist.flatten()
        except Exception:
            return None

    def resolve_identity(self, yolov8_id, frame, box):
        """
        Maps the temporary YOLOv8 ID to a Global Persistent ID.
        """
        embedding = self.get_visual_embedding(frame, box)
        if embedding is None: return yolov8_id

        # 1. Check if this YOLO ID is already mapped
        if yolov8_id in self.known_identities:
            # Update their embedding
            self.known_identities[yolov8_id]['embedding'] = embedding
            self.known_identities[yolov8_id]['last_seen'] = time.time()
            return yolov8_id

        # 2. If new YOLO ID, check "Lost & Found" (Did they just come back?)
        best_match_id = None
        best_score = 0.0

        current_time = time.time()
        # Clean up old lost identities (> 60 seconds)
        self.lost_identities = {k:v for k,v in self.lost_identities.items() if current_time - v['last_seen'] < 60}

        for lost_id, data in self.lost_identities.items():
            # Compare Histograms (Correlation method)
            score = cv2.compareHist(
                np.array(embedding, dtype=np.float32).reshape(16, 16), 
                np.array(data['embedding'], dtype=np.float32).reshape(16, 16), 
                cv2.HISTCMP_CORREL
            )
            
            if score > 0.85: # High similarity threshold
                if score > best_score:
                    best_score = score
                    best_match_id = lost_id

        if best_match_id:
            # RESTORE OLD IDENTITY
            print(f"[IDENTITY] Re-identified ID:{best_match_id} (Match: {int(best_score*100)}%)")
            del self.lost_identities[best_match_id] # Remove from lost
            self.known_identities[best_match_id] = {'embedding': embedding, 'last_seen': time.time()}
            return best_match_id
        
        # 3. Truly new person
        self.known_identities[yolov8_id] = {'embedding': embedding, 'last_seen': time.time()}
        return yolov8_id

class ActionClassifier:
    def __init__(self, model_path="stgcn.onnx"):
        self.use_neural_net = False
        self.history = {} 
        
        # --- NEW: INTENT TRACKING MEMORY ---
        # Stores { track_id: { 'last_state': 'NEUTRAL', 'timestamp': 12345.6 } }
        self.state_memory = {} 
        
        try:
            import onnxruntime as ort
            self.ort_session = ort.InferenceSession(model_path)
            self.use_neural_net = True
            print(f"[INFO] ST-GCN Action Model loaded.")
        except Exception:
            print(f"[INFO] Using Geometric Heuristics (Robust Fallback Mode).")

    def normalize_kpts(self, kpts):
        valid = kpts[kpts[:, 2] > 0.5][:, :2]
        if len(valid) < 3: return kpts
        center = valid.mean(axis=0)
        kpts_norm = kpts.copy()
        kpts_norm[:, :2] -= center
        scale = np.linalg.norm(valid.max(axis=0) - valid.min(axis=0)) + 1e-6
        kpts_norm[:, :2] /= scale
        return kpts_norm

    def update_buffer(self, track_id, kpts):
        if track_id not in self.history:
            self.history[track_id] = deque(maxlen=STGCN_WINDOW_SIZE)
        norm_kpts = self.normalize_kpts(kpts)
        self.history[track_id].append(norm_kpts)

    def geometric_fallback(self, kpts):
        def get_pt(idx):
            if kpts[idx][2] > 0.5: return np.array([kpts[idx][0], kpts[idx][1]])
            return None
        def calc_angle(a, b, c):
            if a is None or b is None or c is None: return 0
            rad = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
            angle = np.abs(rad * 180.0 / np.pi)
            return 360 - angle if angle > 180 else angle

        nose = get_pt(0)
        l_w, r_w = get_pt(9), get_pt(10)
        l_s, r_s = get_pt(5), get_pt(6)
        l_e, r_e = get_pt(7), get_pt(8)

        if l_w is not None and r_w is not None and nose is not None:
            if l_w[1] < nose[1] and r_w[1] < nose[1]:
                return "SURRENDER", 0.95

        if l_w is not None and r_w is not None and l_s is not None and r_s is not None:
            hands_up = l_w[1] < l_s[1] + 50 and r_w[1] < r_s[1] + 50
            l_angle = calc_angle(l_s, l_e, l_w)
            r_angle = calc_angle(r_s, r_e, r_w)
            if hands_up and (l_angle < 130 or r_angle < 130):
                conf = min(1.0, (140 - min(l_angle, r_angle)) / 40.0)
                return "AGGRESSIVE", round(conf, 2)

        return "NEUTRAL", 0.0

    def check_temporal_consistency(self, track_id, current_action):
        if track_id not in self.history or len(self.history[track_id]) < CONSISTENCY_WINDOW:
            return current_action, 0.5
        past_actions = []
        for past_kpts in list(self.history[track_id])[-CONSISTENCY_WINDOW:]:
            act, _ = self.geometric_fallback(past_kpts) 
            past_actions.append(act)
        count = past_actions.count(current_action)
        consistency_ratio = count / CONSISTENCY_WINDOW
        if consistency_ratio > 0.6:
            return current_action, consistency_ratio
        else:
            return "NEUTRAL", 0.0

    def analyze_intent(self, track_id, current_action):
        """
        Calculates ESCALATION SPEED (How fast did they get aggressive?)
        """
        now = time.time()
        transition_data = None

        # Initialize memory if new subject
        if track_id not in self.state_memory:
            self.state_memory[track_id] = {'last_state': 'NEUTRAL', 'timestamp': now}
        
        last_state = self.state_memory[track_id]['last_state']
        last_time = self.state_memory[track_id]['timestamp']

        # DETECT STATE CHANGE
        if current_action != last_state:
            duration = now - last_time
            
            # 1. NEUTRAL -> AGGRESSIVE (The "Flashpoint")
            if last_state == "NEUTRAL" and current_action == "AGGRESSIVE":
                transition_data = {
                    "type": "ESCALATION",
                    "duration": round(duration, 2), # e.g., 0.5 seconds
                    "velocity": "HIGH" if duration < 2.0 else "LOW"
                }
            
            # 2. AGGRESSIVE -> SURRENDER (De-escalation)
            elif last_state == "AGGRESSIVE" and current_action == "SURRENDER":
                transition_data = {
                    "type": "DE_ESCALATION",
                    "duration": round(duration, 2)
                }

            # Update Memory
            self.state_memory[track_id] = {'last_state': current_action, 'timestamp': now}

        return transition_data

    def predict(self, track_id, kpts):
        self.update_buffer(track_id, kpts)
        raw_action, raw_conf = self.geometric_fallback(kpts)
        
        # 1. Smooth the action
        if raw_action != "NEUTRAL":
            final_action, consistency = self.check_temporal_consistency(track_id, raw_action)
            final_conf = (raw_conf + consistency) / 2
        else:
            final_action = "NEUTRAL"
            final_conf = 0.0

        # 2. Calculate Intent Escalation (NEW)
        transition = self.analyze_intent(track_id, final_action)

        return {
            "label": final_action, 
            "confidence": float(final_conf),
            "transition": transition # Sending this to Brain
        }

class VisualAgent:
    def __init__(self, source=0):
        print("[INFO] Initializing Universal Vision System (Level-9 Identity+Privacy)...")
        
        print("   ├── Loading YOLOv8-Pose (Behavior)...")
        self.pose_model = YOLO('yolov8n-pose.pt') 
        
        print("   ├── Loading YOLOv8 (All Objects)...")
        self.object_model = YOLO('yolov8n.pt')

        self.cap = cv2.VideoCapture(source)
        self.classifier = ActionClassifier()
        self.identity_manager = IdentityManager() # NEW: Identity Persistence
        
        self.bus = EventBus()
        print("[INFO] Connected to Event Bus.")

    def apply_privacy_filter(self, frame, box):
        """
        ISSUE 5 SOLVER: Privacy Blurring
        Blurs the face region (top 20% of the bounding box)
        """
        x1, y1, x2, y2 = box
        face_h = int((y2 - y1) * 0.25) # Assume face is top 25%
        face_y2 = min(y2, y1 + face_h)
        
        # Extract face region
        face_roi = frame[y1:face_y2, x1:x2]
        if face_roi.size > 0:
            # Apply strong Gaussian Blur
            blurred = cv2.GaussianBlur(face_roi, (51, 51), 30)
            frame[y1:face_y2, x1:x2] = blurred
        return frame

    def run(self):
        while True:
            ret, frame = self.cap.read()
            if not ret: break

            # --- PASS 1: BEHAVIORAL ANALYSIS ---
            pose_results = self.pose_model.track(frame, persist=True, verbose=False, tracker="bytetrack.yaml")
            detected_people = []
            
            if pose_results[0].keypoints is not None and pose_results[0].boxes.id is not None:
                keypoints = pose_results[0].keypoints.data.cpu().numpy()
                boxes = pose_results[0].boxes.xyxy.cpu().numpy().astype(int)
                raw_track_ids = pose_results[0].boxes.id.cpu().numpy().astype(int)
                
                for i, kpts in enumerate(keypoints):
                    raw_id = raw_track_ids[i]
                    box = boxes[i]
                    
                    # 1. RESOLVE LONG-TERM IDENTITY (Issue 1)
                    track_id = self.identity_manager.resolve_identity(raw_id, frame, box)

                    # 2. PREDICT INTENT
                    prediction = self.classifier.predict(track_id, kpts)
                    action = prediction['label']
                    conf = prediction['confidence']
                    transition = prediction['transition']

                    detected_people.append({
                        "id": int(track_id),
                        "box": [int(x) for x in box],
                        "action": prediction
                    })

                    # 3. VISUALIZATION & PRIVACY (Issue 5)
                    color = (0, 255, 0)
                    label_extra = ""
                    
                    if action == "AGGRESSIVE": 
                        color = (0, 0, 255)
                        if transition and transition['type'] == 'ESCALATION':
                            label_extra = f" [RAPID ESCALATION {transition['duration']}s]"
                    elif action == "SURRENDER": 
                        color = (255, 255, 0)

                    cv2.rectangle(frame, (box[0], box[1]), (box[2], box[3]), color, 2)
                    
                    # Apply Privacy Blur if enabled
                    if PRIVACY_MODE:
                        frame = self.apply_privacy_filter(frame, box)
                        label_extra += " [PRIVACY]"

                    cv2.putText(frame, f"ID:{track_id} {action}{label_extra} {int(conf*100)}%", (box[0], box[1]-10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

            # Send Behavioral Data
            if detected_people:
                msg = {
                    "source": "VISUAL_POSE",
                    "timestamp": time.time(),
                    "people": detected_people
                }
                self.bus.publish("vision_events", msg)

            # --- PASS 2: UNIVERSAL OBJECT DETECTION ---
            # CONF_THRESHOLD is now 0.20 to fix the knife detection issue
            obj_results = self.object_model.predict(frame, conf=CONF_THRESHOLD, verbose=False)
            
            if len(obj_results[0].boxes) > 0:
                for box in obj_results[0].boxes:
                    coords = box.xyxy[0].cpu().numpy().astype(int)
                    conf = float(box.conf[0].cpu().numpy())
                    class_id = int(box.cls[0].cpu().numpy())
                    label = self.object_model.names[class_id]
                    
                    # CHECK IF THREAT
                    is_threat = class_id in THREAT_CLASSES
                    
                    if is_threat:
                        color = (0, 0, 255) # Red
                        label_text = f"THREAT: {label.upper()} {int(conf*100)}%"
                        
                        weapon_msg = {
                            "source": "VISUAL",
                            "content": label,
                            "confidence": conf,
                            "box": [int(x) for x in coords],
                            "timestamp": time.time()
                        }
                        self.bus.publish("vision_events", weapon_msg)
                    else:
                        color = (200, 200, 200) # White
                        label_text = f"{label} {int(conf*100)}%"

                    cv2.rectangle(frame, (coords[0], coords[1]), (coords[2], coords[3]), color, 2)
                    cv2.putText(frame, label_text, (coords[0], coords[1]-10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

            cv2.imshow('SENTINEL: Universal Vision (Level-9)', frame)
            if cv2.waitKey(1) & 0xFF == ord('q'): break
        
        self.cap.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    agent = VisualAgent(source=0) 
    agent.run()
