import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCallRecordings, deleteCallRecording } from "../lib/api";
import { useThemeSelector } from "../hooks/useThemeSelector";
import {
  VideoIcon,
  Trash2Icon,
  DownloadIcon,
  RefreshCwIcon,
  AlertCircle,
  PlayIcon
} from "lucide-react";
import toast from "react-hot-toast";

const RecordingsPage = () => {
  const { id: callId } = useParams();
  const navigate = useNavigate();
  const { theme } = useThemeSelector();

  const {
    data: recordingsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["callRecordings", callId],
    queryFn: () => fetchCallRecordings(callId),
    enabled: !!callId,
  });

  const handleDelete = async (recording) => {
    if (window.confirm("Are you sure you want to delete this recording?")) {
      try {
        // Extract session and filename from the recording object
        // These properties might vary based on the actual response structure from Stream
        const session = recording.session_id || recording.session;
        const filename = recording.filename || recording.name || recording.url?.split('/').pop();
        
        if (!session || !filename) {
          toast.error("Unable to delete recording: missing session or filename information");
          console.error("Recording object missing required fields:", recording);
          return;
        }

        await deleteCallRecording({ 
          callId, 
          recordingId: recording.id,
          session,
          filename
        });
        
        toast.success("Recording deleted successfully!");
        refetch(); // Refresh the list
      } catch (err) {
        toast.error("Failed to delete recording.");
        console.error("Error deleting recording:", err);
      }
    }
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
          <p className="text-sm opacity-70">
            Recordings for Call ID: {callId}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-600 text-center animate-shake flex items-center gap-2">
            <AlertCircle className="size-5" />
            <p>Error loading recordings: {error.message}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="relative">
              <span className="loading loading-spinner loading-lg text-[var(--primary)]" />
            </div>
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
            <button
              onClick={() => navigate(`/call/${callId}`)}
              className="mt-4 btn btn-primary"
            >
              Go to Call
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => refetch()}
                className="btn btn-ghost"
              >
                <RefreshCwIcon className="size-4 mr-2" />
                Refresh
              </button>
            </div>
            {recordings.map((recording, index) => (
              <div
                key={recording.id}
                className="card bg-[var(--background)] border border-[var(--primary)]/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01]"
              >
                <div className="card-body p-6 flex-row items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <VideoIcon className="size-8 text-[var(--primary)] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-lg truncate">
                        Recording {index + 1}
                      </p>
                      <p className="text-sm opacity-70 mt-1">
                        Recorded on: {new Date(recording.created_at || recording.start_time).toLocaleDateString()}
                      </p>
                      <p className="text-xs opacity-50 mt-1">
                        Session: {recording.session_id || recording.session || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a
                      href={recording.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-primary tooltip"
                      data-tip="Play Recording"
                    >
                      <PlayIcon className="size-4" />
                    </a>
                    <a
                      href={recording.url}
                      download
                      className="btn btn-outline btn-success tooltip"
                      data-tip="Download"
                    >
                      <DownloadIcon className="size-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(recording)}
                      className="btn btn-outline btn-error tooltip"
                      data-tip="Delete Recording"
                    >
                      <Trash2Icon className="size-4" />
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