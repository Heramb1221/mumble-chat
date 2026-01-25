import { UserButton } from "@clerk/clerk-react";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useSocketStore } from "../lib/socket";
import { useSocketConnection } from "../hooks/useSocketConnection";
import { SparklesIcon, MessageSquareIcon, PlusIcon } from "lucide-react";

import { useChats, useGetOrCreateChat } from "../hooks/useChats";
import { useMessages } from "../hooks/useMessages";
import { ChatListItem } from "../components/ChatListItem";
import { ChatHeader } from "../components/ChatHeader";
import { MessageBubble } from "../components/MessageBubble";
import { ChatInput } from "../components/ChatInput";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { NewChatModal } from "../components/NewChatModel";

function ChatPage() {
  const { data: currentUser } = useCurrentUser();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeChatId = searchParams.get("chat");

  const [messageInput, setMessageInput] = useState("");
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef(null);

  const { socket, setTyping, sendMessage } = useSocketStore();
  useSocketConnection();

  const { data: chats = [], isLoading: chatsLoading } = useChats();
  const { data: messages = [], isLoading: messagesLoading } =
    useMessages(activeChatId);

  const startChatMutation = useGetOrCreateChat();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChatId, messages]);

  const handleStartChat = (participantId) => {
    startChatMutation.mutate(participantId, {
      onSuccess: (chat) => setSearchParams({ chat: chat._id }),
    });
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChatId || !socket || !currentUser) return;

    sendMessage(activeChatId, messageInput.trim(), currentUser);
    setMessageInput("");
    setTyping(activeChatId, false);
  };

  const handleTyping = (e) => {
    setMessageInput(e.target.value);
    if (!activeChatId) return;

    setTyping(activeChatId, true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(
      () => setTyping(activeChatId, false),
      2000
    );
  };

  const activeChat = chats.find((c) => c._id === activeChatId);

  return (
    <div className="h-screen bg-[#121417] text-white flex">
      {/* Sidebar */}
      <div className="w-80 border-r border-white/10 flex flex-col bg-[#1A1D22]">
        {/* HEADER */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <Link to="/chat" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4FD1C5] to-[#2FA89D] flex items-center justify-center">
                <SparklesIcon className="w-4 h-4 text-[#0B0D10]" />
              </div>
              <span className="font-bold">Whisper</span>
            </Link>
            <UserButton />
          </div>

          <button
            onClick={() => setIsNewChatModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5
              rounded-xl bg-gradient-to-r from-[#4FD1C5] to-[#2FA89D]
              text-[#0B0D10] font-semibold hover:opacity-90 transition"
          >
            <PlusIcon className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto">
          {chatsLoading && (
            <div className="flex items-center justify-center py-8">
              <span className="loading loading-spinner loading-sm text-[#4FD1C5]" />
            </div>
          )}

          {chats.length === 0 && !chatsLoading && <NoConversationsUI />}

          <div className="flex flex-col gap-1">
            {chats.map((chat) => (
              <ChatListItem
                key={chat._id}
                chat={chat}
                isActive={activeChatId === chat._id}
                onClick={() => setSearchParams({ chat: chat._id })}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col bg-[#121417]">
        {activeChatId && activeChat ? (
          <>
            <ChatHeader
              participant={activeChat.participant}
              chatId={activeChatId}
            />

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messagesLoading && (
                <div className="flex items-center justify-center h-full">
                  <span className="loading loading-spinner loading-md text-[#4FD1C5]" />
                </div>
              )}

              {messages.length === 0 && !messagesLoading && <NoMessagesUI />}

              {messages.map((msg) => (
                <MessageBubble
                  key={msg._id}
                  message={msg}
                  currentUser={currentUser}
                />
              ))}

              <div ref={messagesEndRef} />
            </div>

            <ChatInput
              value={messageInput}
              onChange={handleTyping}
              onSubmit={handleSend}
              disabled={!messageInput.trim()}
            />
          </>
        ) : (
          <NoChatSelectedUI />
        )}
      </div>

      <NewChatModal
        onStartChat={handleStartChat}
        isPending={startChatMutation.isPending}
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
      />
    </div>
  );
}

export default ChatPage;

/* ---------- EMPTY STATES ---------- */

function NoConversationsUI() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <MessageSquareIcon className="w-10 h-10 text-[#4FD1C5] mb-3" />
      <p className="text-white/70 text-sm">No conversations yet</p>
      <p className="text-white/50 text-xs mt-1">Start a new chat to begin</p>
    </div>
  );
}

function NoMessagesUI() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
        <MessageSquareIcon className="w-8 h-8 text-white/30" />
      </div>
      <p className="text-white/70">No messages yet</p>
      <p className="text-white/50 text-sm mt-1">
        Send a message to start the conversation
      </p>
    </div>
  );
}

function NoChatSelectedUI() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
      <div className="w-20 h-20 rounded-3xl
        bg-gradient-to-br from-[#4FD1C5]/20 to-[#2FA89D]/20
        flex items-center justify-center mb-6">
        <MessageSquareIcon className="w-10 h-10 text-[#7EE6DC]" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Welcome to Whisper</h2>
      <p className="text-white/70 max-w-sm">
        Select a conversation from the sidebar or start a new chat to begin messaging
      </p>
    </div>
  );
}
