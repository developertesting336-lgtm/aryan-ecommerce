import {
  Truck,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

export default function Features() {

  const data = [
    {
      icon: Truck,
      title: "Free Shipping",
      description: "Free delivery on orders over $100",
    },
    {
      icon: ShieldCheck,
      title: "Secure Payments",
      description: "100% secure payment options",
    },
    {
      icon: RotateCcw,
      title: "30-Day Returns",
      description: "Easy returns with no questions asked",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-3
          divide-y
          sm:divide-y-0
          sm:divide-x
          divide-gray-200
          rounded-2xl
          border
          border-gray-200
          bg-white
          shadow-sm
        "
      >

        {data.map((item) => {

          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="
                flex
                items-center
                gap-4
                px-5
                py-5
                sm:px-6
                lg:px-8
              "
            >

              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-50
                  text-blue-600
                "
              >
                <Icon size={21} />
              </div>

              <div className="min-w-0">

                <h3 className="font-semibold text-gray-900">
                  {item.title}
                </h3>

                <p className="mt-0.5 text-xs sm:text-sm text-gray-500">
                  {item.description}
                </p>

              </div>

            </div>
          );
        })}

      </div>

    </section>
  );
}