import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Loader2,
  ShoppingCart,
  Check,
  Trash2
} from "lucide-react";
import { sendChatMessage, fetchChatHistory, clearChatHistory } from "../../redux/slices/aiSlice";
import {
  getCart,
  addProduct,
  optimisticAddProduct,
} from "../../redux/slices/cartSlice";
import { showSuccess, showError } from "../../utils/toast";


const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const SUGGESTIONS = [
  "Show me best deals",
  "Phones under 20000",
  "Help me pick a gift",
];

const getImageValue = (image) =>
  typeof image === "string"
    ? image
    : image?.url || image?.secure_url || image?.path || "";

const getImageUrl = (image) => {
  const value = getImageValue(image);

  if (!value) return "/1786052049893.webp";
  if (/^(https?:|blob:)/.test(value)) return value;
  return `${BASE_URL}${value.startsWith("/") ? "" : "/"}${value}`;
};

const getSlug = (p) =>
  p.slug?.trim() ||
  p.name
    ?.toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function ShoppingChatbot() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth?.user);
  const cartItems = useSelector((state) => state.cart?.cart?.items || []);
const WELCOME = {
  role: "bot",
  text: "Hi! I'm your shopping assistant. Tell me what you're looking for and your budget.",
  products: [],
};
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
const historyLoaded = useRef(false);

  const bottomRef = useRef(null);
  const handleClear = async () => {
  try {
    await dispatch(clearChatHistory()).unwrap();
    setMessages([WELCOME]);
  } catch {
    showError("Couldn't clear the chat");
  }
};
useEffect(() => {
  if (!open || !user || historyLoaded.current) return;
  historyLoaded.current = true;

  dispatch(fetchChatHistory())
    .unwrap()
    .then(({ messages: saved }) => {
      if (!saved?.length) return;
      setMessages([
        WELCOME,
        ...saved.map((m) => ({
          role: m.role === "assistant" ? "bot" : "user", // server says "assistant", UI says "bot"
          text: m.text,
          products: m.products || [],
        })),
      ]);
    })
    .catch(() => {}); // no saved chat is fine, keep the welcome message
}, [open, user?._id, dispatch]);

// Different user logged in (or logged out): start fresh
useEffect(() => {
  historyLoaded.current = false;
  setMessages([WELCOME]);
}, [user?._id]);
  // Scroll to the newest message
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, open]);

  const isInCart = (id) =>
    cartItems.some(
      (it) =>
        String(it?.productId?._id || it?.productId || it?.product?._id) ===
        String(id)
    );

  const goToProduct = (p) => {
    setOpen(false);
    navigate(`/product/${getSlug(p)}`);
  };

  const handleAddToCart = (p) => {
    if (isInCart(p._id)) {
      setOpen(false);
      navigate("/cart");
      return;
    }

    if (p.stock !== undefined && p.stock <= 0) {
      showError("Product is out of stock");
      return;
    }

    const productData = {
      productId: p._id,
      quantity: 1,
      name: p.name || "Product",
      price: Number(p.price) || 0,
      image: getImageValue(p.images?.[0]),
      slug: getSlug(p) || "",
    };

    // STEP 1: instant UI update
    dispatch(optimisticAddProduct(productData));
    showSuccess("Product added to cart");

    // STEP 2: server request, in order
   // STEP 2: server request in the background
dispatch(
  addProduct({
    productId: p._id,
    quantity: 1,
    price: Number(p.price) || 0,
  })
)
  .unwrap()
  .catch((error) => {
    // STEP 3: on failure, restore the real cart
    dispatch(getCart());
    showError(
      typeof error === "string"
        ? error
        : error?.message || "Unable to add product to cart"
    );
  });
  };

  const send = async (text) => {
    const message = (text ?? input).trim();
    if (!message || loading) return;

    // send product ids too, so "add it to cart" knows which product you mean
    const history = messages.slice(-6).map((m) => ({
      role: m.role,
      text: m.text,
      productIds: (m.products || []).map((p) => p._id),
    }));

    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setInput("");
    setLoading(true);

    try {
      const data = await dispatch(
        sendChatMessage({ message, history })
      ).unwrap();

      // chatbot changed the cart on the server -> refresh Redux cart
      if (data.cartUpdated) {
        dispatch(getCart());
      }

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
      {/* FLOATING BUTTON */}
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

      {/* CHAT PANEL */}
      {open && (
        <div className="fixed inset-x-3 bottom-3 z-50 flex h-[75vh] max-h-[600px] flex-col overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[380px]">
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
  <div className="flex items-center gap-1">
  <button
    type="button"
    onClick={handleClear}
    aria-label="Clear chat"
    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition hover:bg-blue-500"
  >
    <Trash2 size={16} />
  </button>
  <button
    type="button"
    onClick={() => setOpen(false)}
    aria-label="Close chat"
    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition hover:bg-blue-500"
  >
    <X size={18} />
  </button>
</div>
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
                    {m.products.map((p) => {
                      const added = isInCart(p._id);
                      const outOfStock = p.stock !== undefined && p.stock <= 0;

                      return (
                        <div
                          key={p._id}
                          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 transition hover:border-blue-400"
                        >
                          {/* Clickable info area */}
                          <button
                            type="button"
                            onClick={() => goToProduct(p)}
                            className="flex w-full cursor-pointer items-center gap-3 text-left"
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

                          {/* Add to cart / Go to cart */}
                          <button
                            type="button"
                            onClick={() => handleAddToCart(p)}
                            disabled={outOfStock && !added}
                            className={`mt-2 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition disabled:cursor-not-allowed ${
                              added
                                ? "bg-green-600 hover:bg-green-700"
                                : outOfStock
                                ? "bg-gray-400"
                                : "bg-blue-600 hover:bg-blue-700"
                            }`}
                          >
                            {added ? (
                              <Check size={14} />
                            ) : (
                              <ShoppingCart size={14} />
                            )}
                            {added
                              ? "Go to cart"
                              : outOfStock
                              ? "Out of stock"
                              : "Add to cart"}
                          </button>
                        </div>
                      );
                    })}
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