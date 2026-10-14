import { useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  HelpCircle,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";

/* =========================================================
   FAQ DATA
========================================================= */

const faqs = [
  {
    question: "Where is my order?",
    answer:
      "You can check your latest order status from your Orders page. If tracking information is available, it will also be shown there.",
  },
  {
    question: "How can I return a product?",
    answer:
      "Open your order details and check whether the product is eligible for return. Follow the available return instructions for that order.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Delivery time depends on the product, delivery location, seller, and shipping method. Your estimated delivery date will be shown during checkout and in your order details.",
  },
  {
    question: "How can I contact support about a payment?",
    answer:
      "For payment-related questions, please contact us with your order number and the email address associated with your account. Never share your full card number or password.",
  },
];

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Contact() {
  const [openFaq, setOpenFaq] = useState(0);

  const [form, setForm] = useState({
    name: "",
    email: "",
    orderNumber: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] =
    useState(false);

  /* =======================================================
     FORM CHANGE
  ======================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  /* =======================================================
     FORM SUBMIT
  ======================================================= */

  const handleSubmit = (event) => {
    event.preventDefault();

    /*
     * Replace this with your API/AJAX request.
     *
     * Example:
     * dispatch(submitContactForm(form))
     */

    setSubmitted(true);

    setForm({
      name: "",
      email: "",
      orderNumber: "",
      subject: "",
      message: "",
    });
  };

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden border-b border-gray-100 bg-gray-50">
        {/* Decorative background */}

        <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-app-primary/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />

        <div className="relative mx-auto max-w-[1440px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          {/* Breadcrumb */}

          <div className="mb-7 flex items-center gap-2 text-sm text-gray-500">
            <Link
              to="/"
              className="transition hover:text-app-primary"
            >
              Home
            </Link>

            <span className="text-gray-300">
              /
            </span>

            <span className="font-medium text-gray-800">
              Contact Us
            </span>
          </div>

          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3.5 py-1.5 text-xs font-semibold text-app-primary shadow-sm">
              <MessageCircle
                size={15}
              />

              We're here to help
            </div>

            <h1 className="text-4xl font-black tracking-[-0.04em] text-gray-950 sm:text-5xl lg:text-6xl">
              Let's talk.
              <span className="text-app-primary">
                {" "}
                We're listening.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">
              Have a question about an order,
              product, delivery, payment, or
              anything else? Send us a message and
              our support team will get back to you.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          SUPPORT CARDS
      ====================================================== */}

      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          <ContactCard
            icon={Mail}
            title="Email us"
            description="For general questions and support."
            value="support@novacart.com"
            href="mailto:support@novacart.com"
          />

          <ContactCard
            icon={Phone}
            title="Call us"
            description="Speak with our support team."
            value="+91 1800 000 000"
            href="tel:+911800000000"
          />

          <ContactCard
            icon={Clock3}
            title="Support hours"
            description="Monday to Saturday."
            value="9:00 AM – 7:00 PM"
          />

          <ContactCard
            icon={MessageCircle}
            title="Order support"
            description="Need help with an order?"
            value="Check your orders"
            href="/orders"
          />
        </div>
      </section>

      {/* =====================================================
          MAIN CONTACT AREA
      ====================================================== */}

      <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 xl:gap-20">
          {/* =================================================
              LEFT INFORMATION
          ================================================== */}

          <div>
            <div className="max-w-lg">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-app-primary">
                Customer support
              </span>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-gray-950 sm:text-4xl">
                How can we help?
              </h2>

              <p className="mt-4 text-base leading-7 text-gray-600">
                Whether you have a question about a
                product or need help after placing
                an order, we're here to make things
                easier.
              </p>
            </div>

            {/* QUICK HELP */}

            <div className="mt-8 space-y-3">
              <QuickHelp
                icon={Truck}
                title="Track your order"
                description="View delivery status and order details."
                href="/orders"
              />

              <QuickHelp
                icon={ShoppingBag}
                title="Browse products"
                description="Explore our latest products and collections."
                href="/products"
              />

              <QuickHelp
                icon={HelpCircle}
                title="Frequently asked questions"
                description="Find answers to common questions below."
                onClick={() =>
                  document
                    .getElementById(
                      "faq"
                    )
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
              />
            </div>

            {/* PRIVACY CARD */}

            <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/60 p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-app-primary shadow-sm">
                  <ShieldCheck
                    size={19}
                  />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-950">
                    Privacy & security
                  </h3>

                  <p className="mt-1.5 text-xs leading-5 text-gray-600">
                    For privacy-related questions,
                    please review our Privacy Policy
                    or contact our privacy support team.
                  </p>

                  <Link
                    to="/privacy-policy"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-app-primary hover:underline"
                  >
                    View Privacy Policy
                    <ArrowRight
                      size={13}
                    />
                  </Link>
                </div>
              </div>
            </div>

            {/* LOCATION */}

            <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-app-primary shadow-sm">
                  <MapPin
                    size={19}
                  />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-950">
                    NovaCart
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Customer Support
                    <br />
                    India
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              CONTACT FORM
          ================================================== */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_15px_50px_rgba(15,23,42,0.07)] sm:p-7 lg:p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-bold tracking-[-0.02em] text-gray-950">
                Send us a message
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Fill out the form below and we'll
                get back to you as soon as possible.
              </p>
            </div>

            {/* SUCCESS */}

            {submitted && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-100 bg-green-50 p-4">
                <CheckCircle2
                  size={19}
                  className="mt-0.5 shrink-0 text-green-600"
                />

                <div>
                  <p className="text-sm font-bold text-green-800">
                    Message sent successfully
                  </p>

                  <p className="mt-1 text-xs leading-5 text-green-700">
                    Thank you for contacting NovaCart.
                    Our team will get back to you
                    shortly.
                  </p>
                </div>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* NAME + EMAIL */}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField
                  label="Full name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                />

                <FormField
                  label="Email address"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>

              {/* ORDER + SUBJECT */}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField
                  label="Order number"
                  name="orderNumber"
                  value={form.orderNumber}
                  onChange={handleChange}
                  placeholder="Optional"
                />

                <div>
                  <label
                    htmlFor="subject"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Subject
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <select
                    id="subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/10"
                  >
                    <option value="">
                      Select a topic
                    </option>

                    <option value="order">
                      Order support
                    </option>

                    <option value="delivery">
                      Delivery
                    </option>

                    <option value="return">
                      Return / refund
                    </option>

                    <option value="payment">
                      Payment
                    </option>

                    <option value="product">
                      Product question
                    </option>

                    <option value="account">
                      Account
                    </option>

                    <option value="other">
                      Other
                    </option>
                  </select>
                </div>
              </div>

              {/* MESSAGE */}

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  Message
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Tell us how we can help..."
                  className="w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm leading-6 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-app-primary focus:ring-2 focus:ring-app-primary/10"
                />
              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-app-primary px-5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-app-primary/30 active:translate-y-0 sm:w-auto"
              >
                <Send size={16} />

                Send message
              </button>

              <p className="text-xs leading-5 text-gray-400">
                Please do not include sensitive
                information such as passwords, full
                payment card numbers, or account
                security codes.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* =====================================================
          FAQ
      ====================================================== */}

      <section
        id="faq"
        className="border-y border-gray-100 bg-gray-50"
      >
        <div className="mx-auto max-w-[1000px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-app-primary">
              Quick answers
            </span>

            <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-gray-950 sm:text-4xl">
              Frequently asked questions
            </h2>

            <p className="mt-4 text-sm leading-6 text-gray-600 sm:text-base">
              Here are answers to some common
              questions. If you still need help,
              send us a message.
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {faqs.map((faq, index) => {
              const isOpen =
                openFaq === index;

              return (
                <div
                  key={faq.question}
                  className={`overflow-hidden rounded-xl border bg-white transition ${
                    isOpen
                      ? "border-blue-100 shadow-sm"
                      : "border-gray-200"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaq(
                        isOpen
                          ? null
                          : index
                      )
                    }
                    className="flex w-full items-center justify-between gap-5 px-5 py-4 text-left sm:px-6 sm:py-5"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-semibold text-gray-900 sm:text-base">
                      {faq.question}
                    </span>

                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-gray-400 transition-transform duration-200 ${
                        isOpen
                          ? "rotate-180 text-app-primary"
                          : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="border-t border-gray-100 px-5 pb-5 pt-4 sm:px-6">
                      <p className="text-sm leading-6 text-gray-600">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          BOTTOM CTA
      ====================================================== */}

      <section className="bg-app-primary">
        <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
                <ShoppingBag
                  size={20}
                />
              </div>

              <div>
                <h2 className="text-lg font-bold text-white sm:text-xl">
                  Ready to keep shopping?
                </h2>

                <p className="mt-1 text-sm text-blue-100">
                  Explore our latest products and
                  discover something you'll love.
                </p>
              </div>
            </div>

            <Link
              to="/products"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-app-primary transition hover:bg-blue-50"
            >
              Shop products
              <ArrowRight
                size={16}
              />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   CONTACT CARD
========================================================= */

function ContactCard({
  icon: Icon,
  title,
  description,
  value,
  href,
}) {
  const content = (
    <>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-app-primary">
        <Icon size={19} />
      </div>

      <div className="min-w-0">
        <h3 className="text-sm font-bold text-gray-950">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-gray-500">
          {description}
        </p>

        <span className="mt-2 block truncate text-sm font-semibold text-app-primary">
          {value}
        </span>
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="flex items-start gap-4 border-b border-gray-100 px-0 py-5 transition hover:bg-gray-50/50 sm:px-5 sm:py-6 lg:border-b-0 lg:border-r lg:px-6 first:lg:pl-0 last:lg:border-r-0 last:lg:pr-0"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="flex items-start gap-4 border-b border-gray-100 px-0 py-5 sm:px-5 sm:py-6 lg:border-b-0 lg:border-r lg:px-6 first:lg:pl-0 last:lg:border-r-0 last:lg:pr-0">
      {content}
    </div>
  );
}

/* =========================================================
   QUICK HELP
========================================================= */

function QuickHelp({
  icon: Icon,
  title,
  description,
  href,
  onClick,
}) {
  const className =
    "group flex w-full items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 text-left transition hover:border-blue-100 hover:bg-blue-50/40 hover:shadow-sm";

  const content = (
    <>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-600 transition group-hover:bg-blue-50 group-hover:text-app-primary">
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-bold text-gray-900">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-gray-500">
          {description}
        </p>
      </div>

      <ArrowRight
        size={17}
        className="shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-app-primary"
      />
    </>
  );

  if (href) {
    return (
      <Link
        to={href}
        className={className}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
    >
      {content}
    </button>
  );
}

/* =========================================================
   FORM FIELD
========================================================= */

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-gray-800"
      >
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-app-primary focus:ring-2 focus:ring-app-primary/10"
      />
    </div>
  );
}
