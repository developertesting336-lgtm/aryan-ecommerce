import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Coins, Clock, Loader2, ShoppingBag } from "lucide-react";

import { getMyPoints, getMyReferrals } from "../redux/slices/referralSlice";

const STATUS_STYLE = {
  pending: {
    label: "Pending (after delivery)",
    className: "bg-amber-50 text-amber-700",
  },
  approved: {
    label: "Credited",
    className: "bg-green-50 text-green-700",
  },
  rejected: {
    label: "Cancelled",
    className: "bg-red-50 text-red-600",
  },
};

export default function MyPoints() {
  const dispatch = useDispatch();

  const { available, pending, referrals, loading, error } = useSelector(
    (state) => state.referral
  );

  useEffect(() => {
    dispatch(getMyPoints());
    dispatch(getMyReferrals());
  }, [dispatch]);

  if (loading && !referrals.length) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto flex max-w-5xl items-center justify-center px-4 py-20">
          <Loader2 size={28} className="animate-spin text-blue-600" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 dark:text-gray-100">

      {/* HEADER */}

      <section className="border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            My Reward Points
          </h1>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Earn points when friends buy through your shared links.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">

        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* POINT CARDS */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <Coins size={21} />
              </div>

              <div>
                <p className="text-sm text-gray-500">Available points</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {available}
                </p>
                <p className="text-xs text-gray-500">Worth ₹{available}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock size={21} />
              </div>

              <div>
                <p className="text-sm text-gray-500">Pending points</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pending}
                </p>
                <p className="text-xs text-gray-500">
                  Credited after the order is delivered
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* REFERRAL LIST */}

        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

          <div className="border-b border-gray-100 p-5 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Your Referrals
            </h2>
          </div>

          {referrals.length === 0 ? (
            <div className="py-12 text-center">
              <ShoppingBag size={30} className="mx-auto text-gray-300" />
              <p className="mt-3 text-sm text-gray-500">
                No referral orders yet. Share a product link to start earning.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {referrals.map((r) => {
                const style = STATUS_STYLE[r.status] || STATUS_STYLE.pending;

                return (
                  <div
                    key={r._id}
                    className="flex items-center justify-between gap-3 p-4 sm:p-5"
                  >
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {r.product?.name || "Product"}
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        Bought by {r.receiver?.firstName || "a customer"} ·{" "}
                        {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        +{r.points} pts
                      </p>

                      <span
                        className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${style.className}`}
                      >
                        {style.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </section>

    </main>
  );
}