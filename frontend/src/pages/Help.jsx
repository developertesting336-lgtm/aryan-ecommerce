import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Package,
  Truck,
  RotateCcw,
  CreditCard,
  UserRound,
  ShoppingBag,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  MessageCircle,
  Mail,
  Phone,
  HelpCircle,
  Clock3,
  CheckCircle2,
  Sparkles,
  FileText,
} from "lucide-react";

const helpCategories = [
  {
    title: "Orders & Delivery",
    description: "Track orders, delivery updates, cancellations and more.",
    icon: Package,
    color: "bg-blue-50 text-blue-600",
    links: [
      "How can I track my order?",
      "When will my order arrive?",
      "Can I cancel my order?",
    ],
  },
  {
    title: "Returns & Refunds",
    description: "Learn about returns, replacements and refund timelines.",
    icon: RotateCcw,
    color: "bg-emerald-50 text-emerald-600",
    links: [
      "How do I return a product?",
      "When will I receive my refund?",
      "Can I replace a damaged product?",
    ],
  },
  {
    title: "Payments",
    description: "Get help with payments, failed transactions and refunds.",
    icon: CreditCard,
    color: "bg-violet-50 text-violet-600",
    links: [
      "Why did my payment fail?",
      "What payment methods are supported?",
      "What happens after a failed payment?",
    ],
  },
  {
    title: "Account & Security",
    description: "Manage your account, password and personal information.",
    icon: UserRound,
    color: "bg-orange-50 text-orange-600",
    links: [
      "How can I update my account?",
      "How do I reset my password?",
      "How can I secure my account?",
    ],
  },
  {
    title: "Shopping & Products",
    description: "Find products, manage your wishlist and place orders.",
    icon: ShoppingBag,
    color: "bg-pink-50 text-pink-600",
    links: [
      "How do I place an order?",
      "How do I add a product to wishlist?",
      "How can I find a specific product?",
    ],
  },
  {
    title: "Shipping",
    description: "Understand shipping options, charges and delivery areas.",
    icon: Truck,
    color: "bg-cyan-50 text-cyan-600",
    links: [
      "How much does shipping cost?",
      "Where does NovaCart deliver?",
      "Can I change my delivery address?",
    ],
  },
];

const faqs = [
  {
    question: "How can I track my order?",
    answer:
      "You can track your order from the Orders section of your account. Open the relevant order to view its current status, shipping progress and delivery information.",
  },
  {
    question: "How can I cancel my order?",
    answer:
      "If your order has not been shipped, you may be able to cancel it from your Orders section. Once the order has entered the shipping process, cancellation may no longer be available.",
  },
  {
    question: "How do I return a product?",
    answer:
      "Go to your Orders section, select the product you want to return and choose the available return option. Follow the instructions shown for that order.",
  },
  {
    question: "When will I receive my refund?",
    answer:
      "Refund timing depends on the payment method and the return process. Once your refund is approved, the amount is generally returned through the original payment method.",
  },
  {
    question: "What should I do if my payment failed?",
    answer:
      "First, check whether the amount was actually deducted from your account. If the payment failed and no order was created, try again using a supported payment method. If money was deducted, contact support with your transaction details.",
  },
  {
    question: "How can I contact NovaCart support?",
    answer:
      "You can contact our support team through the Contact Us page. Include your order number whenever your request is related to an existing order so we can assist you faster.",
  },
];

function HelpCategoryCard({ category }) {
  const Icon = category.icon;

  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-app-primary/20 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${category.color}`}
        >
          <Icon size={23} strokeWidth={2} />
        </div>

        <ArrowRight
          size={18}
          className="mt-1 text-gray-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-app-primary"
        />
      </div>

      <h3 className="mt-5 text-lg font-bold text-gray-900">
        {category.title}
      </h3>

      <p className="mt-2 min-h-[48px] text-sm leading-6 text-gray-500">
        {category.description}
      </p>

      <div className="mt-5 space-y-2.5 border-t border-gray-100 pt-4">
        {category.links.map((link) => (
          <button
            key={link}
            type="button"
            className="flex w-full items-start gap-2 text-left text-sm text-gray-600 transition-colors hover:text-app-primary"
          >
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-300 group-hover:bg-app-primary" />
            <span>{link}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function FAQItem({ faq, isOpen, onClick }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left transition-colors hover:bg-gray-50 sm:px-6"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-semibold leading-6 text-gray-900 sm:text-base">
          {faq.question}
        </span>

        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
            isOpen
              ? "rotate-180 bg-app-primary text-white"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          <ChevronDown size={17} />
        </span>
      </button>

      <div
        className={`grid transition-all duration-300 ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-gray-100 px-5 pb-5 pt-4 text-sm leading-7 text-gray-600 sm:px-6">
            {faq.answer}
          </div>
        </div>
      </div>
    </div>
  );
}

function SupportCard({ icon: Icon, title, description, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-app-primary">
          <Icon size={21} />
        </div>

        <div className="min-w-0">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-gray-500">
            {description}
          </p>

          {children}
        </div>
      </div>
    </div>
  );
}

