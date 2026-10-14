import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  ArrowUpRight,
  ChevronRight,
  Eye,
  Home,
  Image,
  Layers3,
  LayoutGrid,
  Megaphone,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  FileText,
  Phone,
  CircleHelp,
  ShieldCheck,
  Truck,
  RotateCcw,
  Globe2,
  MoreHorizontal,
  CheckCircle2,
  Clock3,
} from "lucide-react";

import { getHeroSlides } from "../../redux/slices/content/homepage/heroSlice";
import { getPromoCards } from "../../redux/slices/content/homepage/promoCardSlice";
import { getPromoGridItems } from "../../redux/slices/content/homepage/promoGridSlice";
import { getShopByNeedItems } from "../../redux/slices/content/homepage/shopByNeedSlice";

/* =========================================================
   STOREFRONT PAGE DATA
========================================================= */

const storefrontPages = [
  {
    id: "about",
    title: "About Us",
    description:
      "Manage your company story, brand information and business details.",
    icon: FileText,
    path: "/admin/content/about",
    status: "Published",
    iconStyle:
      "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400",
  },
  {
    id: "contact",
    title: "Contact Us",
    description:
      "Manage contact information, support details and business information.",
    icon: Phone,
    path: "/admin/content/contact",
    status: "Published",
    iconStyle:
      "bg-cyan-100 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400",
  },
  {
    id: "faq",
    title: "FAQ",
    description:
      "Manage frequently asked questions and customer support information.",
    icon: CircleHelp,
    path: "/admin/content/faq",
    status: "Published",
    iconStyle:
      "bg-pink-100 text-pink-600 dark:bg-pink-950/50 dark:text-pink-400",
  },
];

/* =========================================================
   POLICY PAGE DATA
========================================================= */

