import { generateStreamToken } from "../lib/stream.js"
import { StreamClient } from '@stream-io/node-sdk';
import dotenv from "dotenv";
import Recording from '../models/Recordings.js';
import moment from "moment";

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

        const call = streamClient.video.call(callType, callId);
        await call.startRecording(); 

        res.status(200).json({ success: true, message: "Recording started" });
    } catch (error) {
        console.error("Error starting recording:", error);
        
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

        const call = streamClient.video.call(callType, callId);
        await call.stopRecording();

        res.status(200).json({ success: true, message: "Recording stopped" });
    } catch (error) {
        console.error("Error stopping recording:", error);
        
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
    const callType = "default";

    if (!callId) {
      return res.status(400).json({ message: "Call ID is required" });
    }

    const call = streamClient.video.call(callType, callId);
    const streamResponse = await call.listRecordings();
    const streamRecordings = streamResponse.recordings || [];

    // Get DB overrides
    const dbRecs = await Recording.find({ callId, owner: req.user._id });

    const mergedRecordings = await Promise.all(
      streamRecordings.map(async (streamRec) => {
        // ✅ Construct a stable recordingId
        const recId = `${streamRec.session_id}_${streamRec.filename}`;

        let localRec = dbRecs.find((dbRec) => dbRec.recordingId === recId);

        // If not found in DB, create it
        if (!localRec) {
          localRec = await Recording.create({
            callId,
            recordingId: recId,
            filename: `Recording_${moment(streamRec.created_at).format("YYYY-MM-DD_HH-mm-ss")}.mp4`,
            url: streamRec.url,
            owner: req.user._id,
          });
        }

        return {
  dbId: localRec._id,                 // use this for rename/delete in DB
  recordingId: recId,                 // our generated recordingId
  filename: localRec.filename,        // always DB override
  url: streamRec.url,
  session_id: streamRec.session_id,
  streamFilename: streamRec.filename, // ✅ keep original filename for delete
  createdAt: localRec.createdAt || streamRec.created_at,
};
      })
    );

    res.status(200).json({
      success: true,
      recordings: mergedRecordings,
    });
  } catch (error) {
    console.error("Error fetching call recordings:", error);
    res.status(500).json({ message: error.message });
  }
};



export const deleteCallRecording = async (req, res) => {
  try {
    const { recordingId } = req.params; // now Mongo _id
    const { session, filename } = req.body;

    if (!session || !filename) {
      return res.status(400).json({ message: "Session and filename are required" });
    }

    // 🔑 use _id here, not recordingId string
    const recording = await Recording.findOneAndDelete({ _id: recordingId, owner: req.user._id });

    if (!recording) {
      return res.status(404).json({ message: "Recording not found" });
    }

    const call = streamClient.video.call("default", recording.callId);
    await call.deleteRecording({ session, filename });

    res.status(200).json({ success: true, message: "Recording deleted successfully" });
  } catch (error) {
    console.error("Error deleting recording:", error);
    res.status(500).json({ message: error.message });
  }
};



export const renameRecording = async (req, res) => {
  try {
    const { recordingId } = req.params;
    const { newName } = req.body;

    if (!newName || newName.trim() === "") {
        return res.status(400).json({ message: "New name is required." });
    }

    const updatedRecording = await Recording.findOneAndUpdate(
        { recordingId, owner: req.user._id },
        { filename: newName },
        { new: true }
    );
    
    if (!updatedRecording) {
        return res.status(404).json({ message: "Recording not found." });
    }

    res.status(200).json({ success: true, message: "Recording renamed successfully", recording: updatedRecording });
  } catch (error) {
    console.error("Error renaming recording:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};