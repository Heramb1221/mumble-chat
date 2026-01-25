import { SendIcon } from "lucide-react";

export function ChatInput({ value, onChange, onSubmit, disabled }) {
  return (
    <form
      onSubmit={onSubmit}
      className="p-4 border-t border-white/10 bg-[#121417]"
    >
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder="Type a message..."
          className="
            flex-1 rounded-xl px-4 py-3
            bg-[#23262D]
            border border-white/10
            text-white
            placeholder:text-white/50
            focus:outline-none
            focus:ring-2 focus:ring-[#4FD1C5]/40
          "
        />

        <button
          type="submit"
          disabled={disabled}
          className="
            rounded-xl px-4 py-3
            bg-gradient-to-r from-[#4FD1C5] to-[#2FA89D]
            text-[#0B0D10]
            hover:opacity-90
            transition
            disabled:opacity-40
            disabled:cursor-not-allowed
          "
        >
          <SendIcon className="size-5" />
        </button>
      </div>
    </form>
  );
}
