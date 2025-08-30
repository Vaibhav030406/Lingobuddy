import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
  useCall,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";
import {
  startCallRecording,
  stopCallRecording,
} from "../lib/api";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { id: callId } = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const { authUser, isLoading } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const initCall = async () => {
      if (!tokenData.token || !authUser || !callId) return;

      try {
        console.log("Initializing Stream video client...");

        const user = {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePicture,
        };

        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        const callInstance = videoClient.call("default", callId);

        await callInstance.join({ create: true });

        console.log("Joined call successfully");

        setClient(videoClient);
        setCall(callInstance);
      } catch (error) {
        console.error("Error joining call:", error);
        toast.error("Could not join the call. Please try again.");
      } finally {
        setIsConnecting(false);
      }
    };

    if (tokenData?.token && authUser && callId) {
      initCall();
    }
  }, [tokenData, authUser, callId]);

  if (isLoading || isConnecting) return <PageLoader />;

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="relative w-full h-full">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex items-center justify-center w-full h-full text-[var(--text)]">
            <p>Could not initialize call. Please refresh or try again later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const call = useCall();
  const [isRecording, setIsRecording] = useState(false);
  const [isStartingRecording, setIsStartingRecording] = useState(false);

  const navigate = useNavigate();

  const handleStartRecording = useCallback(async () => {
    if (!call) return;
    setIsStartingRecording(true);
    try {
      await startCallRecording(call.id);
      toast.success("Recording started!");
    } catch (error) {
      console.error("Failed to start recording:", error);
      toast.error("Failed to start recording. Please try again.");
    } finally {
      setIsStartingRecording(false);
    }
  }, [call]);

  const handleStopRecording = useCallback(async () => {
    if (!call) return;
    try {
      await stopCallRecording(call.id);
      toast.success("Recording stopped.");
    } catch (error) {
      console.error("Failed to stop recording:", error);
      toast.error("Failed to stop recording. Please try again.");
    }
  }, [call]);

  useEffect(() => {
    if (!call) return;

    const recordingStartedHandler = () => {
      setIsRecording(true);
      toast.success("Recording in progress!");
    };

    const recordingStoppedHandler = () => {
      setIsRecording(false);
      toast("Recording has been saved.", { icon: '💾' });
    };

    // The event names may need to be confirmed with the latest Stream docs.
    call.on("call.recording_started", recordingStartedHandler);
    call.on("call.recording_stopped", recordingStoppedHandler);

    return () => {
      call.off("call.recording_started", recordingStartedHandler);
      call.off("call.recording_stopped", recordingStoppedHandler);
    };
  }, [call]);

  if (callingState === CallingState.LEFT) return navigate("/");

  return (
    <StreamTheme>
      <div className="relative h-full w-full">
        <SpeakerLayout />
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={isStartingRecording}
            className={`px-4 py-2 rounded-full font-bold text-white transition-colors duration-300 ${
              isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            } disabled:bg-gray-400`}
          >
            {isStartingRecording ? (
              <span className="flex items-center">
                <span className="loading loading-spinner loading-sm mr-2" />
                Starting...
              </span>
            ) : isRecording ? (
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-white mr-2 animate-ping" />
                Stop Recording
              </span>
            ) : (
              <span>Start Recording</span>
            )}
          </button>
        </div>
        <CallControls />
      </div>
    </StreamTheme>
  );
};

export default CallPage;
