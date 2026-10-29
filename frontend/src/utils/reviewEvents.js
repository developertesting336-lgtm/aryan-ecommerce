const CHANNEL_NAME = "ecommerce_review_updates";

let channel = null;
try {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    channel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch {
  // Gracefully fallback
}

/**
 * Broadcast that a review was created, updated, approved, or deleted.
 * @param {Object} data - { productId, reviewId, action, rating }
 */
export const emitReviewUpdate = (data = {}) => {
  const payload = {
    ...data,
    timestamp: Date.now(),
  };

  if (channel) {
    try {
      channel.postMessage(payload);
    } catch {
      // ignore
    }
  }

  // Dispatch custom event for current window/tab
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("app:review-updated", { detail: payload })
    );

    try {
      localStorage.setItem(
        "app:review_updated_event",
        JSON.stringify(payload)
      );
    } catch {
      // ignore storage errors
    }
  }
};

/**
 * Subscribe to review updates from this or any other tab.
 * @param {Function} callback
 * @returns {Function} unsubscribe cleanup function
 */
export const onReviewUpdate = (callback) => {
  if (typeof window === "undefined") return () => {};

  const handleChannelMessage = (event) => {
    if (event.data) {
      callback(event.data);
    }
  };

  const handleCustomEvent = (event) => {
    if (event.detail) {
      callback(event.detail);
    }
  };

  const handleStorageEvent = (event) => {
    if (event.key === "app:review_updated_event" && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        callback(parsed);
      } catch {
        // ignore
      }
    }
  };

  if (channel) {
    channel.addEventListener("message", handleChannelMessage);
  }
  window.addEventListener("app:review-updated", handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    if (channel) {
      channel.removeEventListener("message", handleChannelMessage);
    }
    window.removeEventListener("app:review-updated", handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
  };
};
