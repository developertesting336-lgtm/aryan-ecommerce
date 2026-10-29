import {
  Headphones,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";

export default function TrustStrip() {
  const items = [
    {
      icon: Truck,
      title: "Fast delivery",
      text: "Reliable shipping",
    },
    {
      icon: ShieldCheck,
      title: "Secure checkout",
      text: "Your payment is protected",
    },
    {
      icon: RotateCcw,
      title: "Easy returns",
      text: "Simple return process",
    },
    {
      icon: Headphones,
      title: "Customer support",
      text: "We're here to help",
    },
  ];

  return (
    <section className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <div className="grid grid-cols-2 divide-x divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 bg-white lg:grid-cols-4 lg:divide-y-0">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex items-center gap-3 px-4 py-5 sm:px-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon size={19} />
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {item.title}
                  </p>

                  <p className="mt-0.5 text-[11px] text-gray-500 sm:text-xs">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

