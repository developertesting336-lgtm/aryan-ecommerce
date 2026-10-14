import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { motion, AnimatePresence } from "motion/react";

import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock3,
  Edit3,
  Eye,
  FileImage,
  ImagePlus,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
  Zap,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";

import {
  getHeroSlides,
  getHeroSlideById,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  toggleHeroSlideStatus,
  clearHeroError,
  clearSelectedHero,
} from "../../../../redux/slices/content/homepage/heroSlice";

/* =========================================================
   INITIAL FORM
========================================================= */

const INITIAL_FORM = {
  badge: "",
  title: "",
  highlight: "",
  description: "",
  primaryButtonText: "Shop Now",
  primaryButtonLink: "/products",
  secondaryButtonText: "",
  secondaryButtonLink: "",
  order: 0,
  isActive: true,
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function HeroManagement() {
  const dispatch = useDispatch();

  const fileInputRef = useRef(null);

  /* =======================================================
     REDUX
  ======================================================= */

  const heroState = useSelector(
    (state) => state.hero || {}
  );

  const heroSlides =
    heroState.heroSlides ||
    heroState.items ||
    heroState.slides ||
    heroState.data ||
    [];

  const loading = Boolean(heroState.loading);

  const selectedHero =
    heroState.selectedHero ||
    heroState.selectedHeroSlide ||
    heroState.selectedItem ||
    null;

  const error = heroState.error || null;

  /* =======================================================
     LOCAL STATE
  ======================================================= */

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  const [showPreview, setShowPreview] =
  useState(false);

const [previewSlide, setPreviewSlide] =
  useState(null);

  const [menuId, setMenuId] =
    useState(null);

  const [form, setForm] =
    useState(INITIAL_FORM);

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [previewImage, setPreviewImage] =
    useState("");

  const [formError, setFormError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [togglingId, setTogglingId] =
    useState(null);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    dispatch(getHeroSlides());

    return () => {
      dispatch(clearSelectedHero());
      dispatch(clearHeroError());
    };
  }, [dispatch]);

  /* =======================================================
     OBJECT URL CLEANUP
  ======================================================= */

  useEffect(() => {
    return () => {
      if (
        previewImage &&
        previewImage.startsWith("blob:")
      ) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  /* =======================================================
     FILTERED SLIDES
  ======================================================= */

  const filteredSlides = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...heroSlides]
      .filter((slide) => {
        if (statusFilter === "active") {
          return slide.isActive === true;
        }

        if (statusFilter === "inactive") {
          return slide.isActive === false;
        }

        return true;
      })
      .filter((slide) => {
        if (!query) return true;

        return (
          slide.title
            ?.toLowerCase()
            .includes(query) ||
          slide.highlight
            ?.toLowerCase()
            .includes(query) ||
          slide.badge
            ?.toLowerCase()
            .includes(query) ||
          slide.description
            ?.toLowerCase()
            .includes(query)
        );
      })
      .sort(
        (a, b) =>
          Number(a.order || 0) -
          Number(b.order || 0)
      );
  }, [
    heroSlides,
    search,
    statusFilter,
  ]);

  /* =======================================================
     COUNTS
  ======================================================= */

  const totalCount =
    heroSlides.length;

  const activeCount =
    heroSlides.filter(
      (item) => item.isActive
    ).length;

  const inactiveCount =
    heroSlides.filter(
      (item) => !item.isActive
    ).length;

  /* =======================================================
     INPUT CHANGE
  ======================================================= */

  const handleInputChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setFormError("");
  };

  /* =======================================================
     FILE CHANGE
  ======================================================= */

  const handleFileChange = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError(
        "Please select a valid image file."
      );

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setFormError(
        "Image size must be less than 5MB."
      );

      return;
    }

    if (
      previewImage &&
      previewImage.startsWith("blob:")
    ) {
      URL.revokeObjectURL(
        previewImage
      );
    }

    const objectUrl =
      URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewImage(objectUrl);
    setFormError("");
  };

  /* =======================================================
     REMOVE IMAGE
  ======================================================= */

  const handleRemoveImage = () => {
    if (
      previewImage &&
      previewImage.startsWith("blob:")
    ) {
      URL.revokeObjectURL(
        previewImage
      );
    }

    setSelectedFile(null);
    setPreviewImage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =======================================================
     CREATE
  ======================================================= */

  const handleCreate = () => {
    dispatch(clearSelectedHero());
    dispatch(clearHeroError());

    setEditingId(null);

    setForm({
      ...INITIAL_FORM,
      order: heroSlides.length,
    });

    setSelectedFile(null);
    setPreviewImage("");
    setFormError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setShowForm(true);
  };

  /* =======================================================
     EDIT
  ======================================================= */

  const handleEdit = async (slide) => {
    dispatch(clearHeroError());

    setMenuId(null);

    setEditingId(slide._id);

    setForm({
      badge: slide.badge || "",
      title: slide.title || "",
      highlight: slide.highlight || "",
      description:
        slide.description || "",

      primaryButtonText:
        slide.primaryButtonText ||
        "Shop Now",

      primaryButtonLink:
        slide.primaryButtonLink ||
        "/products",

      secondaryButtonText:
        slide.secondaryButtonText ||
        "",

      secondaryButtonLink:
        slide.secondaryButtonLink ||
        "",

      order:
        slide.order ?? 0,

      isActive:
        slide.isActive !== false,
    });

    setSelectedFile(null);

    setPreviewImage(
      slide.image || ""
    );

    setFormError("");

    setShowForm(true);

    if (slide._id) {
      dispatch(
        getHeroSlideById(slide._id)
      );
    }
  };

  /* =======================================================
     CLOSE FORM
  ======================================================= */

  const closeForm = () => {
    if (submitting) return;

    if (
      previewImage &&
      previewImage.startsWith("blob:")
    ) {
      URL.revokeObjectURL(
        previewImage
      );
    }

    setShowForm(false);
    setEditingId(null);
    setForm(INITIAL_FORM);
    setSelectedFile(null);
    setPreviewImage("");
    setFormError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    dispatch(clearSelectedHero());
    dispatch(clearHeroError());
  };

  /* =======================================================
     VALIDATE
  ======================================================= */

  const validateForm = () => {
    if (!form.title.trim()) {
      return "Hero title is required.";
    }

    if (
      !editingId &&
      !selectedFile
    ) {
      return "Please upload a hero image.";
    }

    if (
      form.primaryButtonText.trim() &&
      !form.primaryButtonLink.trim()
    ) {
      return "Primary button link is required.";
    }

    if (
      form.secondaryButtonText.trim() &&
      !form.secondaryButtonLink.trim()
    ) {
      return "Secondary button link is required.";
    }

    return "";
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setFormError(
        validationError
      );

      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      const formData =
        new FormData();

      /*
       * IMPORTANT:
       * Multer expects the field name "images".
       */

      if (selectedFile) {
        formData.append(
          "images",
          selectedFile
        );
      }

      formData.append(
        "badge",
        form.badge.trim()
      );

      formData.append(
        "title",
        form.title.trim()
      );

      formData.append(
        "highlight",
        form.highlight.trim()
      );

      formData.append(
        "description",
        form.description.trim()
      );

      formData.append(
        "primaryButtonText",
        form.primaryButtonText.trim()
      );

      formData.append(
        "primaryButtonLink",
        form.primaryButtonLink.trim()
      );

      formData.append(
        "secondaryButtonText",
        form.secondaryButtonText.trim()
      );

      formData.append(
        "secondaryButtonLink",
        form.secondaryButtonLink.trim()
      );

      formData.append(
        "order",
        String(form.order)
      );

      formData.append(
        "isActive",
        String(form.isActive)
      );

      if (editingId) {
        await dispatch(
          updateHeroSlide({
            id: editingId,
            data: formData,
          })
        ).unwrap();
      } else {
        await dispatch(
          createHeroSlide(formData)
        ).unwrap();
      }

      await dispatch(
        getHeroSlides()
      ).unwrap();

      closeForm();
    } catch (submitError) {
      setFormError(
        submitError?.message ||
          "Unable to save hero slide."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const openDeleteModal = (slide) => {
    setMenuId(null);
    setDeleteTarget(slide);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;

    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget?._id) {
      return;
    }

    setDeleting(true);

    try {
      await dispatch(
        deleteHeroSlide(
          deleteTarget._id
        )
      ).unwrap();

      await dispatch(
        getHeroSlides()
      ).unwrap();

      closeDeleteModal();
    } catch (deleteError) {
      setFormError(
        deleteError?.message ||
          "Unable to delete hero slide."
      );
    } finally {
      setDeleting(false);
    }
  };

  /* =======================================================
     TOGGLE STATUS
  ======================================================= */

  const handleToggleStatus = async (
    slide
  ) => {
    if (!slide?._id) return;

    setMenuId(null);
    setTogglingId(slide._id);

    try {
      await dispatch(
        toggleHeroSlideStatus(
          slide._id
        )
      ).unwrap();

      await dispatch(
        getHeroSlides()
      ).unwrap();
    } catch (toggleError) {
      setFormError(
        toggleError?.message ||
          "Unable to update slide status."
      );
    } finally {
      setTogglingId(null);
    }
  };

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = async () => {
    await dispatch(
      getHeroSlides()
    );
  };

  /* =======================================================
     PREVIEW
  ======================================================= */

 

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="
        min-h-full
        bg-(--admin-bg)
        text-(--admin-text)
      "
      onClick={() => setMenuId(null)}
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
        {/* =================================================
            HEADER
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: -15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
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
            <button
              type="button"
              onClick={() =>
                window.history.back()
              }
              className="
                mb-3
                inline-flex
                items-center
                gap-1.5
                rounded-lg
                px-2
                py-1.5
                text-xs
                font-semibold
                text-(--admin-text-muted)
                transition-colors
                hover:bg-(--admin-surface-soft)
                hover:text-(--admin-text)
              "
            >
              <ArrowLeft size={14} />
              Back to Content
            </button>

            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-emerald-100
                  text-emerald-600
                  dark:bg-emerald-950/50
                  dark:text-emerald-400
                "
              >
                <FileImage size={20} />
              </div>

              <div>
                <h1
                  className="
                    text-xl
                    font-bold
                    tracking-tight
                    sm:text-2xl
                  "
                >
                  Hero Slides
                </h1>

                <p
                  className="
                    mt-1
                    text-xs
                    text-(--admin-text-muted)
                    sm:text-sm
                  "
                >
                  Manage homepage hero banners
                  and promotional messaging.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              className="
                inline-flex
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
                transition-all
                hover:border-(--admin-primary)
                hover:text-(--admin-primary)
              "
            >
              <RefreshCw size={14} />

              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>

            <button
              type="button"
              onClick={handleCreate}
              className="
                inline-flex
                h-10
                items-center
                justify-center
                gap-2
                rounded-lg
                bg-(--admin-primary)
                px-4
                text-xs
                font-bold
                text-white
                shadow-sm
                transition-all
                hover:-translate-y-0.5
                hover:shadow-md
              "
            >
              <Plus size={15} />

              Add Slide
            </button>
          </div>
        </motion.div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <motion.div
            initial={{
              opacity: 0,
              y: -8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="
              mb-5
              flex
              items-start
              justify-between
              gap-3
              rounded-xl
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-xs
              text-red-700
              dark:border-red-900/50
              dark:bg-red-950/20
              dark:text-red-400
            "
          >
            <div>
              <p className="font-bold">
                Something went wrong
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                dispatch(clearHeroError())
              }
              className="rounded-lg p-1 hover:bg-red-100"
            >
              <X size={15} />
            </button>
          </motion.div>
        )}

        {/* =================================================
            STATS
        ================================================= */}

        <div
          className="
            mb-6
            grid
            grid-cols-2
            gap-3
            lg:grid-cols-4
          "
        >
          <StatCard
            icon={<Zap size={17} />}
            label="Total Slides"
            value={totalCount}
            iconClass="
              bg-blue-100
              text-blue-600
              dark:bg-blue-950/50
              dark:text-blue-400
            "
          />

          <StatCard
            icon={<CheckCircle2 size={17} />}
            label="Active"
            value={activeCount}
            iconClass="
              bg-emerald-100
              text-emerald-600
              dark:bg-emerald-950/50
              dark:text-emerald-400
            "
          />

          <StatCard
            icon={<Clock3 size={17} />}
            label="Inactive"
            value={inactiveCount}
            iconClass="
              bg-amber-100
              text-amber-600
              dark:bg-amber-950/50
              dark:text-amber-400
            "
          />

          <StatCard
            icon={<Eye size={17} />}
            label="Homepage"
            value={
              activeCount > 0
                ? "Live"
                : "Empty"
            }
            iconClass="
              bg-purple-100
              text-purple-600
              dark:bg-purple-950/50
              dark:text-purple-400
            "
          />
        </div>

        {/* =================================================
            FILTERS
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="
            mb-5
            rounded-xl
            border
            border-(--admin-border)
            bg-(--admin-surface)
            p-3
            shadow-(--admin-card-shadow)
            sm:p-4
          "
        >
          <div
            className="
              flex
              flex-col
              gap-3
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            <div className="relative w-full lg:max-w-md">
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
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search hero slides..."
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
                  placeholder:text-(--admin-text-muted)
                  focus:border-(--admin-primary)
                "
              />
            </div>

            <div className="flex items-center gap-2">
              <FilterButton
                active={
                  statusFilter === "all"
                }
                onClick={() =>
                  setStatusFilter("all")
                }
              >
                All
              </FilterButton>

              <FilterButton
                active={
                  statusFilter === "active"
                }
                onClick={() =>
                  setStatusFilter("active")
                }
              >
                Active
              </FilterButton>

              <FilterButton
                active={
                  statusFilter === "inactive"
                }
                onClick={() =>
                  setStatusFilter(
                    "inactive"
                  )
                }
              >
                Inactive
              </FilterButton>
            </div>
          </div>
        </motion.div>

        {/* =================================================
            LIST
        ================================================= */}

        {loading ? (
          <LoadingState />
        ) : filteredSlides.length === 0 ? (
          <EmptyState
            search={search}
            onCreate={handleCreate}
            onClear={() => {
              setSearch("");
              setStatusFilter("all");
            }}
          />
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredSlides.map(
                (slide, index) => (
                  <HeroSlideCard
                    key={slide._id}
                    slide={slide}
                    index={index}
                    menuId={menuId}
                    setMenuId={setMenuId}
                    onEdit={handleEdit}
                    onDelete={
                      openDeleteModal
                    }
                    onToggleStatus={
                      handleToggleStatus
                    }
                    togglingId={
                      togglingId
                    }
                    onPreview={() => {
    setPreviewSlide(slide);
    setShowPreview(true);
  }}
                  />
                )
              )}
            </AnimatePresence>
          </div>
        )}

        {/* =================================================
            PREVIEW
        ================================================= */}

        <AnimatePresence>
          {showPreview &&
            previewSlide && (
              <HeroPreviewModal
                slide={previewSlide}
                onClose={() => {
        setShowPreview(false);
        setPreviewSlide(null);
      }}
              />
            )}
        </AnimatePresence>

        {/* =================================================
            FORM
        ================================================= */}

        <AnimatePresence>
          {showForm && (
            <HeroFormModal
              form={form}
              setForm={setForm}
              selectedFile={selectedFile}
              previewImage={previewImage}
              editingId={editingId}
              submitting={submitting}
              fileInputRef={
                fileInputRef
              }
              onInputChange={
                handleInputChange
              }
              onFileChange={
                handleFileChange
              }
              onRemoveImage={
                handleRemoveImage
              }
              onSubmit={handleSubmit}
              onClose={closeForm}
              formError={formError}
            />
          )}
        </AnimatePresence>

        {/* =================================================
            DELETE
        ================================================= */}

        <AnimatePresence>
          {showDeleteModal &&
            deleteTarget && (
              <DeleteModal
                slide={deleteTarget}
                deleting={deleting}
                onCancel={
                  closeDeleteModal
                }
                onConfirm={
                  handleDelete
                }
              />
            )}
        </AnimatePresence>
      </main>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
  iconClass,
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="
        rounded-xl
        border
        border-(--admin-border)
        bg-(--admin-surface)
        p-4
        shadow-(--admin-card-shadow)
      "
    >
      <div className="flex items-center gap-3">
        <div
          className={`
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-lg
            ${iconClass}
          `}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p
            className="
              text-[10px]
              font-medium
              text-(--admin-text-muted)
            "
          >
            {label}
          </p>

          <p
            className="
              mt-0.5
              truncate
              text-base
              font-bold
              text-(--admin-text)
              sm:text-lg
            "
          >
            {value}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================
   FILTER BUTTON
========================================================= */

function FilterButton({
  active,
  children,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        h-9
        rounded-lg
        px-3
        text-[11px]
        font-bold
        transition-all
        ${
          active
            ? "bg-(--admin-primary) text-white shadow-sm"
            : "bg-(--admin-control-bg) text-(--admin-text-muted) hover:text-(--admin-text)"
        }
      `}
    >
      {children}
    </button>
  );
}

/* =========================================================
   HERO CARD
========================================================= */

function HeroSlideCard({
  slide,
  index,
  menuId,
  setMenuId,
  onEdit,
  onDelete,
  onToggleStatus,
  togglingId,
  onPreview,
}) {
  const isMenuOpen =
    menuId === slide._id;
  return (
    <motion.article
      layout
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -10,
      }}
      transition={{
        duration: 0.3,
        delay: index * 0.04,
      }}
      className="
        group
        overflow-visible
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
          lg:flex-row
        "
      >
        {/* IMAGE */}

        <div
          className="
            relative
            h-52
            w-full
            shrink-0
            overflow-hidden
            rounded-t-xl
            bg-(--admin-surface-soft)
            sm:h-64
            lg:h-48
            lg:w-72
            lg:rounded-l-xl
            lg:rounded-tr-none
            xl:w-80
          "
        >
          {slide.image ? (
            <img
              src={slide.image}
              alt={slide.title}
              className="
                h-full
                w-full
                object-cover
                transition-transform
                duration-500
                group-hover:scale-105
              "
            />
          ) : (
            <div
              className="
                flex
                h-full
                items-center
                justify-center
                text-(--admin-text-muted)
              "
            >
              <FileImage size={35} />
            </div>
          )}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-t
              from-black/50
              via-transparent
              to-transparent
            "
          />

          <div
            className="
              absolute
              left-3
              top-3
              rounded-full
              bg-black/55
              px-2.5
              py-1
              text-[10px]
              font-bold
              text-white
              backdrop-blur-sm
            "
          >
            #{Number(slide.order || 0) + 1}
          </div>

          <div
            className={`
              absolute
              right-3
              top-3
              rounded-full
              px-2.5
              py-1
              text-[10px]
              font-bold
              ${
                slide.isActive
                  ? "bg-emerald-500 text-white"
                  : "bg-black/60 text-white/80"
              }
            `}
          >
            {slide.isActive
              ? "Active"
              : "Inactive"}
          </div>

          <button
            type="button"
            onClick={onPreview}
            className="
              absolute
              bottom-3
              left-3
              inline-flex
              items-center
              gap-1.5
              rounded-lg
              bg-white/90
              px-2.5
              py-1.5
              text-[10px]
              font-bold
              text-gray-800
              opacity-0
              shadow-sm
              backdrop-blur
              transition-opacity
              group-hover:opacity-100
            "
          >
            <Eye size={13} />
            Preview
          </button>
        </div>

        {/* CONTENT */}

        <div className="min-w-0 flex-1 p-5">
          <div
            className="
              flex
              items-start
              justify-between
              gap-4
            "
          >
            <div className="min-w-0 flex-1">
              {slide.badge && (
                <span
                  className="
                    inline-flex
                    rounded-full
                    bg-(--admin-surface-soft)
                    px-2
                    py-1
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-(--admin-primary)
                  "
                >
                  {slide.badge}
                </span>
              )}

              <h2
                className="
                  mt-2
                  truncate
                  text-base
                  font-bold
                  text-(--admin-text)
                  sm:text-lg
                "
              >
                {slide.title}

                {slide.highlight && (
                  <span className="ml-1 text-(--admin-primary)">
                    {slide.highlight}
                  </span>
                )}
              </h2>

              <p
                className="
                  mt-2
                  line-clamp-2
                  max-w-2xl
                  text-xs
                  leading-5
                  text-(--admin-text-muted)
                "
              >
                {slide.description ||
                  "No description added."}
              </p>
            </div>

            {/* MENU */}

            <div className="relative shrink-0">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();

                  setMenuId(
                    isMenuOpen
                      ? null
                      : slide._id
                  );
                }}
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

              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      scale: 0.95,
                      y: -4,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.95,
                      y: -4,
                    }}
                    className="
                      absolute
                      right-0
                      top-10
                      z-50
                      w-44
                      overflow-hidden
                      rounded-xl
                      border
                      border-(--admin-border)
                      bg-(--admin-surface)
                      p-1.5
                      shadow-xl
                    "
                    onClick={(event) =>
                      event.stopPropagation()
                    }
                  >
                    <MenuButton
                      icon={
                        <Pencil size={14} />
                      }
                      onClick={() =>
                        onEdit(slide)
                      }
                    >
                      Edit Slide
                    </MenuButton>

                    <MenuButton
                      icon={
                        slide.isActive ? (
                          <Clock3 size={14} />
                        ) : (
                          <CheckCircle2
                            size={14}
                          />
                        )
                      }
                      onClick={() =>
                        onToggleStatus(
                          slide
                        )
                      }
                      disabled={
                        togglingId ===
                        slide._id
                      }
                    >
                      {togglingId ===
                      slide._id
                        ? "Updating..."
                        : slide.isActive
                        ? "Deactivate"
                        : "Activate"}
                    </MenuButton>

                    <MenuButton
                      danger
                      icon={
                        <Trash2 size={14} />
                      }
                      onClick={() =>
                        onDelete(slide)
                      }
                    >
                      Delete Slide
                    </MenuButton>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div
            className="
              mt-5
              flex
              flex-col
              gap-3
              border-t
              border-(--admin-border)
              pt-4
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div className="flex flex-wrap gap-2">
              <InfoBadge>
                Order{" "}
                {Number(
                  slide.order || 0
                ) + 1}
              </InfoBadge>

              {slide.primaryButtonText && (
                <InfoBadge>
                  {
                    slide.primaryButtonText
                  }
                </InfoBadge>
              )}

              {slide.secondaryButtonText && (
                <InfoBadge>
                  {
                    slide.secondaryButtonText
                  }
                </InfoBadge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onPreview}
                className="
                  inline-flex
                  h-8
                  items-center
                  gap-1.5
                  rounded-lg
                  px-2.5
                  text-[10px]
                  font-bold
                  text-(--admin-text-muted)
                  hover:bg-(--admin-surface-soft)
                "
              >
                <Eye size={13} />
                Preview
              </button>

              <button
                type="button"
                onClick={() =>
                  onEdit(slide)
                }
                className="
                  inline-flex
                  h-8
                  items-center
                  gap-1.5
                  rounded-lg
                  bg-(--admin-primary)
                  px-3
                  text-[10px]
                  font-bold
                  text-white
                  transition-all
                  hover:-translate-y-0.5
                "
              >
                <Edit3 size={13} />
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

/* =========================================================
   MENU BUTTON
========================================================= */

function MenuButton({
  children,
  icon,
  onClick,
  danger = false,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        flex
        w-full
        items-center
        gap-2
        rounded-lg
        px-3
        py-2
        text-left
        text-[11px]
        font-semibold
        transition-colors
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${
          danger
            ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
            : "text-(--admin-text-secondary) hover:bg-(--admin-surface-soft) hover:text-(--admin-text)"
        }
      `}
    >
      {icon}
      {children}
    </button>
  );
}

