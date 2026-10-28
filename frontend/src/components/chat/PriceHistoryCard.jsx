import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const day = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export default function PriceHistoryCard({ data }) {
  const { name, currentPrice, points, stats, days } = data;

  const chartData = [
    ...points.map((p) => ({ price: p.price, at: new Date(p.from).getTime() })),
    { price: currentPrice, at: Date.now() },
  ];

  const isLowest = currentPrice <= stats.lowest.price;
  const diff = currentPrice - stats.lowest.price;

  return (
    <div className="w-full min-w-0 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 text-sm shadow-sm">
      <p className="line-clamp-2 font-semibold text-gray-900 dark:text-white">{name}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">Last {days} days</p>

      <div className="mt-2 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-2">
          <p className="text-[11px] text-gray-500 dark:text-gray-400">Current</p>
          <p className="font-semibold text-gray-900 dark:text-white">{inr(currentPrice)}</p>
        </div>
        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-2">
          <p className="text-[11px] text-green-700 dark:text-green-400">Lowest</p>
          <p className="font-semibold text-green-700 dark:text-green-400">{inr(stats.lowest.price)}</p>
        </div>
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-2">
          <p className="text-[11px] text-red-700 dark:text-red-400">Highest</p>
          <p className="font-semibold text-red-700 dark:text-red-400">{inr(stats.highest.price)}</p>
        </div>
      </div>

      <div className="mt-3 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis
              dataKey="at"
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={day}
              tick={{ fontSize: 10 }}
            />
            <YAxis domain={["auto", "auto"]} width={45} tick={{ fontSize: 10 }} />
            <Tooltip
              labelFormatter={(t) => new Date(t).toLocaleString("en-IN")}
              formatter={(v) => [inr(v), "Price"]}
            />
            <Line type="stepAfter" dataKey="price" stroke="#2563eb" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className={`mt-2 text-xs font-medium ${isLowest ? "text-green-700 dark:text-green-400" : "text-orange-600 dark:text-orange-400"}`}>
        {isLowest ? "At its lowest price right now" : `${inr(diff)} above its lowest price`}
      </p>
    </div>
  );
}