// backend/src/models/Recording.js
import mongoose from "mongoose";

const recordingSchema = new mongoose.Schema(
  {
    callId: {
      type: String,
      required: true,
    },
    recordingId: {
      type: String,
      required: true,
      unique: true,
    },
    filename: {
      type: String,
      required: true,
    },
    url: {
      type: String,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Recording = mongoose.model("Recording", recordingSchema);
export default Recording;