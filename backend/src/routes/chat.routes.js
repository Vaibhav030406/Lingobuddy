import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getStreamToken, startRecording, stopRecording, getCallRecordings, deleteCallRecording, renameRecording } from '../controllers/chat.controller.js';

const router = express.Router();

router.get("/token", protectRoute, getStreamToken);
router.post("/call/:callId/start-recording", protectRoute, startRecording);
router.post("/call/:callId/stop-recording", protectRoute, stopRecording);
router.get("/call/:callId/recordings", protectRoute, getCallRecordings);
router.delete("/call/:callId/recordings/:recordingId", protectRoute, deleteCallRecording);
router.put("/call/:callId/recordings/:recordingId/rename", protectRoute, renameRecording);

export default router;