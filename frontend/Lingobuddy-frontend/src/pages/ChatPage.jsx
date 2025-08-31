import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import { VideoIcon, Disc } from "lucide-react";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

// Inline loading component
const InlineChatLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[80vh] gap-2 text-center">
    <svg
      className="animate-spin h-6 w-6 text-blue-500"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
    <div className="text-base text-[var(--text)]/80">Loading chat...</div>
  </div>
);

// Inline call and recordings buttons component
const InlineActionButtons = ({ handleVideoCall, callId }) => (
  <div className="absolute top-3 right-3 z-10 flex gap-2">
    <button
      onClick={handleVideoCall}
      className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow-md transition"
      title="Start Video Call"
    >
      <VideoIcon className="size-5" />
    </button>

    {callId && (
      <Link
        to={`/recordings/${callId}`}
        className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white p-2 rounded-full shadow-md transition"
        title="View Recordings"
      >
        <Disc className="size-5" />
      </Link>
    )}
  </div>
);

const ChatPage = () => {
  const { id: targetUserId } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { authUser } = useAuthUser();

  const {
    data: tokenData,
    error: tokenError,
    isError: isTokenError,
  } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  const callId =
    authUser && targetUserId
      ? [authUser._id, targetUserId].sort().join("-")
      : null;

  useEffect(() => {
    // Debug logs
    console.log("STREAM_API_KEY:", STREAM_API_KEY);
    console.log("authUser:", authUser);
    console.log("tokenData:", tokenData);
    console.log("targetUserId:", targetUserId);

    if (isTokenError) {
      console.error("Error fetching token:", tokenError);
      setError("Could not fetch chat token. Check backend logs.");
      setLoading(false);
      return;
    }

    const initChat = async () => {
      if (!STREAM_API_KEY) {
        setError("Missing Stream API Key. Please check your .env");
        setLoading(false);
        return;
      }

      try {
        console.log("Initializing Stream Chat client...");

        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePicture,
          },
          tokenData.token
        );

        const currChannel = client.channel("messaging", callId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();

        setChatClient(client);
        setChannel(currChannel);
      } catch (err) {
        console.error("Error initializing chat:", err);
        setError("Could not connect to chat. See console for details.");
        toast.error("Could not connect to chat.");
      } finally {
        setLoading(false);
      }
    };

    if (tokenData?.token && authUser && targetUserId) {
      initChat();
    }
  }, [tokenData, authUser, targetUserId, callId, isTokenError, tokenError]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;
      channel.sendMessage({
        text: `📞 I've started a video call. Join me here: ${callUrl}`,
      });
      toast.success("Video call link sent!");
      window.open(callUrl, "_blank");
    }
  };

  if (loading || !chatClient || !chatClient.user || !channel) {
    return <InlineChatLoader />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
        <div className="text-2xl font-bold text-red-500 mb-4">Chat Error</div>
        <div className="text-base text-[var(--text)]/80 mb-2">{error}</div>
        <button
          className="btn btn-primary mt-4"
          onClick={() => window.location.reload()}
        >
          Reload
        </button>
      </div>
    );
  }

  return (
    <div className="h-[93vh]">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative">
            <InlineActionButtons
              handleVideoCall={handleVideoCall}
              callId={callId}
            />
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;