export default function Help() {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState(0);

  const filteredFaqs = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return faqs;

    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
    );
  }, [search]);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* =========================================================
          HERO
      ========================================================== */}
      <section className="relative overflow-hidden border-b border-gray-200 bg-white">
        {/* Decorative background */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-blue-50 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          {/* Breadcrumb */}
          <div className="mb-7 flex items-center gap-2 text-sm text-gray-500">
            <Link
              to="/"
              className="transition-colors hover:text-app-primary"
            >
              Home
            </Link>

            <span>/</span>

            <span className="font-medium text-gray-900">Help Center</span>
          </div>

          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-app-primary shadow-sm">
              <HelpCircle size={28} />
            </div>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-app-primary">
              <Sparkles size={14} />
              NovaCart Help Center
            </div>

            <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">
              How can we help you?
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-500 sm:text-base">
              Find answers, get help with your orders, or contact our support
              team. We’re here to make your NovaCart experience simple.
            </p>

            {/* Search */}
            <div className="mx-auto mt-8 max-w-2xl">
              <div className="group flex items-center rounded-2xl border border-gray-200 bg-white p-2 shadow-lg shadow-gray-200/50 transition-all focus-within:border-app-primary focus-within:ring-4 focus-within:ring-blue-100">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center text-gray-400">
                  <Search size={21} />
                </div>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search for help, orders, returns, payments..."
                  className="h-11 min-w-0 flex-1 bg-transparent px-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 sm:text-base"
                />

                <button
                  type="button"
                  className="hidden rounded-xl bg-app-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 sm:block"
                >
                  Search
                </button>
              </div>

              <p className="mt-3 text-xs text-gray-400">
                Try searching for “refund”, “order”, “payment” or “delivery”
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          QUICK SUPPORT
      ========================================================== */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <SupportCard
            icon={MessageCircle}
            title="Chat with us"
            description="Get quick assistance with common questions."
          >
            <button
              type="button"
              className="mt-3 text-sm font-semibold text-app-primary hover:underline"
            >
              Start a conversation →
            </button>
          </SupportCard>

          <SupportCard
            icon={Mail}
            title="Email support"
            description="Send us your question and our team will respond."
          >
            <a
              href="mailto:support@novacart.com"
              className="mt-3 block text-sm font-semibold text-app-primary hover:underline"
            >
              support@novacart.com
            </a>
          </SupportCard>

          <SupportCard
            icon={Clock3}
            title="Support hours"
            description="Our customer support team is available during:"
          >
            <p className="mt-3 text-sm font-semibold text-gray-800">
              Monday – Sunday · 9:00 AM – 7:00 PM
            </p>
          </SupportCard>
        </div>
      </section>

      {/* =========================================================
          HELP CATEGORIES
      ========================================================== */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mb-7">
          <div className="flex items-center gap-2 text-sm font-semibold text-app-primary">
            <FileText size={17} />
            Browse help topics
          </div>

          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-950 sm:text-3xl">
            What do you need help with?
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Choose a category to find the information you need.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {helpCategories.map((category) => (
            <HelpCategoryCard
              key={category.title}
              category={category}
            />
          ))}
        </div>
      </section>

      {/* =========================================================
          ORDER HELP BANNER
      ========================================================== */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-app-primary px-6 py-8 text-white shadow-xl sm:px-8 lg:px-10 lg:py-10">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/80">
                <Package size={17} />
                Need help with an order?
              </div>

              <h2 className="text-2xl font-extrabold sm:text-3xl">
                Check your order status
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/75 sm:text-base">
                View your recent orders, track deliveries and check available
                return or cancellation options.
              </p>
            </div>

            <Link
              to="/orders"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-app-primary shadow-lg transition-all hover:-translate-y-0.5 hover:bg-gray-50"
            >
              View My Orders
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          FAQ
      ========================================================== */}
      <section className="border-y border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-app-primary">
              <HelpCircle size={22} />
            </div>

            <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-gray-950 sm:text-3xl">
              Frequently asked questions
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Quick answers to some of the questions our customers ask most
              often.
            </p>
          </div>

          <div className="mt-9 space-y-3">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <FAQItem
                  key={faq.question}
                  faq={faq}
                  isOpen={openFaq === index}
                  onClick={() =>
                    setOpenFaq(openFaq === index ? -1 : index)
                  }
                />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
                <Search className="mx-auto text-gray-400" size={28} />

                <h3 className="mt-4 font-bold text-gray-900">
                  No matching help articles
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Try a different search term or contact our support team.
                </p>

                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-5 text-sm font-semibold text-app-primary hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================
          TRUST / SECURITY
      ========================================================== */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck size={22} />
            </div>

            <h3 className="mt-5 font-bold text-gray-900">
              Your security matters
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Never share your password, OTP, CVV or complete card details
              with anyone claiming to be from support.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-app-primary">
              <CheckCircle2 size={22} />
            </div>

            <h3 className="mt-5 font-bold text-gray-900">
              Genuine support
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Use the official NovaCart website and support channels whenever
              you need assistance.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Phone size={22} />
            </div>

            <h3 className="mt-5 font-bold text-gray-900">
              Need personal assistance?
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Our support team can help with account, order, delivery and
              payment-related questions.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          CONTACT CTA
      ========================================================== */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-gray-200 bg-white p-7 text-center shadow-sm sm:p-10 lg:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-app-primary">
            <MessageCircle size={27} />
          </div>

          <h2 className="mt-5 text-2xl font-extrabold text-gray-950 sm:text-3xl">
            Still need help?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-gray-500 sm:text-base">
            If you couldn’t find what you were looking for, our customer
            support team is ready to help you.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-app-primary px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:opacity-90"
            >
              Contact Support
              <ArrowRight size={17} />
            </Link>

            <Link
              to="/privacy-policy"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-semibold text-gray-700 transition-all hover:border-app-primary/30 hover:text-app-primary"
            >
              Privacy & Security
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}