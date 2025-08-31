import { generateStreamToken } from "../lib/stream.js";
import { StreamClient } from "@stream-io/node-sdk";
import dotenv from "dotenv";
import Recording from "../models/Recordings.js";
import moment from "moment";
import mongoose from "mongoose";

dotenv.config();

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("❌ Stream API key or secret is missing in environment variables.");
  process.exit(1);
}

const streamClient = new StreamClient(apiKey, apiSecret);

// ===============================
// Token
// ===============================
export const getStreamToken = (req, res) => {
  try {
    const token = generateStreamToken(req.user.id);
    res.status(200).json({ token });
  } catch (error) {
    console.error("Error generating stream token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ===============================
// Start Recording
// ===============================
export const startRecording = async (req, res) => {
  try {
    const { callId } = req.params;
    const callType = "default";

    if (!callId) return res.status(400).json({ message: "Call ID is required" });

    const call = streamClient.video.call(callType, callId);
    await call.startRecording();

    res.status(200).json({ success: true, message: "Recording started" });
  } catch (error) {
    console.error("Error starting recording:", error);

    if (error.message.includes("permission") || error.status === 403) {
      return res.status(403).json({
        message: "Insufficient permissions to start recording. Check call type permissions.",
        error: "PERMISSION_DENIED",
      });
    }

    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Stop Recording
// ===============================
export const stopRecording = async (req, res) => {
  try {
    const { callId } = req.params;
    const callType = "default";

    if (!callId) return res.status(400).json({ message: "Call ID is required" });

    const call = streamClient.video.call(callType, callId);
    await call.stopRecording();

    res.status(200).json({ success: true, message: "Recording stopped" });
  } catch (error) {
    console.error("Error stopping recording:", error);

    if (error.message.includes("permission") || error.status === 403) {
      return res.status(403).json({
        message: "Insufficient permissions to stop recording. Check call type permissions.",
        error: "PERMISSION_DENIED",
      });
    }

    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Get Call Recordings
// ===============================
export const getCallRecordings = async (req, res) => {
  try {
    const { callId } = req.params;
    const callType = "default";

    if (!callId) return res.status(400).json({ message: "Call ID is required" });

    const call = streamClient.video.call(callType, callId);

    let streamResponse;
    try {
      streamResponse = await call.listRecordings();
    } catch (err) {
      console.error("Stream API error while listing recordings:", err.message);
      return res.status(200).json({ success: true, recordings: [] });
    }

    const streamRecordings = streamResponse.recordings || [];
    const dbRecs = await Recording.find({ callId, owner: req.user._id });

    const mergedRecordings = await Promise.all(
      streamRecordings.map(async (streamRec) => {
        const recId = `${streamRec.session_id}_${streamRec.filename}`;

        // Check if recording already exists
        let localRec = dbRecs.find((dbRec) => dbRec.recordingId === recId);

        if (!localRec) {
          // Start a MongoDB session for transaction
          const session = await mongoose.startSession();
          try {
            await session.withTransaction(async () => {
              // Double-check existence within transaction to avoid race condition
              const existingRec = await Recording.findOne({
                recordingId: recId,
                owner: req.user._id,
              }).session(session);

              if (!existingRec) {
                // Create new recording
                localRec = await Recording.create(
                  [
                    {
                      callId,
                      recordingId: recId,
                      filename: `Recording_${moment(streamRec.created_at).format(
                        "YYYY-MM-DD_HH-mm-ss"
                      )}.mp4`,
                      url: streamRec.url,
                      owner: req.user._id,
                    },
                  ],
                  { session }
                );
                localRec = localRec[0]; // Create returns an array
              } else {
                localRec = existingRec;
              }
            });
          } catch (error) {
            if (error.code === 11000) {
              // Handle duplicate key error by fetching the existing record
              localRec = await Recording.findOne({
                recordingId: recId,
                owner: req.user._id,
              });
              if (!localRec) {
                console.warn(`No record found for recordingId: ${recId} after duplicate key error`);
                return null; // Skip this recording
              }
            } else {
              console.error(`Transaction error for recordingId: ${recId}`, error);
              throw error; // Rethrow other errors
            }
          } finally {
            session.endSession();
          }
        }

        // Skip if localRec is still null
        if (!localRec) {
          console.warn(`Skipping null localRec for recordingId: ${recId}`);
          return null;
        }

        return {
          dbId: localRec._id,
          recordingId: recId,
          filename: localRec.filename,
          url: streamRec.url,
          session_id: streamRec.session_id,
          streamFilename: streamRec.filename,
          createdAt: localRec.createdAt || streamRec.created_at,
        };
      })
    );

    // Filter out null entries from mergedRecordings
    const validRecordings = mergedRecordings.filter((rec) => rec !== null);

    res.status(200).json({ success: true, recordings: validRecordings });
  } catch (error) {
    console.error("Error fetching call recordings:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Delete Recording
// ===============================
export const deleteCallRecording = async (req, res) => {
  try {
    const { recordingId } = req.params; // this is Mongo _id
    const { session, filename } = req.body;

    if (!session || !filename) {
      return res.status(400).json({ message: "Session and filename are required" });
    }

    const recording = await Recording.findOneAndDelete({
      _id: recordingId,
      owner: req.user._id,
    });

    if (!recording) return res.status(404).json({ message: "Recording not found" });

    const call = streamClient.video.call("default", recording.callId);
    await call.deleteRecording({ session, filename });

    res.status(200).json({ success: true, message: "Recording deleted successfully" });
  } catch (error) {
    console.error("Error deleting recording:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Rename Recording
// ===============================
export const renameRecording = async (req, res) => {
  try {
    const { recordingId } = req.params; // using recordingId (string), not Mongo _id
    const { newName } = req.body;

    if (!newName || newName.trim() === "") {
      return res.status(400).json({ message: "New name is required." });
    }

    const updatedRecording = await Recording.findOneAndUpdate(
      { recordingId, owner: req.user._id },
      { filename: newName.trim() },
      { new: true }
    );

    if (!updatedRecording) {
      return res.status(404).json({ message: "Recording not found." });
    }

    res.status(200).json({
      success: true,
      message: "Recording renamed successfully",
      recording: updatedRecording,
    });
  } catch (error) {
    console.error("Error renaming recording:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};