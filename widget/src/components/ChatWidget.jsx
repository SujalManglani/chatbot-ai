import {
  useState,
  useRef,
  useEffect
} from "react";

import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Send,
  Mic,
  Search,
  Volume2,
  VolumeX
} from "lucide-react";
import Deadpool3D from "./Deadpool3D";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState(1);
  const [speech, setSpeech] = useState("Maximum effort.");
  const [animation, setAnimation] = useState("walk");
  const [reactionVisible, setReactionVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [useSearch, setUseSearch] = useState(false);

  const [chatPosition, setChatPosition] = useState({
    x: window.innerWidth - 420,
    y: window.innerHeight - 640
  });

  const bottomRef = useRef(null);
  const deadpoolRef = useRef(null);
  const openRef = useRef(false);
  const mobileRef = useRef(false);
  const xRef = useRef(100);
  const dirRef = useRef(1);
  const animationTimeoutRef = useRef(null);
  const reactionTimeoutRef = useRef(null);
  const openingRef = useRef(false);
  const recognitionRef = useRef(null);
  const openCountRef = useRef(0);

  const API_URL = "https://chatbot-ai-gbqr.onrender.com";

  const [messages, setMessages] = useState([
    {
      bot: "Hey, Magnificent COCKSUCKER!"
    }
  ]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      mobileRef.current = mobile;

      if (mobile && deadpoolRef.current) {
        xRef.current = 20;
        deadpoolRef.current.style.transform =
          "translate3d(20px, 0, 0)";
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Try Chrome.");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setSpeech("Listening...");
      setReactionVisible(true);
      setAnimation("idle");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
      setSpeech("Got it. Hit send, MOTHER FUCKER.");
      setReactionVisible(true);
    };

    recognition.onerror = (event) => {
      console.error("VOICE ERROR:", event.error);
      setSpeech("Mic betrayed us. Classic.");
      setReactionVisible(true);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);

      setTimeout(() => {
        if (!openRef.current) {
          setReactionVisible(false);
        }
      }, 1800);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const speakReply = (text) => {
    if (voiceMuted) return;
    if (!("speechSynthesis" in window)) return;
    if (!text || typeof text !== "string") return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = "en-US";
    utterance.rate = 1.08;
    utterance.pitch = 0.85;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  };

  const moveDeadpoolOutsideChat = (chatX) => {
    if (!deadpoolRef.current) return;

    const petWidth = mobileRef.current ? 220 : 280;

    let petX;

    if (mobileRef.current) {
      petX = 20;
    } else if (chatX > window.innerWidth / 2) {
      petX = chatX - petWidth - 20;
    } else {
      petX = chatX + 400;
    }

    petX = Math.max(
      20,
      Math.min(petX, window.innerWidth - petWidth - 20)
    );

    xRef.current = petX;

    deadpoolRef.current.style.transform =
      `translate3d(${petX}px, 0, 0)`;
  };

  const playTemporaryAnimation = (
    name,
    time = 2200,
    after = "walk"
  ) => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    setAnimation(name);

    animationTimeoutRef.current = setTimeout(() => {
      setAnimation(after);
    }, time);
  };

  const showReaction = (
    name,
    text,
    time = 3000
  ) => {
    if (reactionTimeoutRef.current) {
      clearTimeout(reactionTimeoutRef.current);
    }

    setSpeech(text);
    setReactionVisible(true);

    playTemporaryAnimation(
      name,
      time,
      openRef.current ? "idle" : "walk"
    );

    reactionTimeoutRef.current = setTimeout(() => {
      setReactionVisible(false);
    }, time);
  };

  useEffect(() => {
    const quotes = [
      "Maximum effort.",
      "Need something?",
      "Don't tell Wolverine I'm helping.",
      "I'm basically a genius.",
      "Click me.",
      "I know things.",
      "This better be important."
    ];

    const interval = setInterval(() => {
      if (openRef.current) return;

      setSpeech(
        quotes[Math.floor(Math.random() * quotes.length)]
      );
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const danceQuotes = [
      "Maximum dance effort.",
      "Don't question it.",
      "This is tactical dancing.",
      "Wolverine can't do this.",
      "Watch these moves.",
      "I'm the main character."
    ];

    const interval = setInterval(() => {
      if (openRef.current) return;

      if (Math.random() > 0.6) {
        const quote =
          danceQuotes[
            Math.floor(Math.random() * danceQuotes.length)
          ];

        showReaction("dance", quote, 4200);
      }
    }, 16000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let frame;
    const speed = 0.35;

    const move = () => {
      if (
        !openRef.current &&
        !openingRef.current &&
        !mobileRef.current
      ) {
        xRef.current += speed * dirRef.current;

        if (xRef.current > window.innerWidth - 300) {
          xRef.current = window.innerWidth - 300;
          dirRef.current = -1;
          setDirection(-1);
        }

        if (xRef.current < 40) {
          xRef.current = 40;
          dirRef.current = 1;
          setDirection(1);
        }

        if (deadpoolRef.current) {
          deadpoolRef.current.style.transform =
            `translate3d(${xRef.current}px, 0, 0)`;
        }
      }

      frame = requestAnimationFrame(move);
    };

    frame = requestAnimationFrame(move);

    return () => cancelAnimationFrame(frame);
  }, []);

  const openChat = () => {
    if (openingRef.current) return;

    openingRef.current = true;

    let newChatPosition = chatPosition;

    if (!mobileRef.current && deadpoolRef.current) {
      const rect =
        deadpoolRef.current.getBoundingClientRect();

      newChatPosition = {
        x: Math.min(
          Math.max(rect.left - 40, 16),
          window.innerWidth - 396
        ),
        y: Math.min(
          Math.max(rect.top - 260, 16),
          window.innerHeight - 576
        )
      };

      setChatPosition(newChatPosition);
      moveDeadpoolOutsideChat(newChatPosition.x);
    }

    openCountRef.current += 1;

const openQuotes =
  openCountRef.current === 1
    ? [
        "Hey. Do you charge for BLOWJOBS?",
        "Let me help you to fix this shit, JACKASS.",
        "Welcome. Not you ."
      ]
    : [
        "What now?",
        "Please dont be same the fucker again.",
        "Back already? You are a disappointment after LGBTQ FUCKERS.",
        "WTF is wrong with you?.",
        "You Dumb Fucker, can't you do it yourself?"
      ];

setSpeech(
  openQuotes[Math.floor(Math.random() * openQuotes.length)]
);
    setReactionVisible(true);
    setAnimation("wave");

    setTimeout(() => {
      setOpen(true);
      setReactionVisible(false);
      setAnimation("idle");
      openingRef.current = false;
    }, 1800);
  };

  const closeChat = () => {
    setOpen(false);
    setReactionVisible(false);
    setSpeech("Back to patrol.");
    setAnimation("walk");

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const toggleChat = () => {
    if (open) {
      closeChat();
    } else {
      openChat();
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;

    setMessages((prev) => [
      ...prev,
      {
        user: userMessage
      }
    ]);

    setMessage("");
    setSpeech(useSearch ? "Searching the chaos..." : "Thinking...");
    setAnimation("idle");

    try {
      setLoading(true);

      const res = await axios.post(
        `${API_URL}/chat`,
        {
          message: userMessage,
          useSearch: useSearch
        }
      );

      const botReply =
        res?.data?.reply || "No reply came back. Dramatic silence.";

      setMessages((prev) => [
        ...prev,
        {
          bot: botReply
        }
      ]);

      speakReply(botReply);

      showReaction(
        "clap",
        useSearch ? "Found it. Obviously." : "Boom. Nailed it.",
        3600
      );
    } catch (err) {
      console.error(err);

      setMessages((prev) => [
        ...prev,
        {
          bot: "⚠️ Connection error."
        }
      ]);

      speakReply("Connection error. Something broke. Classic.");

      showReaction(
        "laugh",
        "Something broke. Classic.",
        3400
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
  className="min-h-screen overflow-hidden select-none bg-black"
  onContextMenu={(e) => e.preventDefault()}
>
      <div className="fixed inset-0 bg-gradient-to-br from-black via-zinc-900 to-red-950" />

      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.18),transparent_70%)]" />

      <div
        ref={deadpoolRef}
        className={`
          fixed
          bottom-0
          left-0
          will-change-transform
          z-[9998]
        `}
      >
        <div
          className="
            relative
            w-[220px]
            h-[220px]
            sm:w-[280px]
            sm:h-[280px]
          "
        >
          <button
            onClick={toggleChat}
            className="
              absolute
              inset-0
              bg-transparent
              border-none
              cursor-pointer
              z-20
            "
            aria-label="Open chat"
          />

          <div
            className="
              absolute
              bottom-4
              sm:bottom-6
              left-1/2
              -translate-x-1/2
              w-24
              sm:w-32
              h-4
              sm:h-5
              bg-black/40
              rounded-full
              blur-xl
              z-0
            "
          />

          <Deadpool3D
            direction={direction}
            hidden={isMobile && open && !reactionVisible}
            animation={animation}
          />

          <AnimatePresence>
            {(!open || reactionVisible) && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 10
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                exit={{
                  opacity: 0
                }}
className="
  absolute
  -top-4
  sm:-top-3
  left-1/2
  -translate-x-1/2
  bg-zinc-950
  text-white
  border
  border-red-500/30
  px-4
  py-2
  rounded-2xl
  text-xs
  sm:text-sm
  font-bold
  shadow-[0_0_25px_rgba(239,68,68,0.35)]
  whitespace-nowrap
  z-30
"
              >
                {speech}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            style={
              isMobile
                ? {}
                : {
                    left: `${chatPosition.x}px`,
                    top: `${chatPosition.y}px`
                  }
            }
            initial={{
              opacity: 0,
              scale: isMobile ? 1 : 0.94,
              y: isMobile ? 80 : 40
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              scale: isMobile ? 1 : 0.94,
              y: isMobile ? 80 : 40
            }}
            transition={{
              duration: 0.25
            }}
            className="
              fixed
              left-0
              bottom-0
              w-full
              h-[75vh]
              rounded-t-3xl
              sm:left-auto
              sm:bottom-auto
              sm:w-[380px]
              sm:h-[560px]
              sm:rounded-3xl
              max-w-[100vw]
              sm:max-w-[calc(100vw-32px)]
              max-h-[85vh]
              sm:max-h-[calc(100vh-32px)]
              overflow-hidden
              border
              border-red-500/20
              bg-black/85
              backdrop-blur-2xl
              shadow-[0_0_60px_rgba(255,0,0,0.2)]
              flex
              flex-col
              z-50
            "
          >
            <div className="p-4 border-b border-red-500/10 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black">
                     
                  </span>

                  {useSearch && (
                    <span className="ml-2 text-xs font-normal text-blue-200">
                      Live Search ON
                    </span>
                  )}
                </div>
                <div
                  className="
                    text-[10px]
                    uppercase
                    tracking-widest
                    bg-red-700/30
                    text-red-200
                    px-2
                    py-1
                    rounded-full
                    inline-block
                    mt-1
                  "
                >
                  Maximum Effort
                </div>
              </div>

              <button
                onClick={toggleChat}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, i) => (
                <div key={i}>
                  {m.user && (
                    <div className="flex justify-end">
                      <div
  className="
    bg-gradient-to-r
    from-red-600
    to-red-500
    text-white
    px-4
    py-3
    rounded-[20px]
    rounded-br-md
    max-w-[80%]
    shadow-lg
  "
>
                        {m.user}
                      </div>
                    </div>
                  )}

                 {m.bot && (
  <div className="flex items-start gap-2">

    <div
      className="
        w-8
        h-8
        rounded-full
        bg-red-700
        flex
        items-center
        justify-center
        shrink-0
      "
    >
      💀
    </div>

    <div
      className="
        bg-zinc-950
        text-white
        px-4
        py-3
        rounded-[20px]
        rounded-bl-md
        max-w-[80%]
        border
        border-red-500/20
        shadow-lg
      "
    >
      {m.bot}
    </div>

  </div>
)}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-red-300">
  <span className="w-2 h-2 rounded-full bg-red-500 animate-bounce" />
  <span className="w-2 h-2 rounded-full bg-red-500 animate-bounce [animation-delay:150ms]" />
  <span className="w-2 h-2 rounded-full bg-red-500 animate-bounce [animation-delay:300ms]" />

  <span className="ml-2">
    Deadpool is cooking...
  </span>
</div>
              )}

              <div ref={bottomRef} />
            </div>

            <div className="p-3 border-t border-red-500/20 flex gap-2 bg-black/80 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <input
                type="text"
                value={message}
                placeholder={
                  isListening
                    ? "Listening..."
                    : useSearch
                      ? "Ask with live search..."
                      : "Talk to Deadpool..."
                }
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
                className="flex-1 min-w-0 bg-zinc-900 text-white placeholder-gray-400 border border-red-500/10 rounded-2xl px-4 py-3 outline-none text-base"
              />

              <button
                onClick={startListening}
                className={`
                  w-12
                  h-12
                  rounded-2xl
                  flex
                  items-center
                  justify-center
                  text-white
                  shrink-0
                  ${
                    isListening
                      ? "bg-green-600 animate-pulse"
                      : "bg-zinc-800 hover:bg-zinc-700"
                  }
                `}
                title="Voice input"
              >
                <Mic size={18} />
              </button>

              <button
                onClick={() =>
                  setUseSearch(!useSearch)
                }
                className={`
                  w-12
                  h-12
                  rounded-2xl
                  flex
                  items-center
                  justify-center
                  text-white
                  shrink-0
                  ${
                    useSearch
                      ? "bg-blue-600 animate-pulse"
                      : "bg-zinc-800 hover:bg-zinc-700"
                  }
                `}
                title={useSearch ? "Live search on" : "Live search off"}
              >
                <Search size={18} />
              </button>

              <button
                onClick={() => {
                  setVoiceMuted(!voiceMuted);

                  if (!voiceMuted && "speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                  }
                }}
                className={`
                  w-12
                  h-12
                  rounded-2xl
                  flex
                  items-center
                  justify-center
                  text-white
                  shrink-0
                  ${
                    voiceMuted
                      ? "bg-zinc-700"
                      : "bg-red-700 hover:bg-red-600"
                  }
                `}
                title={voiceMuted ? "Voice muted" : "Voice on"}
              >
                {voiceMuted ? (
                  <VolumeX size={18} />
                ) : (
                  <Volume2 size={18} />
                )}
              </button>

              <button
                onClick={sendMessage}
                className="w-12 h-12 rounded-2xl bg-gradient-to-r from-red-600 to-red-800 flex items-center justify-center text-white shrink-0"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}