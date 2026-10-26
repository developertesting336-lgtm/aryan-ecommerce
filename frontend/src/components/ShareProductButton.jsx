import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Share2, Copy, CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { createReferralLink } from "../redux/slices/referralSlice";

export default function ShareProductButton({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // adjust to your auth slice
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // =====================================================
  // CREATE LINK
  // =====================================================

  const handleShare = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const result = await dispatch(createReferralLink(product._id)).unwrap();

      setUrl(result.url);
    } catch (error) {
      console.error("Share error:", error);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // COPY LINK
  // =====================================================

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);

    setCopied(true);

    setTimeout(() => setCopied(false), 2000);
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">

      <div className="mb-3 flex items-start gap-3">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
          <Share2 size={17} />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Share & Earn Points
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            Earn 10% of the product price as points when someone buys
            through your link.
          </p>
        </div>

      </div>

      {!url ? (
        <button
          type="button"
          onClick={handleShare}
          disabled={loading}
          className="
            flex
            h-10
            w-full
            cursor-pointer
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-gray-900
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-gray-800
            disabled:cursor-not-allowed
            disabled:bg-gray-300
          "
        >
          {loading ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <>
              <Share2 size={16} />
              Get share link
            </>
          )}
        </button>
      ) : (
        <div className="space-y-2">

          <div className="flex gap-2">

            <input
              type="text"
              value={url}
              readOnly
              className="
                h-10
                min-w-0
                flex-1
                rounded-xl
                border
                border-gray-200
                bg-white
                px-3
                text-xs
                outline-none
                dark:border-gray-700
                dark:bg-gray-900
              "
            />

            <button
              type="button"
              onClick={handleCopy}
              className="
                flex
                h-10
                w-10
                cursor-pointer
                items-center
                justify-center
                rounded-xl
                bg-blue-600
                text-white
                transition
                hover:bg-blue-700
              "
              title="Copy link"
            >
              {copied ? <CheckCircle2 size={17} /> : <Copy size={17} />}
            </button>

          </div>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `${product.name} ${url}`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="
              flex
              h-10
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-green-600
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-green-700
            "
          >
            <MessageCircle size={16} />
            Share on WhatsApp
          </a>

        </div>
      )}

    </div>
  );
}