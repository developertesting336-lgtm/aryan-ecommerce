import {
  BriefcaseBusiness,
  Gamepad2,
  Home,
  Smartphone,
  Shirt,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ShoppingIntent() {
  const navigate = useNavigate();

  const options = [
    {
      icon: Smartphone,
      title: "Tech & Electronics",
      description: "Phones, gadgets & accessories",
      query: "electronics",
    },
    {
      icon: Shirt,
      title: "Fashion",
      description: "Style for every day",
      query: "fashion",
    },
    {
      icon: BriefcaseBusiness,
      title: "Work",
      description: "Tools for getting things done",
      query: "office",
    },
    {
      icon: Gamepad2,
      title: "Gaming",
      description: "Level up your setup",
      query: "gaming",
    },
    {
      icon: Home,
      title: "Home",
      description: "Make your space better",
      query: "home",
    },
    {
      icon: Sparkles,
      title: "Everyday",
      description: "Things you'll actually use",
      query: "lifestyle",
    },
  ];

  const handleClick = (query) => {
    navigate(`/products?category=${query}`);
  };

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">

        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
            Start exploring
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">
            What are you looking for?
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {options.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.title}
                onClick={() => handleClick(item.query)}
                className="group cursor-pointer rounded-2xl border border-gray-200 bg-white p-4 text-left transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-700 transition group-hover:bg-blue-600 group-hover:text-white">
                  <Icon size={20} />
                </div>

                <h3 className="mt-4 text-sm font-bold text-gray-900">
                  {item.title}
                </h3>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  {item.description}
                </p>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
}