/* =========================================================
   INFO BADGE
========================================================= */

function InfoBadge({ children }) {
  return (
    <span
      className="
        inline-flex
        items-center
        rounded-md
        bg-(--admin-surface-soft)
        px-2
        py-1
        text-[9px]
        font-semibold
        text-(--admin-text-muted)
      "
    >
      {children}
    </span>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(
        (item) => (
          <div
            key={item}
            className="
              h-48
              animate-pulse
              rounded-xl
              border
              border-(--admin-border)
              bg-(--admin-surface)
            "
          />
        )
      )}
    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyState({
  search,
  onCreate,
  onClear,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="
        flex
        min-h-80
        flex-col
        items-center
        justify-center
        rounded-xl
        border
        border-dashed
        border-(--admin-control-border)
        bg-(--admin-surface)
        px-5
        text-center
      "
    >
      <div
        className="
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          bg-(--admin-surface-soft)
          text-(--admin-primary)
        "
      >
        <ImagePlus size={24} />
      </div>

      <h3
        className="
          mt-4
          text-sm
          font-bold
          text-(--admin-text)
        "
      >
        {search
          ? "No hero slides found"
          : "No hero slides yet"}
      </h3>

      <p
        className="
          mt-2
          max-w-sm
          text-xs
          leading-5
          text-(--admin-text-muted)
        "
      >
        {search
          ? "Try another search term or clear your filters."
          : "Create your first homepage hero slide to start building the storefront."}
      </p>

      <div className="mt-5">
        {search ? (
          <button
            type="button"
            onClick={onClear}
            className="
              inline-flex
              h-9
              items-center
              gap-2
              rounded-lg
              border
              border-(--admin-control-border)
              px-4
              text-xs
              font-bold
            "
          >
            <RefreshCw size={14} />
            Clear Filters
          </button>
        ) : (
          <button
            type="button"
            onClick={onCreate}
            className="
              inline-flex
              h-9
              items-center
              gap-2
              rounded-lg
              bg-(--admin-primary)
              px-4
              text-xs
              font-bold
              text-white
            "
          >
            <Plus size={14} />
            Add First Slide
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* =========================================================
   HERO FORM MODAL
========================================================= */

function HeroFormModal({
  form,
  setForm,
  selectedFile,
  previewImage,
  editingId,
  submitting,
  fileInputRef,
  onInputChange,
  onFileChange,
  onRemoveImage,
  onSubmit,
  onClose,
  formError,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/60
        p-3
        backdrop-blur-sm
        sm:p-5
      "
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{
          opacity: 0,
          y: 25,
          scale: 0.98,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          y: 25,
          scale: 0.98,
        }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 25,
        }}
        className="
          flex
          max-h-[94vh]
          w-full
          max-w-5xl
          flex-col
          overflow-hidden
          rounded-2xl
          border
          border-(--admin-border)
          bg-(--admin-surface)
          shadow-2xl
        "
      >
        {/* HEADER */}

        <div
          className="
            flex
            shrink-0
            items-center
            justify-between
            border-b
            border-(--admin-border)
            px-4
            py-4
            sm:px-6
          "
        >
          <div>
            <div className="flex items-center gap-2">
              <div
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  bg-(--admin-primary)/10
                  text-(--admin-primary)
                "
              >
                <FileImage size={15} />
              </div>

              <h2
                className="
                  text-sm
                  font-bold
                  text-(--admin-text)
                  sm:text-base
                "
              >
                {editingId
                  ? "Edit Hero Slide"
                  : "Create Hero Slide"}
              </h2>
            </div>

            <p
              className="
                mt-1
                text-[10px]
                text-(--admin-text-muted)
                sm:text-xs
              "
            >
              Configure the content and
              appearance of your homepage hero.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              text-(--admin-text-muted)
              hover:bg-(--admin-surface-soft)
              hover:text-(--admin-text)
            "
          >
            <X size={17} />
          </button>
        </div>

        {/* FORM */}

        <form
          onSubmit={onSubmit}
          className="
            min-h-0
            overflow-y-auto
          "
        >
          <div className="p-4 sm:p-6">
            {formError && (
              <div
                className="
                  mb-5
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-3
                  text-xs
                  text-red-600
                  dark:border-red-900/50
                  dark:bg-red-950/20
                  dark:text-red-400
                "
              >
                <p className="font-bold">
                  Unable to save
                </p>

                <p className="mt-1">
                  {formError}
                </p>
              </div>
            )}

            {/* =================================================
                IMAGE + PREVIEW
            ================================================= */}

            <div
              className="
                mb-6
                grid
                grid-cols-1
                gap-5
                xl:grid-cols-[300px_1fr]
              "
            >
              {/* IMAGE UPLOAD */}

              <div>
                <FieldLabel>
                  Hero Image{" "}
                  {!editingId && (
                    <span className="text-red-500">
                      *
                    </span>
                  )}
                </FieldLabel>

                <div
                  className="
                    overflow-hidden
                    rounded-xl
                    border
                    border-(--admin-control-border)
                    bg-(--admin-surface-soft)
                  "
                >
                  {previewImage ? (
                    <div className="relative aspect-[16/10]">
                      <img
                        src={previewImage}
                        alt="Hero"
                        className="
                          h-full
                          w-full
                          object-cover
                        "
                      />

                      <div
                        className="
                          absolute
                          inset-x-0
                          bottom-0
                          flex
                          items-center
                          justify-between
                          bg-gradient-to-t
                          from-black/80
                          to-transparent
                          p-3
                          pt-8
                        "
                      >
                        <span
                          className="
                            max-w-[75%]
                            truncate
                            text-[10px]
                            font-medium
                            text-white
                          "
                        >
                          {selectedFile?.name ||
                            "Current image"}
                        </span>

                        <button
                          type="button"
                          onClick={
                            onRemoveImage
                          }
                          className="
                            flex
                            h-7
                            w-7
                            items-center
                            justify-center
                            rounded-lg
                            bg-white
                            text-red-500
                          "
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      className="
                        flex
                        aspect-[16/10]
                        w-full
                        flex-col
                        items-center
                        justify-center
                        gap-3
                        px-5
                        text-center
                        transition-colors
                        hover:bg-(--admin-control-bg)
                      "
                    >
                      <div
                        className="
                          flex
                          h-12
                          w-12
                          items-center
                          justify-center
                          rounded-xl
                          bg-(--admin-control-bg)
                          text-(--admin-primary)
                        "
                      >
                        <Upload size={20} />
                      </div>

                      <div>
                        <p
                          className="
                            text-xs
                            font-bold
                            text-(--admin-text)
                          "
                        >
                          Upload hero image
                        </p>

                        <p
                          className="
                            mt-1
                            text-[10px]
                            text-(--admin-text-muted)
                          "
                        >
                          JPG, PNG or WEBP
                          <br />
                          Maximum 5MB
                        </p>
                      </div>
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  name="images"
                  accept="image/*"
                  onChange={
                    onFileChange
                  }
                  className="hidden"
                />

                {previewImage && (
                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="
                      mt-2
                      flex
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-lg
                      border
                      border-(--admin-control-border)
                      px-3
                      py-2
                      text-[10px]
                      font-bold
                      text-(--admin-text-secondary)
                      hover:border-(--admin-primary)
                      hover:text-(--admin-primary)
                    "
                  >
                    <Upload size={13} />
                    Replace Image
                  </button>
                )}
              </div>

              {/* LIVE HERO PREVIEW */}

              <div>
                <FieldLabel>
                  Live Preview
                </FieldLabel>

                <HeroLivePreview
                  form={form}
                  image={previewImage}
                />
              </div>
            </div>

            {/* =================================================
                BASIC CONTENT
            ================================================= */}

           {/* =================================================
    HERO CONTENT EDITOR
================================================= */}

<section
  className="
    overflow-hidden
    rounded-2xl
    border
    border-(--admin-border)
    bg-(--admin-surface)
  "
>
  {/* HEADER */}

  <div
    className="
      flex
      items-center
      justify-between
      border-b
      border-(--admin-border)
      px-5
      py-4
      sm:px-6
    "
  >
    <div className="flex items-center gap-3">
      {/* STEP */}

      <div
        className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-(--admin-primary)
          text-xs
          font-black
          text-white
        "
      >
        01
      </div>

      <div>
        <h3
          className="
            text-sm
            font-bold
            tracking-tight
            text-(--admin-text)
          "
        >
          Hero Content
        </h3>

        <p
          className="
            mt-0.5
            text-[10px]
            text-(--admin-text-muted)
          "
        >
          Define the message visitors see first.
        </p>
      </div>
    </div>

    {/* CONTENT TYPE */}

    <span
      className="
        hidden
        rounded-full
        border
        border-(--admin-border)
        bg-(--admin-surface-soft)
        px-2.5
        py-1
        text-[9px]
        font-semibold
        text-(--admin-text-muted)
        sm:inline-flex
      "
    >
      Main Banner
    </span>
  </div>

  {/* CONTENT */}

  <div className="p-5 sm:p-6">

    {/* BADGE */}

    <div className="mb-5">
      <div className="mb-2 flex items-center justify-between">
        <label
          className="
            text-[10px]
            font-bold
            uppercase
            tracking-wider
            text-(--admin-text-secondary)
          "
        >
          Badge
        </label>

        <span
          className="
            text-[9px]
            text-(--admin-text-muted)
          "
        >
          Optional
        </span>
      </div>

      <div className="relative">
        <input
          name="badge"
          value={form.badge}
          onChange={onInputChange}
          placeholder="🔥 Trending Now"
          maxLength={40}
          className="
            FormInput
            h-11
            pl-3
            pr-16
          "
        />

        <span
          className="
            pointer-events-none
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            text-[9px]
            text-(--admin-text-muted)
          "
        >
          {form.badge.length}/40
        </span>
      </div>
    </div>

    {/* MAIN HEADING */}

    <div className="mb-5">
      <div className="mb-2 flex items-center justify-between">
        <label
          className="
            text-[10px]
            font-bold
            uppercase
            tracking-wider
            text-(--admin-text-secondary)
          "
        >
          Main Heading
          <span className="ml-1 text-red-500">
            *
          </span>
        </label>

        <span
          className="
            text-[9px]
            text-(--admin-text-muted)
          "
        >
          Required
        </span>
      </div>

      <input
        name="title"
        value={form.title}
        onChange={onInputChange}
        placeholder="Discover Your Next"
        maxLength={80}
        className="
          FormInput
          h-12
          text-sm
          font-semibold
        "
      />

      <div
        className="
          mt-1.5
          flex
          items-center
          justify-between
        "
      >
        <span
          className="
            text-[9px]
            text-(--admin-text-muted)
          "
        >
          Keep the main heading short and
          impactful.
        </span>

        <span
          className="
            text-[9px]
            tabular-nums
            text-(--admin-text-muted)
          "
        >
          {form.title.length}/80
        </span>
      </div>
    </div>

    {/* HIGHLIGHT */}

    <div className="mb-5">
      <div className="mb-2 flex items-center justify-between">
        <label
          className="
            text-[10px]
            font-bold
            uppercase
            tracking-wider
            text-(--admin-text-secondary)
          "
        >
          Highlighted Text
        </label>

        <span
          className="
            rounded-full
            bg-(--admin-primary)/10
            px-2
            py-0.5
            text-[8px]
            font-bold
            text-(--admin-primary)
          "
        >
          Accent
        </span>
      </div>

      <div
        className="
          relative
          rounded-xl
          border
          border-(--admin-control-border)
          bg-(--admin-control-bg)
          transition-colors
          focus-within:border-(--admin-primary)
          focus-within:ring-2
          focus-within:ring-(--admin-primary)/10
        "
      >
        <input
          name="highlight"
          value={form.highlight}
          onChange={onInputChange}
          placeholder="Favorite Product."
          maxLength={60}
          className="
            h-11
            w-full
            bg-transparent
            px-3
            pr-16
            text-sm
            font-semibold
            text-(--admin-primary)
            outline-none
            placeholder:text-(--admin-text-muted)
          "
        />

        <span
          className="
            pointer-events-none
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            text-[9px]
            text-(--admin-text-muted)
          "
        >
          {form.highlight.length}/60
        </span>
      </div>

      <p
        className="
          mt-1.5
          text-[9px]
          text-(--admin-text-muted)
        "
      >
        This text will appear with your
        storefront accent color.
      </p>
    </div>

    {/* DIVIDER */}

    <div
      className="
        my-5
        h-px
        bg-(--admin-border)
      "
    />

    {/* DESCRIPTION */}

    <div>
      <div className="mb-2 flex items-center justify-between">
        <label
          className="
            text-[10px]
            font-bold
            uppercase
            tracking-wider
            text-(--admin-text-secondary)
          "
        >
          Description
        </label>

        <span
          className="
            text-[9px]
            text-(--admin-text-muted)
          "
        >
          Optional
        </span>
      </div>

      <div
        className="
          relative
          overflow-hidden
          rounded-xl
          border
          border-(--admin-control-border)
          bg-(--admin-control-bg)
          transition-colors
          focus-within:border-(--admin-primary)
          focus-within:ring-2
          focus-within:ring-(--admin-primary)/10
        "
      >
        <textarea
          name="description"
          value={form.description}
          onChange={onInputChange}
          rows={4}
          maxLength={180}
          placeholder="Explore the latest products, trending styles, and everyday essentials — all in one place."
          className="
            min-h-28
            w-full
            resize-none
            bg-transparent
            px-3
            py-3
            text-xs
            leading-5
            text-(--admin-text)
            outline-none
            placeholder:text-(--admin-text-muted)
          "
        />

        <div
          className="
            flex
            items-center
            justify-between
            border-t
            border-(--admin-border)
            px-3
            py-2
          "
        >
          <span
            className="
              text-[9px]
              text-(--admin-text-muted)
            "
          >
            Recommended: 1–2 short sentences
          </span>

          <span
            className="
              text-[9px]
              tabular-nums
              text-(--admin-text-muted)
            "
          >
            {form.description.length}/180
          </span>
        </div>
      </div>
    </div>
  </div>
</section>

            {/* =================================================
                CTA
            ================================================= */}

            <div
              className="
                mt-4
                rounded-xl
                border
                border-(--admin-border)
                bg-(--admin-surface-soft)
                p-4
                sm:p-5
              "
            >
              <div className="mb-4 flex items-center gap-2">
                <div
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-lg
                    bg-(--admin-primary)/10
                    text-(--admin-primary)
                  "
                >
                  <Zap size={14} />
                </div>

                <div>
                  <h3
                    className="
                      text-xs
                      font-bold
                      text-(--admin-text)
                    "
                  >
                    Call To Action
                  </h3>

                  <p
                    className="
                      text-[9px]
                      text-(--admin-text-muted)
                    "
                  >
                    Configure your hero buttons.
                  </p>
                </div>
              </div>

              <div
                className="
                  grid
                  grid-cols-1
                  gap-4
                  md:grid-cols-2
                "
              >
                <div>
                  <FieldLabel>
                    Primary Button
                  </FieldLabel>

                  <input
                    name="primaryButtonText"
                    value={
                      form.primaryButtonText
                    }
                    onChange={
                      onInputChange
                    }
                    placeholder="Shop Now"
                    className="FormInput"
                  />
                </div>

                <div>
                  <FieldLabel>
                    Primary Link
                  </FieldLabel>

                  <input
                    name="primaryButtonLink"
                    value={
                      form.primaryButtonLink
                    }
                    onChange={
                      onInputChange
                    }
                    placeholder="/products"
                    className="FormInput"
                  />
                </div>

                <div>
                  <FieldLabel>
                    Secondary Button
                  </FieldLabel>

                  <input
                    name="secondaryButtonText"
                    value={
                      form.secondaryButtonText
                    }
                    onChange={
                      onInputChange
                    }
                    placeholder="Explore Products"
                    className="FormInput"
                  />
                </div>

                <div>
                  <FieldLabel>
                    Secondary Link
                  </FieldLabel>

                  <input
                    name="secondaryButtonLink"
                    value={
                      form.secondaryButtonLink
                    }
                    onChange={
                      onInputChange
                    }
                    placeholder="/categories"
                    className="FormInput"
                  />
                </div>
              </div>
            </div>

            {/* =================================================
                ORDER + STATUS
            ================================================= */}

            <div
              className="
                mt-4
                grid
                grid-cols-1
                gap-4
                md:grid-cols-2
              "
            >
              <div
                className="
                  rounded-xl
                  border
                  border-(--admin-border)
                  bg-(--admin-surface-soft)
                  p-4
                "
              >
                <FieldLabel>
                  Display Order
                </FieldLabel>

                <input
                  type="number"
                  min="0"
                  name="order"
                  value={form.order}
                  onChange={
                    onInputChange
                  }
                  className="FormInput"
                />

                <p
                  className="
                    mt-1.5
                    text-[9px]
                    text-(--admin-text-muted)
                  "
                >
                  Lower numbers appear first.
                </p>
              </div>

              <div
                className="
                  rounded-xl
                  border
                  border-(--admin-border)
                  bg-(--admin-surface-soft)
                  p-4
                "
              >
                <FieldLabel>
                  Visibility
                </FieldLabel>

                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      isActive:
                        !prev.isActive,
                    }))
                  }
                  className="
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
                    text-left
                    transition-colors
                    hover:border-(--admin-primary)
                  "
                >
                  <div>
                    <p
                      className="
                        text-xs
                        font-semibold
                        text-(--admin-text)
                      "
                    >
                      {form.isActive
                        ? "Active"
                        : "Inactive"}
                    </p>

                    <p
                      className="
                        mt-0.5
                        text-[9px]
                        text-(--admin-text-muted)
                      "
                    >
                      {form.isActive
                        ? "Visible on homepage"
                        : "Hidden from homepage"}
                    </p>
                  </div>

                  {/* SIMPLE TOGGLE */}

                  <span
                    className={`
                      relative
                      flex
                      h-5
                      w-9
                      shrink-0
                      items-center
                      rounded-full
                      transition-colors
                      ${
                        form.isActive
                          ? "bg-(--admin-primary)"
                          : "bg-gray-300 dark:bg-gray-700"
                      }
                    `}
                  >
                    <span
                      className={`
                        absolute
                        h-3.5
                        w-3.5
                        rounded-full
                        bg-white
                        shadow-sm
                        transition-transform
                        ${
                          form.isActive
                            ? "translate-x-[18px]"
                            : "translate-x-[3px]"
                        }
                      `}
                    />
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* FOOTER */}

          <div
            className="
              sticky
              bottom-0
              flex
              flex-col-reverse
              gap-2
              border-t
              border-(--admin-border)
              bg-(--admin-surface)
              p-4
              sm:flex-row
              sm:justify-end
              sm:px-6
            "
          >
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="
                h-10
                rounded-lg
                border
                border-(--admin-control-border)
                bg-(--admin-control-bg)
                px-5
                text-xs
                font-bold
                text-(--admin-text-secondary)
                hover:border-(--admin-primary)
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="
                inline-flex
                h-10
                items-center
                justify-center
                gap-2
                rounded-lg
                bg-(--admin-primary)
                px-5
                text-xs
                font-bold
                text-white
                shadow-sm
                transition-all
                hover:-translate-y-0.5
                hover:shadow-md
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {submitting ? (
                <>
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={14} />
                  {editingId
                    ? "Save Changes"
                    : "Create Slide"}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* =========================================================
   LIVE HERO PREVIEW
   CENTER ALIGNED — MATCHES HERO SECTION
========================================================= */

function HeroLivePreview({
  form,
  image,
}) {
  return (
    <div
      className="
        relative
        aspect-[16/8]
        overflow-hidden
        rounded-xl
        bg-black
        shadow-sm
      "
    >
      {image ? (
        <img
          src={image}
          alt="Hero live preview"
          className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
          "
        />
      ) : (
        <div
          className="
            absolute
            inset-0
            bg-gradient-to-br
            from-gray-800
            to-gray-950
          "
        />
      )}

      <div
        className="
          absolute
          inset-0
          bg-black/45
        "
      />

      {/* CENTER CONTENT */}

      <div
        className="
          absolute
          inset-0
          flex
          flex-col
          items-center
          justify-center
          px-5
          text-center
        "
      >
        {form.badge && (
          <span
            className="
              rounded-full
              bg-white/15
              px-3
              py-1
              text-[8px]
              font-bold
              uppercase
              tracking-wider
              text-white
              backdrop-blur-md
            "
          >
            {form.badge}
          </span>
        )}

        <h3
          className="
            mt-2
            max-w-lg
            text-lg
            font-black
            leading-tight
            text-white
            sm:text-2xl
          "
        >
          {form.title ||
            "Discover Your Next"}

          {form.highlight && (
            <span className="block text">
              {form.highlight}
            </span>
          )}
        </h3>

        {form.description && (
          <p
            className="
              mt-2
              max-w-md
              line-clamp-2
              text-[9px]
              leading-4
              text-white/75
              sm:text-[10px]
            "
          >
            {form.description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {form.primaryButtonText && (
            <span
              className="
                rounded-md
                bg-white
                px-3
                py-1.5
                text-[8px]
                font-bold
                text-black
                sm:px-4
                sm:py-2
              "
            >
              {form.primaryButtonText}
            </span>
          )}

          {form.secondaryButtonText && (
            <span
              className="
                rounded-md
                border
                border-white/30
                bg-white/10
                px-3
                py-1.5
                text-[8px]
                font-bold
                text-white
                backdrop-blur
                sm:px-4
                sm:py-2
              "
            >
              {form.secondaryButtonText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   FIELD LABEL
========================================================= */

function FieldLabel({
  children,
}) {
  return (
    <label
      className="
        mb-1.5
        block
        text-[10px]
        font-bold
        text-(--admin-text-secondary)
      "
    >
      {children}
    </label>
  );
}

/* =========================================================
   PREVIEW MODAL
   CENTER ALIGNED
========================================================= */

function HeroPreviewModal({
  slide,
  onClose,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      className="
        fixed
        inset-0
        z-[60]
        flex
        items-center
        justify-center
        bg-black/75
        p-3
        backdrop-blur-sm
        sm:p-5
      "
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.94,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          scale: 0.94,
        }}
        className="
          relative
          w-full
          max-w-6xl
          overflow-hidden
          rounded-2xl
          bg-black
          shadow-2xl
        "
      >
        <button
          type="button"
          onClick={onClose}
          className="
            absolute
            right-4
            top-4
            z-20
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            bg-black/50
            text-white
            backdrop-blur
            hover:bg-black/70
          "
        >
          <X size={17} />
        </button>

        <div className="relative aspect-[16/7]">
          {slide.image && (
            <img
              src={slide.image}
              alt={slide.title}
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
              "
            />
          )}

          <div
            className="
              absolute
              inset-0
              bg-black/50
            "
          />

          {/* CENTER */}

          <div
            className="
              absolute
              inset-0
              flex
              flex-col
              items-center
              justify-center
              px-5
              text-center
              sm:px-10
            "
          >
            {slide.badge && (
              <span
                className="
                  rounded-full
                  bg-white/15
                  px-3
                  py-1.5
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-white
                  backdrop-blur
                "
              >
                {slide.badge}
              </span>
            )}

            <h2
              className="
                mt-3
                max-w-4xl
                text-2xl
                font-black
                leading-tight
                text-white
                sm:text-4xl
                lg:text-6xl
              "
            >
              {slide.title}

              {slide.highlight && (
                <span className="block text">
                  {slide.highlight}
                </span>
              )}
            </h2>

            {slide.description && (
              <p
                className="
                  mt-4
                  max-w-2xl
                  text-xs
                  leading-5
                  text-white/75
                  sm:text-sm
                "
              >
                {slide.description}
              </p>
            )}

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {slide.primaryButtonText && (
                <span
                  className="
                    rounded-lg
                    bg-white
                    px-4
                    py-2.5
                    text-[11px]
                    font-bold
                    text-black
                  "
                >
                  {
                    slide.primaryButtonText
                  }
                </span>
              )}

              {slide.secondaryButtonText && (
                <span
                  className="
                    rounded-lg
                    border
                    border-white/30
                    bg-white/10
                    px-4
                    py-2.5
                    text-[11px]
                    font-bold
                    text-white
                    backdrop-blur
                  "
                >
                  {
                    slide.secondaryButtonText
                  }
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* =========================================================
   DELETE MODAL
========================================================= */

function DeleteModal({
  slide,
  deleting,
  onCancel,
  onConfirm,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      className="
        fixed
        inset-0
        z-[70]
        flex
        items-center
        justify-center
        bg-black/50
        p-4
        backdrop-blur-sm
      "
    >
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.95,
          y: 10,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.95,
          y: 10,
        }}
        className="
          w-full
          max-w-md
          overflow-hidden
          rounded-2xl
          border
          border-(--admin-border)
          bg-(--admin-surface)
          shadow-2xl
        "
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-red-100
                text-red-600
                dark:bg-red-950/40
                dark:text-red-400
              "
            >
              <Trash2 size={19} />
            </div>

            <div>
              <h3
                className="
                  text-sm
                  font-bold
                  text-(--admin-text)
                  sm:text-base
                "
              >
                Delete hero slide?
              </h3>

              <p
                className="
                  mt-2
                  text-xs
                  leading-5
                  text-(--admin-text-muted)
                "
              >
                This will permanently
                remove{" "}
                <span className="font-bold text-(--admin-text)">
                  {slide.title}
                </span>{" "}
                from your homepage.
              </p>
            </div>
          </div>
        </div>

        <div
          className="
            flex
            flex-col-reverse
            gap-2
            border-t
            border-(--admin-border)
            bg-(--admin-surface-soft)
            p-4
            sm:flex-row
            sm:justify-end
          "
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="
              h-10
              rounded-lg
              border
              border-(--admin-control-border)
              px-5
              text-xs
              font-bold
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="
              inline-flex
              h-10
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-red-500
              px-5
              text-xs
              font-bold
              text-white
              hover:bg-red-600
              disabled:opacity-60
            "
          >
            {deleting ? (
              <>
                <Loader2
                  size={14}
                  className="animate-spin"
                />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={14} />
                Delete Slide
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}