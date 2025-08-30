import { generateStreamToken } from "../lib/stream.js"
import { StreamClient } from '@stream-io/node-sdk';
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

// Ensure Stream API credentials are set
if (!apiKey || !apiSecret) {
    console.error("Stream API key or secret is not defined in the environment variables.");
    process.exit(1);
}

const streamClient = new StreamClient(apiKey, apiSecret);

export const getStreamToken = (req, res) => {
    try {
        const token = generateStreamToken(req.user.id);
        res.status(200).json({ token });
    } catch (error) {
        console.error("Error generating stream token:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const startRecording = async (req, res) => {
    try {
        const { callId } = req.params;
        const callType = 'default';

        if (!callId) {
            return res.status(400).json({ message: "Call ID is required" });
        }

        // Correct way to get a call instance
        const call = streamClient.video.call(callType, callId);
        await call.startRecording();

        res.status(200).json({ success: true, message: "Recording started" });
    } catch (error) {
        console.error("Error starting recording:", error);
        
        // Handle specific permission errors
        if (error.message.includes('permission') || error.status === 403) {
            return res.status(403).json({ 
                message: "Insufficient permissions to start recording. Please check your call type permissions.",
                error: "PERMISSION_DENIED"
            });
        }
        
        res.status(500).json({ message: error.message });
    }
};

export const stopRecording = async (req, res) => {
    try {
        const { callId } = req.params;
        const callType = 'default';

        if (!callId) {
            return res.status(400).json({ message: "Call ID is required" });
        }

        // Correct way to get a call instance
        const call = streamClient.video.call(callType, callId);
        await call.stopRecording();

        res.status(200).json({ success: true, message: "Recording stopped" });
    } catch (error) {
        console.error("Error stopping recording:", error);
        
        // Handle specific permission errors
        if (error.message.includes('permission') || error.status === 403) {
            return res.status(403).json({ 
                message: "Insufficient permissions to stop recording. Please check your call type permissions.",
                error: "PERMISSION_DENIED"
            });
        }
        
        res.status(500).json({ message: error.message });
    }
};

export const getCallRecordings = async (req, res) => {
    try {
        const { callId } = req.params;
        const callType = 'default';

        if (!callId) {
            return res.status(400).json({ message: "Call ID is required" });
        }
        
        // Correct way to get a call instance and list recordings
        const call = streamClient.video.call(callType, callId);
        const response = await call.listRecordings();

        res.status(200).json({ 
            success: true, 
            recordings: response.recordings || []
        });
    } catch (error) {
        console.error("Error fetching call recordings:", error);
        
        // Handle specific permission errors
        if (error.message.includes('permission') || error.status === 403) {
            return res.status(403).json({ 
                message: "Insufficient permissions to list recordings. Please check your call type permissions.",
                error: "PERMISSION_DENIED"
            });
        }
        
        // Handle call not found errors
        if (error.status === 404) {
            return res.status(404).json({
                message: "Call not found or no recordings available",
                error: "CALL_NOT_FOUND"
            });
        }
        
        res.status(500).json({ message: error.message });
    }
};

export const deleteCallRecording = async (req, res) => {
    try {
        const { callId, recordingId } = req.params;
        const { session, filename } = req.body; // Get session and filename from request body
        const callType = 'default';

        if (!callId || !recordingId) {
            return res.status(400).json({ message: "Call ID and Recording ID are required" });
        }

        if (!session || !filename) {
            return res.status(400).json({ message: "Session and filename are required in request body" });
        }

        // Correct way to get a call instance and delete recording
        const call = streamClient.video.call(callType, callId);
        await call.deleteRecording({ session, filename });

        res.status(200).json({ success: true, message: "Recording deleted successfully" });
    } catch (error) {
        console.error("Error deleting recording:", error);
        res.status(500).json({ message: error.message });
    }
};