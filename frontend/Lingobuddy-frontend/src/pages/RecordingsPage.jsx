import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchCallRecordings,
  deleteCallRecording,
  renameCallRecording,
} from "../lib/api";
import { useThemeSelector } from "../hooks/useThemeSelector";
import {
  VideoIcon,
  Trash2Icon,
  DownloadIcon,
  RefreshCwIcon,
  AlertCircle,
  PlayIcon,
  Edit2,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";
import moment from "moment";

const RecordingsPage = () => {
  const { id: callId } = useParams();
  const navigate = useNavigate();
  const { theme } = useThemeSelector();
  const queryClient = useQueryClient();
  const [editingRecordingId, setEditingRecordingId] = useState(null);
  const [newRecordingName, setNewRecordingName] = useState("");

  const {
    data: recordingsData,
    isLoading: isLoadingRecordings,
    error: recordingsError,
    refetch: refetchRecordings,
  } = useQuery({
    queryKey: ["callRecordings", callId],
    queryFn: () => fetchCallRecordings(callId),
    enabled: !!callId,
  });

  const { mutate: renameMutation, isPending: isRenaming } = useMutation({
    mutationFn: renameCallRecording,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callRecordings", callId] });
      toast.success("Recording renamed successfully!");
      setEditingRecordingId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to rename recording.");
    },
  });

  const handleDelete = async (recording) => {
    if (window.confirm("Are you sure you want to delete this recording?")) {
      try {
        const session = recording.session_id || recording.session;
        const filename = recording.filename || recording.url?.split("/").pop();

        if (!session || !filename) {
          toast.error(
            "Unable to delete recording: missing session or filename information"
          );
          console.error("Recording object missing required fields:", recording);
          return;
        }

        await deleteCallRecording({
          callId,
          recordingId: recording.dbId, // ✅ use dbId for backend lookup
          session: recording.session_id,
          filename: recording.streamFilename, // ✅ original filename for Stream API
        });

        toast.success("Recording deleted successfully!");
        refetchRecordings();
      } catch (err) {
        toast.error("Failed to delete recording.");
        console.error("Error deleting recording:", err);
      }
    }
  };

  const handleRename = (recording) => {
    setEditingRecordingId(recording.recordingId);
    setNewRecordingName(recording.filename);
  };

  const handleSaveRename = (recordingId) => {
    if (newRecordingName.trim() === "") {
      toast.error("Recording name cannot be empty.");
      return;
    }
    renameMutation({
      callId,
      recordingId,
      newName: newRecordingName.trim(),
    });
  };

  const recordings = recordingsData?.recordings || [];



  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] transition-all duration-500">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <VideoIcon className="size-8 text-[var(--primary)]" />
            <h1 className="text-3xl font-bold text-[var(--text)]">
              Call Recordings
            </h1>
          </div>
          <p className="text-sm opacity-70"> Private Room for recordings between you and your friend </p>
        </div>

        {recordingsError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-600 text-center animate-shake flex items-center gap-2">
            <AlertCircle className="size-5" />
            <p>Error loading recordings: {recordingsError.message}</p>
          </div>
        )}

        {isLoadingRecordings ? (
          <div className="flex justify-center py-4">
            <span className="loading loading-spinner loading-lg text-[var(--primary)]" />
          </div>
        ) : recordings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <VideoIcon className="size-16 text-[var(--text)]/30 mb-4" />
            <h3 className="text-xl font-bold text-[var(--text)] mb-2">
              No Recordings Found
            </h3>
            <p className="text-[var(--text)]/70">
              There are no recordings available for this call yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => refetchRecordings()}
                className="btn btn-ghost"
              >
                <RefreshCwIcon className="size-4 mr-2" />
                Refresh
              </button>
            </div>
            {recordings.map((recording, index) => (
              <div
                key={recording.recordingId}
                className="card bg-[var(--background)] border border-[var(--primary)]/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01]"
              >
                <div className="card-body p-6 flex-row items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <VideoIcon className="size-8 text-[var(--primary)] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      {editingRecordingId === recording.recordingId ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newRecordingName}
                            onChange={(e) =>
                              setNewRecordingName(e.target.value)
                            }
                            className="input input-sm flex-grow bg-[var(--background)] border border-[var(--primary)]/30 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] rounded-lg"
                            placeholder="Enter new name"
                            disabled={isRenaming}
                          />
                          <button
                            onClick={() =>
                              handleSaveRename(recording.recordingId)
                            }
                            className="btn btn-success btn-sm"
                            disabled={isRenaming}
                          >
                            <CheckCircle className="size-4" />
                          </button>
                        </div>
                      ) : (
                        <p className="font-semibold text-lg truncate flex items-center gap-2">
                          <span>
                            {recording.filename || `Recording ${index + 1}`}
                          </span>
                          <button
                            onClick={() => handleRename(recording)}
                            className="btn btn-ghost btn-sm p-0 h-auto min-h-0 text-[var(--primary)]/70 hover:text-[var(--primary)]"
                          >
                            <Edit2 className="size-4" />
                          </button>
                        </p>
                      )}
                      <p className="text-sm opacity-70 mt-1">
                        Recorded on:{" "}
                        {moment(recording.createdAt).format(
                          "MMMM Do YYYY, h:mm a"
                        )}
                      </p>
                      <p className="text-xs opacity-50 mt-1">
                        Session:{" "}
                        {recording.session_id || recording.session || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <a
                      href={recording.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl border border-[var(--primary)]/40 text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all duration-200 tooltip"
                      data-tip="Play Recording"
                    >
                      <PlayIcon className="size-5" />
                    </a>

                    <a
                      href={recording.url}
                      download={recording.filename}
                      className="p-2 rounded-xl border border-green-500/40 text-green-500 hover:bg-green-500/10 transition-all duration-200 tooltip"
                      data-tip="Download"
                    >
                      <DownloadIcon className="size-5" />
                    </a>

                    <button
                      onClick={() => handleDelete(recording)}
                      className="p-2 rounded-xl border border-red-500/40 text-red-500 hover:bg-red-500/10 transition-all duration-200 tooltip"
                      data-tip="Delete Recording"
                    >
                      <Trash2Icon className="size-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordingsPage;
