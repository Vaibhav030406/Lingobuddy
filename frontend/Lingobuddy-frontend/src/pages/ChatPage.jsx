import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

// ✅ Inline loading component
const InlineChatLoader = () => {
  return (
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
};

// ✅ Inline call button component
const InlineCallButton = ({ handleVideoCall }) => {
  return (
    <div className="absolute top-3 right-3 z-10">
      <button
        onClick={handleVideoCall}
        className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow-md transition"
        title="Start Video Call"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="size-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 6h11a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z"
          />
        </svg>
      </button>
    </div>
  );
};

const ChatPage = () => {
  const { id: targetUserId } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const initChat = async () => {
      if (!STREAM_API_KEY) {
        setError("Missing Stream API Key. Please contact support.");
        setLoading(false);
        return;
      }

      try {
        console.log("Initializing stream chat client...");

        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePicture,
          },
          tokenData.token
        );

        const channelId = [authUser._id, targetUserId].sort().join("-");
        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();

        setChatClient(client);
        setChannel(currChannel);
      } catch (err) {
        console.error("Error initializing chat:", err);
        setError("Could not connect to chat. Please try again.");
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (tokenData?.token && authUser && targetUserId) {
      initChat();
    }
  }, [tokenData, authUser, targetUserId]);

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
        <button className="btn btn-primary mt-4" onClick={() => window.location.reload()}>
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
            <InlineCallButton handleVideoCall={handleVideoCall} />
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
