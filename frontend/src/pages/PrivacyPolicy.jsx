import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Cookie,
  Database,
  Eye,
  FileText,
  LockKeyhole,
  Mail,
  ShieldCheck,
  ShoppingBag,
  UserRound,
} from "lucide-react";

/* =========================================================
   PRIVACY POLICY SECTIONS
========================================================= */

const sections = [
  {
    id: "overview",
    number: "01",
    title: "Overview",
    icon: FileText,
  },
  {
    id: "information",
    number: "02",
    title: "Information We Collect",
    icon: Database,
  },
  {
    id: "usage",
    number: "03",
    title: "How We Use Your Information",
    icon: Eye,
  },
  {
    id: "sharing",
    number: "04",
    title: "Information Sharing",
    icon: UserRound,
  },
  {
    id: "cookies",
    number: "05",
    title: "Cookies & Tracking",
    icon: Cookie,
  },
  {
    id: "payments",
    number: "06",
    title: "Payments & Security",
    icon: LockKeyhole,
  },
  {
    id: "retention",
    number: "07",
    title: "Data Retention",
    icon: Database,
  },
  {
    id: "rights",
    number: "08",
    title: "Your Privacy Rights",
    icon: ShieldCheck,
  },
  {
    id: "children",
    number: "09",
    title: "Children's Privacy",
    icon: UserRound,
  },
  {
    id: "changes",
    number: "10",
    title: "Policy Changes",
    icon: FileText,
  },
  {
    id: "contact",
    number: "11",
    title: "Contact Us",
    icon: Mail,
  },
];

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] =
    useState("overview");

  const [mobileTocOpen, setMobileTocOpen] =
    useState(false);

  /* =======================================================
     ACTIVE SECTION OBSERVER
  ======================================================= */

  useEffect(() => {
    const elements = sections
      .map((section) =>
        document.getElementById(section.id)
      )
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              b.intersectionRatio -
              a.intersectionRatio
          )[0];

        if (visibleEntry) {
          setActiveSection(
            visibleEntry.target.id
          );
        }
      },
      {
        rootMargin: "-120px 0px -55% 0px",
        threshold: [0.1, 0.25, 0.5],
      }
    );

    elements.forEach((element) =>
      observer.observe(element)
    );

    return () => observer.disconnect();
  }, []);

  /* =======================================================
     SCROLL TO SECTION
  ======================================================= */

  const scrollToSection = (id) => {
    const element =
      document.getElementById(id);

    if (!element) return;

    const headerOffset = 110;

    const elementPosition =
      element.getBoundingClientRect().top +
      window.scrollY;

    window.scrollTo({
      top:
        elementPosition -
        headerOffset,
      behavior: "smooth",
    });

    setActiveSection(id);
    setMobileTocOpen(false);
  };

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden border-b border-gray-100 bg-gray-50">
        {/* Decorative background */}

        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-app-primary/10 blur-3xl" />

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

            <ChevronRight
              size={15}
              className="text-gray-400"
            />

            <span className="font-medium text-gray-800">
              Privacy Policy
            </span>
          </div>

          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3.5 py-1.5 text-xs font-semibold text-app-primary shadow-sm">
              <ShieldCheck size={15} />

              Your privacy matters
            </div>

            <h1 className="text-4xl font-black tracking-[-0.04em] text-gray-950 sm:text-5xl lg:text-6xl">
              Privacy
              <span className="text-app-primary">
                {" "}
                Policy
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">
              We believe shopping online should
              feel simple, secure, and transparent.
              This Privacy Policy explains how
              NovaCart collects, uses, protects,
              and manages your information.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-500">
              <span>
                <strong className="text-gray-800">
                  Effective date:
                </strong>{" "}
                October 6, 2026
              </span>

              <span className="hidden h-1 w-1 rounded-full bg-gray-300 sm:block" />

              <span>
                <strong className="text-gray-800">
                  Last updated:
                </strong>{" "}
                October 6, 2026
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          QUICK TRUST CARDS
      ====================================================== */}

      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 divide-y divide-gray-100 px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-8">
          <TrustCard
            icon={LockKeyhole}
            title="Secure by design"
            text="We use appropriate safeguards to protect your information."
          />

          <TrustCard
            icon={Eye}
            title="Clear & transparent"
            text="We explain what information we collect and why we need it."
          />

          <TrustCard
            icon={ShieldCheck}
            title="Your control"
            text="You have rights over how your personal information is handled."
          />
        </div>
      </section>

      {/* =====================================================
          CONTENT AREA
      ====================================================== */}

      <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        {/* ===================================================
            MOBILE TABLE OF CONTENTS
        ==================================================== */}

        <div className="mb-8 lg:hidden">
          <button
            type="button"
            onClick={() =>
              setMobileTocOpen(
                (current) => !current
              )
            }
            className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-4 text-left shadow-sm"
          >
            <span>
              <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-app-primary">
                On this page
              </span>

              <span className="mt-1 block text-sm font-semibold text-gray-900">
                {
                  sections.find(
                    (section) =>
                      section.id ===
                      activeSection
                  )?.title
                }
              </span>
            </span>

            <ChevronDown
              size={19}
              className={`text-gray-500 transition-transform ${
                mobileTocOpen
                  ? "rotate-180"
                  : ""
              }`}
            />
          </button>

          {mobileTocOpen && (
            <div className="mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              {sections.map((section) => {
                const Icon = section.icon;
                const active =
                  activeSection ===
                  section.id;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() =>
                      scrollToSection(
                        section.id
                      )
                    }
                    className={`flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3.5 text-left last:border-b-0 ${
                      active
                        ? "bg-blue-50 text-app-primary"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon
                      size={17}
                      className={
                        active
                          ? "text-app-primary"
                          : "text-gray-400"
                      }
                    />

                    <span className="flex-1 text-sm font-medium">
                      {section.title}
                    </span>

                    <span className="text-xs text-gray-400">
                      {section.number}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,820px)] xl:gap-20">
          {/* =================================================
              DESKTOP TABLE OF CONTENTS
          ================================================== */}

          <aside className="hidden lg:block">
            <div className="sticky top-[150px]">
              <p className="mb-4 px-3 text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
                On this page
              </p>

              <nav className="space-y-1">
                {sections.map(
                  (section) => {
                    const Icon =
                      section.icon;

                    const active =
                      activeSection ===
                      section.id;

                    return (
                      <button
                        key={
                          section.id
                        }
                        type="button"
                        onClick={() =>
                          scrollToSection(
                            section.id
                          )
                        }
                        className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                          active
                            ? "bg-blue-50 font-semibold text-app-primary"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-950"
                        }`}
                      >
                        <Icon
                          size={16}
                          className={
                            active
                              ? "text-app-primary"
                              : "text-gray-400 group-hover:text-gray-700"
                          }
                        />

                        <span className="flex-1">
                          {section.title}
                        </span>

                        <span
                          className={`text-[10px] ${
                            active
                              ? "text-app-primary"
                              : "text-gray-400"
                          }`}
                        >
                          {
                            section.number
                          }
                        </span>
                      </button>
                    );
                  }
                )}
              </nav>

              {/* HELP CARD */}

              <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50/60 p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-app-primary shadow-sm">
                  <Mail size={17} />
                </div>

                <h3 className="mt-4 text-sm font-bold text-gray-950">
                  Have a question?
                </h3>

                <p className="mt-1.5 text-xs leading-5 text-gray-600">
                  Our support team is here
                  to help with privacy
                  questions.
                </p>

                <Link
                  to="/contact"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-app-primary hover:underline"
                >
                  Contact support
                  <ArrowRight
                    size={14}
                  />
                </Link>
              </div>
            </div>
          </aside>

          {/* =================================================
              POLICY CONTENT
          ================================================== */}

          <article className="min-w-0">
            {/* INTRODUCTION */}

            <PolicySection
              id="overview"
              number="01"
              title="Overview"
            >
              <p>
                Welcome to NovaCart. This Privacy
                Policy explains how NovaCart
                collects, uses, stores, and protects
                information when you visit our
                website, create an account, purchase
                products, or otherwise use our
                services.
              </p>

              <p>
                By using NovaCart, you acknowledge
                that you have read and understood
                this Privacy Policy. If you do not
                agree with our practices, please
                discontinue use of our services.
              </p>

              <InfoBox>
                <strong>
                  Important:
                </strong>{" "}
                NovaCart only collects information
                that is reasonably necessary to
                provide, improve, secure, and
                personalize your shopping
                experience.
              </InfoBox>
            </PolicySection>

            {/* INFORMATION */}

            <PolicySection
              id="information"
              number="02"
              title="Information We Collect"
            >
              <p>
                Depending on how you interact with
                NovaCart, we may collect the
                following categories of information.
              </p>

              <h3>
                Information you provide
              </h3>

              <BulletList
                items={[
                  "Name and contact details such as email address and phone number.",
                  "Account information including login credentials and profile details.",
                  "Shipping and billing information required to process an order.",
                  "Information you provide when contacting customer support.",
                  "Product reviews, ratings, feedback, or other content you submit.",
                ]}
              />

              <h3>
                Information collected automatically
              </h3>

              <BulletList
                items={[
                  "IP address and general device information.",
                  "Browser type, operating system, and device characteristics.",
                  "Pages, products, and features you interact with.",
                  "Search queries and general browsing activity on our website.",
                  "Technical information used to maintain website security and performance.",
                ]}
              />

              <h3>
                Order information
              </h3>

              <p>
                When you place an order, we collect
                information necessary to fulfill the
                transaction, including purchased
                products, quantities, delivery
                information, order status, and
                relevant transaction identifiers.
              </p>
            </PolicySection>

            {/* USAGE */}

            <PolicySection
              id="usage"
              number="03"
              title="How We Use Your Information"
            >
              <p>
                We use collected information only
                for legitimate business and service
                purposes, including:
              </p>

              <BulletList
                items={[
                  "Creating and managing your NovaCart account.",
                  "Processing and fulfilling orders.",
                  "Arranging shipping and delivery.",
                  "Processing payments through authorized payment providers.",
                  "Providing customer support and responding to inquiries.",
                  "Sending important transactional notifications.",
                  "Improving our website, products, services, and user experience.",
                  "Detecting, preventing, and investigating fraud or unauthorized activity.",
                  "Maintaining website security and preventing abuse.",
                  "Understanding general usage trends and website performance.",
                ]}
              />

              <p>
                Where required by applicable law,
                we may also process information to
                comply with legal obligations or
                respond to lawful requests from
                authorities.
              </p>
            </PolicySection>

            {/* SHARING */}

            <PolicySection
              id="sharing"
              number="04"
              title="Information Sharing"
            >
              <p>
                We do not sell your personal
                information as a standalone product.
                We may share limited information with
                trusted service providers when it is
                necessary to operate NovaCart.
              </p>

              <h3>
                Service providers
              </h3>

              <p>
                Depending on your order and use of
                the platform, information may be
                shared with providers responsible for:
              </p>

              <BulletList
                items={[
                  "Payment processing.",
                  "Order fulfillment and logistics.",
                  "Website hosting and infrastructure.",
                  "Email, SMS, or transactional notifications.",
                  "Analytics and website performance.",
                  "Fraud detection and security.",
                  "Customer support tools.",
                ]}
              />

              <h3>
                Legal requirements
              </h3>

              <p>
                We may disclose information where
                reasonably necessary to comply with
                applicable laws, court orders,
                regulatory requirements, legal
                processes, or to protect the rights,
                safety, and security of NovaCart,
                our users, or others.
              </p>
            </PolicySection>

            {/* COOKIES */}

            <PolicySection
              id="cookies"
              number="05"
              title="Cookies & Tracking"
            >
              <p>
                NovaCart may use cookies and similar
                technologies to provide essential
                website functionality and improve
                your shopping experience.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  icon={Cookie}
                  title="Essential cookies"
                  text="Used for login sessions, shopping cart functionality, security, and core website features."
                />

                <FeatureCard
                  icon={Eye}
                  title="Preference cookies"
                  text="Help remember settings and preferences so your experience can be more convenient."
                />

                <FeatureCard
                  icon={Database}
                  title="Analytics"
                  text="May help us understand website usage and improve performance."
                />

                <FeatureCard
                  icon={ShieldCheck}
                  title="Security"
                  text="Help detect suspicious activity and protect accounts and transactions."
                />
              </div>

              <p>
                You can manage or disable cookies
                through your browser settings.
                However, disabling certain cookies
                may affect some features of the
                website.
              </p>
            </PolicySection>

            {/* PAYMENTS */}

            <PolicySection
              id="payments"
              number="06"
              title="Payments & Security"
            >
              <p>
                Payment information is processed
                through authorized payment providers
                and payment infrastructure. NovaCart
                does not intentionally store complete
                payment card credentials on its own
                application servers when the payment
                provider handles that information.
              </p>

              <InfoBox>
                <div className="flex items-start gap-3">
                  <LockKeyhole
                    size={19}
                    className="mt-0.5 shrink-0 text-app-primary"
                  />

                  <span>
                    We use reasonable technical and
                    organizational measures designed
                    to protect personal information
                    against unauthorized access,
                    alteration, disclosure, or
                    destruction.
                  </span>
                </div>
              </InfoBox>

              <p>
                No online service can guarantee
                absolute security. If we become aware
                of a security incident that requires
                notification under applicable law, we
                will take appropriate steps to respond
                and notify affected users where
                required.
              </p>
            </PolicySection>

            {/* RETENTION */}

            <PolicySection
              id="retention"
              number="07"
              title="Data Retention"
            >
              <p>
                We retain personal information only
                for as long as reasonably necessary
                for the purposes described in this
                policy, including providing services,
                maintaining transaction records,
                resolving disputes, preventing fraud,
                and meeting legal or accounting
                obligations.
              </p>

              <p>
                When information is no longer needed,
                we may securely delete, anonymize, or
                otherwise dispose of it in accordance
                with applicable requirements.
              </p>
            </PolicySection>

            {/* RIGHTS */}

            <PolicySection
              id="rights"
              number="08"
              title="Your Privacy Rights"
            >
              <p>
                Depending on applicable law and your
                location, you may have rights relating
                to your personal information.
              </p>

              <div className="space-y-3">
                {[
                  "Request access to personal information we hold about you.",
                  "Request correction of inaccurate or incomplete information.",
                  "Request deletion of certain personal information.",
                  "Request information about how your personal data is processed.",
                  "Withdraw consent where processing is based on consent.",
                  "Object to or restrict certain types of processing where legally applicable.",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/70 p-3.5"
                  >
                    <CheckCircle2
                      size={17}
                      className="mt-0.5 shrink-0 text-app-primary"
                    />

                    <span className="text-sm leading-6 text-gray-700">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <p>
                To exercise an applicable privacy
                right, please contact us using the
                details provided in the Contact Us
                section below. We may need to verify
                your identity before processing certain
                requests.
              </p>
            </PolicySection>

            {/* CHILDREN */}

            <PolicySection
              id="children"
              number="09"
              title="Children's Privacy"
            >
              <p>
                NovaCart is intended for general
                consumers and is not knowingly
                designed to collect personal
                information from children who are not
                legally permitted to use our services.
              </p>

              <p>
                If you believe that a child has
                provided personal information to us
                without appropriate authorization,
                please contact us so that we can
                investigate and take appropriate
                action.
              </p>
            </PolicySection>

            {/* CHANGES */}

            <PolicySection
              id="changes"
              number="10"
              title="Policy Changes"
            >
              <p>
                We may update this Privacy Policy
                from time to time to reflect changes
                in our services, technology, legal
                requirements, or business practices.
              </p>

              <p>
                When we make changes, we will update
                the "Last updated" date at the top of
                this page. We encourage you to review
                this policy periodically.
              </p>
            </PolicySection>

            {/* CONTACT */}

            <PolicySection
              id="contact"
              number="11"
              title="Contact Us"
              last
            >
              <p>
                If you have questions about this
                Privacy Policy, your personal
                information, or how NovaCart handles
                privacy requests, please contact our
                support team.
              </p>

              <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                <div className="border-b border-gray-200 bg-white px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-app-primary">
                      <Mail size={19} />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-gray-950">
                        Privacy Support
                      </p>

                      <p className="text-xs text-gray-500">
                        We are happy to help.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 px-5 py-5 sm:px-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Email
                    </p>

                    <a
                      href="mailto:privacy@novacart.com"
                      className="mt-1 block text-sm font-semibold text-app-primary hover:underline"
                    >
                      privacy@novacart.com
                    </a>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Website
                    </p>

                    <Link
                      to="/"
                      className="mt-1 block text-sm font-semibold text-gray-900 hover:text-app-primary"
                    >
                      NovaCart
                    </Link>
                  </div>
                </div>
              </div>
            </PolicySection>

            {/* =================================================
                FINAL NOTE
            ================================================== */}

            <div className="mt-10 rounded-2xl bg-app-primary p-6 text-white sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <ShoppingBag
                      size={19}
                    />

                    <span className="font-bold">
                      Shop with confidence
                    </span>
                  </div>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                    Your privacy and security are
                    important to us. Thank you for
                    trusting NovaCart.
                  </p>
                </div>

                <Link
                  to="/products"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-app-primary transition hover:bg-blue-50"
                >
                  Continue shopping
                  <ArrowRight
                    size={16}
                  />
                </Link>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   POLICY SECTION
========================================================= */

function PolicySection({
  id,
  number,
  title,
  children,
  last = false,
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-28 ${
        last
          ? ""
          : "border-b border-gray-100 pb-10 sm:pb-12"
      } ${id !== "overview" ? "pt-10 sm:pt-12" : ""}`}
    >
      <div className="mb-6 flex items-start gap-4">
        <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-blue-50 px-2 text-xs font-bold text-app-primary">
          {number}
        </span>

        <div>
          <h2 className="text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl">
            {title}
          </h2>
        </div>
      </div>

      <div className="space-y-5 text-[15px] leading-7 text-gray-600 sm:text-base sm:leading-8">
        {children}
      </div>
    </section>
  );
}

/* =========================================================
   BULLET LIST
========================================================= */

function BulletList({ items }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-3"
        >
          <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-app-primary" />

          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/* =========================================================
   INFO BOX
========================================================= */

function InfoBox({ children }) {
  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-4 text-sm leading-6 text-gray-700 sm:px-5">
      {children}
    </div>
  );
}

/* =========================================================
   TRUST CARD
========================================================= */

function TrustCard({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="flex items-start gap-4 px-0 py-5 sm:px-6 sm:py-6 first:sm:pl-0 last:sm:pr-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-app-primary">
        <Icon size={19} />
      </div>

      <div>
        <h3 className="text-sm font-bold text-gray-950">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-gray-500">
          {text}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   FEATURE CARD
========================================================= */

function FeatureCard({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-app-primary shadow-sm">
        <Icon size={17} />
      </div>

      <h4 className="mt-3 text-sm font-bold text-gray-900">
        {title}
      </h4>

      <p className="mt-1.5 text-xs leading-5 text-gray-500">
        {text}
      </p>
    </div>
  );
}
