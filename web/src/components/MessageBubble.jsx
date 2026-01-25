import { formatTime } from "../lib/utils";

export function MessageBubble({ message, currentUser }) {
  const isMe = message.sender?._id === currentUser?._id;

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          max-w-md px-4 py-2.5 rounded-2xl
          ${isMe
            ? "bg-gradient-to-r from-[#4FD1C5] to-[#2FA89D] text-[#0B0D10]"
            : "bg-[#23262D] text-white"
          }
        `}
      >
        <p className="text-sm leading-relaxed">{message.text}</p>

        <p
          className={`text-xs mt-1 ${
            isMe ? "text-[#0B0D10]/70" : "text-white/50"
          }`}
        >
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