const policyPages = [
  {
    id: "privacy",
    title: "Privacy Policy",
    description:
      "Manage your privacy and data protection information.",
    icon: ShieldCheck,
    path: "/admin/content/privacy-policy",
  },
  {
    id: "terms",
    title: "Terms & Conditions",
    description:
      "Manage terms, conditions and usage rules for your store.",
    icon: FileText,
    path: "/admin/content/terms",
  },
  {
    id: "shipping",
    title: "Shipping Policy",
    description:
      "Manage shipping methods, delivery information and policies.",
    icon: Truck,
    path: "/admin/content/shipping-policy",
  },
  {
    id: "returns",
    title: "Return & Refund",
    description:
      "Manage return, cancellation and refund policy information.",
    icon: RotateCcw,
    path: "/admin/content/return-policy",
  },
];

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function AdminContent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  /* =======================================================
     REDUX
  ======================================================= */

  const heroState = useSelector((state) => state.hero);
  const promoCardState = useSelector((state) => state.promoCard);
  const promoGridState = useSelector((state) => state.promoGrid);
  const shopByNeedState = useSelector(
    (state) => state.shopByNeed
  );

  /*
   * Adjust these if your slice uses a different property name.
   *
   * Expected:
   * state.hero.items
   * state.promoCard.items
   * state.promoGrid.items
   * state.shopByNeed.items
   */

  const heroItems = heroState?.items || [];
  const promoCards = promoCardState?.items || [];
  const promoGrid = promoGridState?.items || [];
  const shopByNeed = shopByNeedState?.items || [];

  /* =======================================================
     FETCH HOMEPAGE CONTENT
  ======================================================= */

  const fetchHomepageContent = () => {
    dispatch(getHeroSlides());
    dispatch(getPromoCards());
    dispatch(getPromoGridItems());
    dispatch(getShopByNeedItems());
  };

  useEffect(() => {
    fetchHomepageContent();
  }, []);

  /* =======================================================
     HOMEPAGE CONTENT CONFIG
  ======================================================= */

  const contentSections = useMemo(
    () => [
      {
        id: "hero",
        title: "Hero Slides",
        description:
          "Manage the main promotional banners displayed at the top of your homepage.",
        count: heroItems.length,
        label: "Active Slides",
        icon: Image,
        iconStyle:
          "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
        path: "/admin/content/hero",
        category: "Homepage",
      },

      {
        id: "promo-cards",
        title: "Promo Cards",
        description:
          "Manage promotional cards for offers, campaigns and product collections.",
        count: promoCards.length,
        label: "Active Cards",
        icon: Megaphone,
        iconStyle:
          "bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
        path: "/admin/content/promo-cards",
        category: "Homepage",
      },

      {
        id: "promo-grid",
        title: "Promo Grid",
        description:
          "Control large, wide and small promotional blocks shown on the homepage.",
        count: promoGrid.length,
        label: "Active Items",
        icon: LayoutGrid,
        iconStyle:
          "bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400",
        path: "/admin/content/promo-grid",
        category: "Homepage",
      },

      {
        id: "shop-by-need",
        title: "Shop by Need",
        description:
          "Manage lifestyle-based shopping sections such as fashion, gaming and fitness.",
        count: shopByNeed.length,
        label: "Active Items",
        icon: Sparkles,
        iconStyle:
          "bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400",
        path: "/admin/content/shop-by-need",
        category: "Homepage",
      },
    ],
    [
      heroItems.length,
      promoCards.length,
      promoGrid.length,
      shopByNeed.length,
    ]
  );

  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredHomepageSections = useMemo(() => {
    if (!search.trim()) {
      return contentSections;
    }

    const query = search.toLowerCase();

    return contentSections.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );
  }, [search, contentSections]);

  const filteredStorefrontPages = useMemo(() => {
    if (!search.trim()) {
      return storefrontPages;
    }

    const query = search.toLowerCase();

    return storefrontPages.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );
  }, [search]);

  const filteredPolicies = useMemo(() => {
    if (!search.trim()) {
      return policyPages;
    }

    const query = search.toLowerCase();

    return policyPages.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );
  }, [search]);

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = async () => {
    if (refreshing) return;

    setRefreshing(true);

    await Promise.all([
      dispatch(getHeroSlides()),
      dispatch(getPromoCards()),
      dispatch(getPromoGridItems()),
      dispatch(getShopByNeedItems()),
    ]);

    setRefreshing(false);
  };

  /* =======================================================
     PREVIEW STOREFRONT
  ======================================================= */

  const handlePreview = () => {
    window.open("/", "_blank", "noopener,noreferrer");
  };

  /* =======================================================
     STATUS COUNTS
  ======================================================= */

  const publishedCount =
    heroItems.filter((item) => item.isActive).length +
    promoCards.filter((item) => item.isActive).length +
    promoGrid.filter((item) => item.isActive).length +
    shopByNeed.filter((item) => item.isActive).length;

  const totalHomepageContent =
    heroItems.length +
    promoCards.length +
    promoGrid.length +
    shopByNeed.length;

  const draftCount = Math.max(
    totalHomepageContent - publishedCount,
    0
  );

  /* =======================================================
     LOADING
  ======================================================= */

  const loading =
    heroState?.loading ||
    promoCardState?.loading ||
    promoGridState?.loading ||
    shopByNeedState?.loading;

  return (
    <div
      className="
        min-h-full
        bg-(--admin-bg)
        text-(--admin-text)
        transition-colors
        duration-200
      "
    >
      <main
        className="
          mx-auto
          w-full
          max-w-375
          p-4
          sm:p-5
          lg:p-6
          xl:p-7
        "
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="
            mb-6
            flex
            flex-col
            gap-4
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          <div>
            <div className="flex items-center gap-2">
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-(--admin-primary)
                  text-white
                  shadow-sm
                "
              >
                <Layers3 size={18} />
              </div>

              <h1
                className="
                  text-xl
                  font-bold
                  tracking-tight
                  text-(--admin-text)
                  sm:text-2xl
                "
              >
                Content Management
              </h1>
            </div>

            <p
              className="
                mt-2
                max-w-2xl
                text-xs
                leading-5
                text-(--admin-text-muted)
                sm:text-sm
              "
            >
              Manage the content, promotional sections and
              information displayed across your storefront.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="
                flex
                h-10
                items-center
                justify-center
                gap-2
                rounded-lg
                border
                border-(--admin-control-border)
                bg-(--admin-control-bg)
                px-3
                text-xs
                font-semibold
                text-(--admin-text-secondary)
                shadow-sm
                transition-all
                duration-200
                hover:border-(--admin-primary)
                hover:text-(--admin-primary)
                disabled:cursor-not-allowed
                disabled:opacity-60
                sm:px-4
              "
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />

              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>

            <button
              onClick={handlePreview}
              className="
                flex
                h-10
                items-center
                justify-center
                gap-2
                rounded-lg
                bg-(--admin-primary)
                px-3
                text-xs
                font-semibold
                text-white
                shadow-sm
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:shadow-md
                sm:px-4
              "
            >
              <Eye size={15} />

              <span>Preview Storefront</span>

              <ArrowUpRight size={14} />
            </button>
          </div>
        </motion.div>

        {/* =====================================================
            SEARCH
        ===================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: 0.05,
          }}
          className="
            mb-7
            flex
            flex-col
            gap-3
            rounded-xl
            border
            border-(--admin-border)
            bg-(--admin-surface)
            p-3
            shadow-(--admin-card-shadow)
            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:p-4
          "
        >
          <div className="relative w-full sm:max-w-md">
            <Search
              size={16}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-(--admin-text-muted)
              "
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search content..."
              className="
                h-10
                w-full
                rounded-lg
                border
                border-(--admin-control-border)
                bg-(--admin-control-bg)
                pl-9
                pr-3
                text-xs
                text-(--admin-text)
                outline-none
                transition-all
                placeholder:text-(--admin-text-muted)
                focus:border-(--admin-primary)
                focus:ring-2
                focus:ring-[color-mix(in_srgb,var(--admin-primary)_12%,transparent)]
              "
            />
          </div>

          <div className="flex items-center gap-4 px-1">
            <StatusInfo
              icon={<CheckCircle2 size={14} />}
              label="Published"
              value={publishedCount}
            />

            <StatusInfo
              icon={<Clock3 size={14} />}
              label="Drafts"
              value={draftCount}
            />
          </div>
        </motion.div>

        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading && (
          <div
            className="
              mb-6
              flex
              items-center
              gap-2
              rounded-lg
              border
              border-(--admin-border)
              bg-(--admin-surface)
              px-4
              py-3
              text-xs
              text-(--admin-text-muted)
            "
          >
            <RefreshCw
              size={14}
              className="animate-spin"
            />

            Loading content...
          </div>
        )}

        {/* =====================================================
            HOMEPAGE
        ===================================================== */}

        <SectionHeader
          icon={<Home size={17} />}
          title="Homepage Content"
          description="Manage the sections displayed on your main storefront."
        />

        <div
          className="
            mb-8
            grid
            grid-cols-1
            gap-4
            md:grid-cols-2
            xl:grid-cols-4
          "
        >
          <AnimatePresence mode="popLayout">
            {filteredHomepageSections.map((item, index) => (
              <ContentCard
                key={item.id}
                item={item}
                index={index}
                onNavigate={navigate}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* =====================================================
            STOREFRONT PAGES
        ===================================================== */}

        <SectionHeader
          icon={<Globe2 size={17} />}
          title="Storefront Pages"
          description="Manage customer-facing pages and business information."
        />

        <div
          className="
            mb-8
            grid
            grid-cols-1
            gap-4
            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          {filteredStorefrontPages.map((item, index) => (
            <PageCard
              key={item.id}
              item={item}
              index={index}
              onNavigate={navigate}
            />
          ))}
        </div>

        {/* =====================================================
            LEGAL / INFORMATION
        ===================================================== */}

        <SectionHeader
          icon={<FileText size={17} />}
          title="Legal & Information"
          description="Manage policies and important customer information."
        />

        <div
          className="
            mb-8
            grid
            grid-cols-1
            gap-4
            md:grid-cols-2
            xl:grid-cols-4
          "
        >
          {filteredPolicies.map((item, index) => (
            <PageCard
              key={item.id}
              item={item}
              index={index}
              onNavigate={navigate}
            />
          ))}
        </div>

        {/* =====================================================
            CUSTOM PAGES
        ===================================================== */}

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
          transition={{ duration: 0.4 }}
          className="
            overflow-hidden
            rounded-xl
            border
            border-(--admin-border)
            bg-(--admin-surface)
            shadow-(--admin-card-shadow)
          "
        >
          <div
            className="
              flex
              flex-col
              gap-4
              p-5
              sm:flex-row
              sm:items-center
              sm:justify-between
              sm:p-6
            "
          >
            <div className="flex items-start gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-(--admin-surface-soft)
                  text-(--admin-primary)
                "
              >
                <FileText size={18} />
              </div>

              <div>
                <h2
                  className="
                    text-sm
                    font-bold
                    text-(--admin-text)
                    sm:text-base
                  "
                >
                  Custom Pages
                </h2>

                <p
                  className="
                    mt-1
                    text-[11px]
                    leading-5
                    text-(--admin-text-muted)
                    sm:text-xs
                  "
                >
                  Create and manage additional storefront
                  pages without changing the application structure.
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                navigate("/admin/content/pages/create")
              }
              className="
                inline-flex
                h-9
                items-center
                justify-center
                gap-2
                rounded-lg
                border
                border-(--admin-control-border)
                bg-(--admin-control-bg)
                px-4
                text-xs
                font-semibold
                text-(--admin-text-secondary)
                transition-all
                duration-200
                hover:border-(--admin-primary)
                hover:text-(--admin-primary)
              "
            >
              <Plus size={15} />
              Create Page
            </button>
          </div>

          <div
            className="
              border-t
              border-(--admin-border)
              bg-(--admin-surface-soft)
              px-5
              py-4
              sm:px-6
            "
          >
            <div
              className="
                flex
                items-start
                gap-3
                text-[11px]
                leading-5
                text-(--admin-text-muted)
                sm:text-xs
              "
            >
              <Sparkles
                size={15}
                className="
                  mt-0.5
                  shrink-0
                  text-(--admin-primary)
                "
              />

              <p>
                Custom pages can be used for content such as
                Our Story, Careers, Sustainability, Affiliate
                Programs or other storefront information.
              </p>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  icon,
  title,
  description,
}) {
  return (
    <div
      className="
        mb-4
        flex
        flex-col
        gap-2
        sm:flex-row
        sm:items-end
        sm:justify-between
      "
    >
      <div>
        <div className="flex items-center gap-2">
          <span
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-lg
              bg-(--admin-surface-soft)
              text-(--admin-primary)
            "
          >
            {icon}
          </span>

          <h2
            className="
              text-base
              font-bold
              tracking-tight
              text-(--admin-text)
              sm:text-lg
            "
          >
            {title}
          </h2>
        </div>

        <p
          className="
            mt-1
            text-[11px]
            text-(--admin-text-muted)
            sm:text-xs
          "
        >
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   STATUS INFO
========================================================= */

function StatusInfo({
  icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-(--admin-success)">
        {icon}
      </span>

      <div>
        <p
          className="
            text-[9px]
            font-medium
            text-(--admin-text-muted)
          "
        >
          {label}
        </p>

        <p
          className="
            text-xs
            font-bold
            text-(--admin-text)
          "
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   HOMEPAGE CONTENT CARD
========================================================= */

function ContentCard({
  item,
  index,
  onNavigate,
}) {
  const Icon = item.icon;

  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.35,
        delay: index * 0.06,
      }}
      whileHover={{
        y: -4,
      }}
      className="
        group
        relative
        overflow-hidden
        rounded-xl
        border
        border-(--admin-border)
        bg-(--admin-surface)
        shadow-(--admin-card-shadow)
        transition-shadow
        duration-300
        hover:shadow-lg
      "
    >
      <div
        className="
          absolute
          inset-x-0
          top-0
          h-0.5
          origin-left
          scale-x-0
          bg-(--admin-primary)
          transition-transform
          duration-300
          group-hover:scale-x-100
        "
      />

      <div className="p-5">
        <div className="flex items-start justify-between">
          <motion.div
            whileHover={{
              rotate: 3,
              scale: 1.05,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 18,
            }}
            className={`
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              ${item.iconStyle}
            `}
          >
            <Icon size={20} />
          </motion.div>

          <button
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              text-(--admin-text-muted)
              transition-colors
              hover:bg-(--admin-surface-soft)
              hover:text-(--admin-text)
            "
          >
            <MoreHorizontal size={17} />
          </button>
        </div>

        <div className="mt-5">
          <h3
            className="
              text-sm
              font-bold
              text-(--admin-text)
            "
          >
            {item.title}
          </h3>

          <p
            className="
              mt-2
              min-h-10
              text-[11px]
              leading-5
              text-(--admin-text-muted)
            "
          >
            {item.description}
          </p>
        </div>

        <div
          className="
            mt-5
            flex
            items-end
            justify-between
            border-t
            border-(--admin-border)
            pt-4
          "
        >
          <div>
            <p
              className="
                text-[10px]
                font-medium
                text-(--admin-text-muted)
              "
            >
              {item.label}
            </p>

            <p
              className="
                mt-0.5
                text-lg
                font-bold
                tracking-tight
                text-(--admin-text)
              "
            >
              {item.count}
            </p>
          </div>

          <button
            onClick={() => onNavigate(item.path)}
            className="
              flex
              items-center
              gap-1
              rounded-lg
              px-2.5
              py-2
              text-[11px]
              font-bold
              text-(--admin-primary)
              transition-all
              duration-200
              hover:bg-(--admin-surface-soft)
            "
          >
            Manage

            <ChevronRight
              size={14}
              className="
                transition-transform
                duration-200
                group-hover:translate-x-0.5
              "
            />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================
   STOREFRONT / POLICY CARD
========================================================= */

function PageCard({
  item,
  index,
  onNavigate,
}) {
  const Icon = item.icon;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 18,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
      transition={{
        duration: 0.35,
        delay: index * 0.05,
      }}
      whileHover={{
        y: -3,
      }}
      className="
        group
        rounded-xl
        border
        border-(--admin-border)
        bg-(--admin-surface)
        p-5
        shadow-(--admin-card-shadow)
        transition-shadow
        duration-300
        hover:shadow-lg
      "
    >
      <div className="flex items-start justify-between">
        <div
          className={`
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            ${
              item.iconStyle ||
              "bg-(--admin-surface-soft) text-(--admin-primary)"
            }
          `}
        >
          <Icon size={18} />
        </div>

        {item.status && (
          <span
            className="
              inline-flex
              items-center
              gap-1
              rounded-full
              bg-[color-mix(in_srgb,var(--admin-success)_10%,transparent)]
              px-2
              py-1
              text-[9px]
              font-bold
              text-(--admin-success)
            "
          >
            <span
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-(--admin-success)
              "
            />

            {item.status}
          </span>
        )}
      </div>

      <h3
        className="
          mt-5
          text-sm
          font-bold
          text-(--admin-text)
        "
      >
        {item.title}
      </h3>

      <p
        className="
          mt-2
          min-h-10
          text-[11px]
          leading-5
          text-(--admin-text-muted)
        "
      >
        {item.description}
      </p>

      <button
        onClick={() => onNavigate(item.path)}
        className="
          mt-5
          flex
          w-full
          items-center
          justify-between
          rounded-lg
          border
          border-(--admin-control-border)
          bg-(--admin-control-bg)
          px-3
          py-2.5
          text-[11px]
          font-bold
          text-(--admin-text-secondary)
          transition-all
          duration-200
          hover:border-(--admin-primary)
          hover:bg-(--admin-surface-soft)
          hover:text-(--admin-primary)
        "
      >
        <span className="flex items-center gap-2">
          <Pencil size={13} />
          Manage Page
        </span>

        <ChevronRight
          size={14}
          className="
            transition-transform
            duration-200
            group-hover:translate-x-0.5
          "
        />
      </button>
    </motion.div>
  );
}