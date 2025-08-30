import { StreamTheme, SpeakerLayout, CallControls, useCallStateHooks, CallingState } from "@stream-io/video-react-sdk";
import { useNavigate } from "react-router";
import TranscriptionDisplay from "../hooks/TranscriptionDisplay.jsx";

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const navigate = useNavigate();

  // Redirect if the user leaves the call
  if (callingState === CallingState.LEFT) return navigate("/");

  return (
    <StreamTheme>
      <div className="flex flex-col h-full relative">
        <div className="flex-1 relative">
          <SpeakerLayout /> 
          <TranscriptionDisplay /> {/* Live captions + download */}
        </div>
        <div className="flex justify-end items-center p-4 bg-gray-900">
          <CallControls />
        </div>
      </div>
    </StreamTheme>
  );
};

export default CallContent;
