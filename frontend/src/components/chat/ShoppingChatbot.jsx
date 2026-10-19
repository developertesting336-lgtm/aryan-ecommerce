import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react";
import { sendChatMessage } from "../../redux/slices/aiSlice";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const SUGGESTIONS = [
  "Show me best deals",
  "Phones under 20000",
  "Help me pick a gift",
];

const getImageUrl = (image) => {
  const value =
    typeof image === "string"
      ? image
      : image?.url || image?.secure_url || image?.path || "";

  if (!value) return "/1786052049893.webp";
  if (/^(https?:|blob:)/.test(value)) return value;
  return `${BASE_URL}${value.startsWith("/") ? "" : "/"}${value}`;
};

export default function ShoppingChatbot() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth?.user);

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hi! I'm your shopping assistant. Tell me what you're looking for and your budget.",
      products: [],
    },
  ]);

  const bottomRef = useRef(null);

  // Scroll to the newest message
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, open]);

  const send = async (text) => {
    const message = (text ?? input).trim();
    if (!message || loading) return;

    const history = messages
      .slice(-6)
      .map((m) => ({ role: m.role, text: m.text }));

    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setInput("");
    setLoading(true);

    try {
      const data = await dispatch(
        sendChatMessage({ message, history })
      ).unwrap();

      setMessages((prev) => [
        ...prev,
        { role: "bot", text: data.reply, products: data.products || [] },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text:
            typeof err === "string"
              ? err
              : "Sorry, something went wrong. Please try again.",
          products: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // The route is protected, so hide the chatbot for guests
  if (!user) return null;

  return (
    <>
      {/* =====================================================
          FLOATING BUTTON
      ===================================================== */}

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open shopping assistant"
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700 active:scale-95"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* =====================================================
          CHAT PANEL
      ===================================================== */}

      {open && (
        <div
          className="
            fixed
            inset-x-3
            bottom-3
            z-50
            flex
            h-[75vh]
            max-h-[600px]
            flex-col
            overflow-hidden
            rounded-2xl
            border
            border-gray-200
            dark:border-gray-700
            bg-white
            dark:bg-gray-900
            shadow-2xl
            sm:inset-x-auto
            sm:bottom-5
            sm:right-5
            sm:w-[380px]
          "
        >
          {/* HEADER */}

          <div className="flex items-center justify-between bg-blue-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Sparkles size={18} />
              <div>
                <p className="text-sm font-semibold leading-tight">
                  Shopping Assistant
                </p>
                <p className="text-[11px] text-blue-100">
                  Ask about products & prices
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition hover:bg-blue-500"
            >
              <X size={18} />
            </button>
          </div>

          {/* MESSAGES */}

          <div className="flex-1 space-y-3 overflow-y-auto overscroll-contain bg-gray-50 dark:bg-gray-950 p-3">
            {messages.map((m, index) => (
              <div
                key={index}
                className={`flex flex-col ${
                  m.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "rounded-br-md bg-blue-600 text-white"
                      : "rounded-bl-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                  }`}
                >
                  {m.text}
                </div>

                {/* PRODUCT CARDS */}

                {m.products?.length > 0 && (
                  <div className="mt-2 w-full space-y-2">
                    {m.products.map((p) => (
                      <button
                        key={p._id}
                        type="button"
                        // Change this path to your product details route
                        onClick={() => {
                          setOpen(false);
                           const slug =
    p.slug?.trim() ||
    p.name
      ?.toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

  navigate(`/product/${slug}`);
                        }}
                        className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-left transition hover:border-blue-400"
                      >
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-100 dark:border-gray-700 bg-white">
                          <img
                            src={getImageUrl(p.images?.[0])}
                            alt={p.name}
                            className="h-full w-full object-contain p-0.5"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-xs font-semibold text-gray-900 dark:text-white">
                            {p.name}
                          </p>

                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                              ₹{p.price}
                            </span>

                            {p.mrp > p.price && (
                              <span className="text-[11px] text-gray-400 line-through">
                                ₹{p.mrp}
                              </span>
                            )}

                            {p.rating?.average > 0 && (
                              <span className="text-[11px] text-amber-500">
                                ★ {Number(p.rating.average).toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* TYPING INDICATOR */}

            {loading && (
              <div className="flex items-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2 text-sm text-gray-500 dark:text-gray-400">
                  <Loader2 size={14} className="animate-spin" />
                  Thinking...
                </div>
              </div>
            )}

            {/* SUGGESTIONS (only before the first user message) */}

            {messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="cursor-pointer rounded-full border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/30 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 transition hover:bg-blue-100"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* INPUT */}

          <div className="flex items-center gap-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              maxLength={300}
              placeholder="e.g. laptop under 50000"
              disabled={loading}
              className="h-10 flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-400 focus:border-blue-500 disabled:opacity-60"
            />

            <button
              type="button"
              onClick={() => send()}
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={17} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}