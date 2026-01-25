import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import { ArrowRightIcon, LucideMessageCircleX, MessageCircle, MessageCircleDashedIcon, MessageCircleMore, MessageCirclePlusIcon, MessageCircleReplyIcon, SparklesIcon } from "lucide-react";

function HomePage() {
  return (
    <div className="h-screen bg-[#121417] text-white flex">
      {/* LEFT SIDE */}
      <div className="flex flex-1 flex-col p-8 lg:p-12 relative overflow-hidden">
        {/* NAVBAR */}
        <nav className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-gradient-to-br from-[#4FD1C5] to-[#2FA89D]
              flex items-center justify-center shadow-lg shadow-[#4FD1C5]/20">
              <MessageCircleMore className="size-5 text-[#0B0D10]" />
            </div>
            <span className="text-xl font-bold">Mumble</span>
          </div>

          <div className="flex items-center gap-2">
            <SignInButton mode="modal">
              <button className="px-5 py-2.5 text-sm font-medium text-white/60 hover:text-white transition">
                Sign in
              </button>
            </SignInButton>

            <SignUpButton mode="modal">
              <button className="btn gap-2 bg-gradient-to-r from-[#4FD1C5] to-[#2FA89D]
                text-sm font-semibold rounded-full hover:opacity-90
                shadow-lg shadow-[#4FD1C5]/25 border-none text-[#0B0D10]">
                Get Started
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </SignUpButton>
          </div>
        </nav>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col justify-center max-w-xl relative z-10">
          {/* Tag */}
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full
              bg-[#4FD1C5]/10 border border-[#4FD1C5]/20 text-[#7EE6DC]
              text-xs font-mono uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4FD1C5] animate-pulse" />
              Now Available
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight font-mono">
            Messaging for
            <br />
            <span className="bg-gradient-to-r from-[#7EE6DC] via-[#4FD1C5] to-[#2FA89D]
              bg-clip-text text-transparent">
              everyone
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 text-lg text-white/70 leading-relaxed max-w-md">
            Secure, blazing-fast conversations with real-time presence and instant delivery.
            Connect with anyone, anywhere.
          </p>

          {/* CTA */}
          <div className="mt-10 flex items-center gap-4">
            <SignUpButton mode="modal">
              <button className="group flex items-center gap-3 px-8 py-4
                bg-[#1A1D22] text-white font-semibold rounded-2xl
                hover:bg-[#23262D] transition">
                Start chatting
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </SignUpButton>

            <SignInButton mode="modal">
              <button className="px-8 py-4 text-white/60 font-semibold hover:text-white transition">
                I have an account
              </button>
            </SignInButton>
          </div>

          {/* Avatars */}
          <div className="mt-8 flex items-center gap-4">
            <div className="avatar-group -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="avatar">
                  <div className="w-10 rounded-full border-2 border-[#121417]">
                    <img
                      src={`https://i.pravatar.cc/100?img=${i + 10}`}
                      alt="User avatar"
                    />
                  </div>
                </div>
              ))}
              <div className="avatar avatar-placeholder">
                <div className="w-10 rounded-full border-2 border-[#121417]
                  bg-[#23262D] text-white">
                  <span className="text-xs font-mono">+5k</span>
                </div>
              </div>
            </div>
            <span className="text-sm text-white/70">
              Join <span className="font-mono text-white/80">10,000+</span> happy users
            </span>
          </div>

          {/* STATS */}
          <div className="mt-12 flex items-center gap-10">
            {[
              { value: "10K+", label: "Users" },
              { value: "99.9%", label: "Uptime" },
              { value: "<50ms", label: "Latency" },
            ].map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-10">
                <div>
                  <div className="text-2xl font-bold font-mono">{stat.value}</div>
                  <div className="text-xs text-white/60 mt-1 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
                {i < 2 && <div className="w-px h-10 bg-white/10" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="hidden lg:flex flex-1 relative bg-[#1A1D22]
        items-center justify-center overflow-hidden">
        {/* Grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            w-[500px] h-[500px]
            bg-gradient-to-r from-[#4FD1C5]/20 to-[#2FA89D]/20
            rounded-full blur-[120px]"
        />

        {/* Card */}
        <div className="relative z-10">
          <div className="absolute -inset-px rounded-3xl
            bg-gradient-to-b from-white/15 to-white/5 p-px">
            <div className="w-full h-full rounded-3xl bg-[#1A1D22]" />
          </div>

          <div className="relative p-6 rounded-3xl
            border border-white/10
            bg-[#1A1D22]/80 backdrop-blur-xl shadow-2xl">
            <img
              src="/auth.png"
              alt="Chat illustration"
              className="w-80 xl:w-96 rounded-2xl"
            />

            <div className="absolute -top-4 -right-4 px-4 py-2
              bg-[#4FD1C5]/20 border border-[#4FD1C5]/30
              rounded-full text-[#7EE6DC] text-sm font-medium backdrop-blur-sm">
              ● 3 online
            </div>

            <div className="absolute -bottom-4 -left-4 px-4 py-2.5
              bg-[#23262D]/60 border border-white/10
              rounded-2xl backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full
                    bg-gradient-to-br from-[#7EE6DC] to-[#4FD1C5]" />
                  <div className="w-6 h-6 rounded-full
                    bg-gradient-to-br from-[#4FD1C5] to-[#2FA89D]" />
                </div>
                <span className="text-sm text-white/80">typing...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
