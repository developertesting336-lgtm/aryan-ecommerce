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
  Layers3,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
  LayoutGrid,
  Sparkles,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";

import {
  getPromoGridItems,
  createPromoGridItem,
  updatePromoGridItem,
  deletePromoGridItem,
  togglePromoGridItemStatus,
  clearPromoGridError,
  clearPromoGridStatus,
  clearSelectedPromoGridItem,
} from "../../../../redux/slices/content/homepage/promoGridSlice";

/* =========================================================
   INITIAL FORM
========================================================= */

const INITIAL_FORM = {
  type: "small",
  label: "",
  title: "",
  titleLines: "",
  buttonText: "Shop Now",
  buttonLink: "/products",
  backgroundPosition: "center",
  backgroundSize: "cover",
  gradient: false,
  dark: false,
  isActive: true,
  order: 0,
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function PromoGridManagement() {
  const dispatch = useDispatch();

  const fileInputRef = useRef(null);

  /* =======================================================
     REDUX
  ======================================================= */

  const promoGridState = useSelector(
    (state) => state.promoGrid || {}
  );

  const promoGridItems =
    promoGridState.promoGridItems ||
    promoGridState.items ||
    promoGridState.data ||
    [];

  const loading = Boolean(
    promoGridState.loading
  );

  const error =
    promoGridState.error || null;

  /* =======================================================
     LOCAL STATE
  ======================================================= */

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [typeFilter, setTypeFilter] =
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

  const [previewItem, setPreviewItem] =
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
    dispatch(getPromoGridItems());

    return () => {
      dispatch(
        clearSelectedPromoGridItem()
      );

      dispatch(clearPromoGridError());
      dispatch(clearPromoGridStatus());
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
     FILTERED ITEMS
  ======================================================= */

  const filteredItems = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return [...promoGridItems]
      .filter((item) => {
        if (statusFilter === "active") {
          return item.isActive === true;
        }

        if (statusFilter === "inactive") {
          return item.isActive === false;
        }

        return true;
      })
      .filter((item) => {
        if (typeFilter === "all") {
          return true;
        }

        return item.type === typeFilter;
      })
      .filter((item) => {
        if (!query) {
          return true;
        }

        return (
          item.title
            ?.toLowerCase()
            .includes(query) ||
          item.label
            ?.toLowerCase()
            .includes(query) ||
          item.buttonText
            ?.toLowerCase()
            .includes(query) ||
          item.type
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
    promoGridItems,
    search,
    statusFilter,
    typeFilter,
  ]);

  /* =======================================================
     COUNTS
  ======================================================= */

  const totalCount =
    promoGridItems.length;

  const activeCount =
    promoGridItems.filter(
      (item) => item.isActive
    ).length;

  const inactiveCount =
    promoGridItems.filter(
      (item) => !item.isActive
    ).length;

  const largeCount =
    promoGridItems.filter(
      (item) => item.type === "large"
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
    dispatch(
      clearSelectedPromoGridItem()
    );

    dispatch(clearPromoGridError());
    dispatch(clearPromoGridStatus());

    setEditingId(null);

    setForm({
      ...INITIAL_FORM,
      order: promoGridItems.length,
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

  const handleEdit = (item) => {
    dispatch(clearPromoGridError());
    dispatch(clearPromoGridStatus());

    setMenuId(null);

    setEditingId(item._id);

    setForm({
      type: item.type || "small",

      label:
        item.label || "",

      title:
        item.title || "",

      titleLines:
        Array.isArray(item.titleLines)
          ? item.titleLines.join("\n")
          : item.titleLines || "",

      buttonText:
        item.buttonText || "Shop Now",

      buttonLink:
        item.buttonLink || "/products",

      backgroundPosition:
        item.backgroundPosition ||
        "center",

      backgroundSize:
        item.backgroundSize ||
        "cover",

      gradient:
        item.gradient === true,

      dark:
        item.dark === true,

      isActive:
        item.isActive !== false,

      order:
        item.order ?? 0,
    });

    setSelectedFile(null);

    setPreviewImage(
      getImageUrl(item.image)
    );

    setFormError("");

    setShowForm(true);
  };

  /* =======================================================
     CLOSE FORM
  ======================================================= */

  const closeForm = () => {
    if (submitting) {
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

    setShowForm(false);
    setEditingId(null);
    setForm(INITIAL_FORM);
    setSelectedFile(null);
    setPreviewImage("");
    setFormError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    dispatch(
      clearSelectedPromoGridItem()
    );

    dispatch(clearPromoGridError());
    dispatch(clearPromoGridStatus());
  };

  /* =======================================================
     VALIDATE
  ======================================================= */

  const validateForm = () => {
  if (!form.title.trim()) {
    return "Promo grid title is required.";
  }

  if (
    !editingId &&
    !selectedFile &&
    !form.gradient
  ) {
    return "Please upload an image or enable the gradient background.";
  }

  if (
    form.buttonText.trim() &&
    !form.buttonLink.trim()
  ) {
    return "Button link is required when button text is provided.";
  }

  if (Number(form.order) < 0) {
    return "Display order cannot be negative.";
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
       * Multer expects "images".
       */

      if (selectedFile) {
        formData.append(
          "images",
          selectedFile
        );
      }

      formData.append(
        "type",
        form.type
      );

      formData.append(
        "label",
        form.label.trim()
      );

      formData.append(
        "title",
        form.title.trim()
      );

      /*
       * Backend receives titleLines
       * as repeated FormData values.
       */

      const titleLines =
        form.titleLines
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);

      titleLines.forEach(
        (line) => {
          formData.append(
            "titleLines",
            line
          );
        }
      );

      formData.append(
        "buttonText",
        form.buttonText.trim()
      );

      formData.append(
        "buttonLink",
        form.buttonLink.trim()
      );

      formData.append(
        "backgroundPosition",
        form.backgroundPosition
      );

      formData.append(
        "backgroundSize",
        form.backgroundSize
      );

      formData.append(
        "gradient",
        String(form.gradient)
      );

      formData.append(
        "dark",
        String(form.dark)
      );

      formData.append(
        "isActive",
        String(form.isActive)
      );

      formData.append(
        "order",
        String(form.order)
      );

      if (editingId) {
        await dispatch(
          updatePromoGridItem({
            id: editingId,
            data: formData,
          })
        ).unwrap();
      } else {
        await dispatch(
          createPromoGridItem(
            formData
          )
        ).unwrap();
      }

      await dispatch(
        getPromoGridItems()
      ).unwrap();

      closeForm();
    } catch (submitError) {
      setFormError(
        submitError?.message ||
          "Unable to save promo grid item."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const openDeleteModal = (item) => {
    setMenuId(null);
    setDeleteTarget(item);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deleting) {
      return;
    }

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
        deletePromoGridItem(
          deleteTarget._id
        )
      ).unwrap();

      await dispatch(
        getPromoGridItems()
      ).unwrap();

      closeDeleteModal();
    } catch (deleteError) {
      setFormError(
        deleteError?.message ||
          "Unable to delete promo grid item."
      );
    } finally {
      setDeleting(false);
    }
  };

  /* =======================================================
     TOGGLE STATUS
  ======================================================= */

  const handleToggleStatus = async (
    item
  ) => {
    if (!item?._id) {
      return;
    }

    setMenuId(null);
    setTogglingId(item._id);

    try {
      await dispatch(
        togglePromoGridItemStatus(
          item._id
        )
      ).unwrap();

      await dispatch(
        getPromoGridItems()
      ).unwrap();
    } catch (toggleError) {
      setFormError(
        toggleError?.message ||
          "Unable to update item status."
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
      getPromoGridItems()
    );
  };

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setTypeFilter("all");
  };

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
                  bg-blue-100
                  text-blue-600
                  dark:bg-blue-950/50
                  dark:text-blue-400
                "
              >
                <LayoutGrid size={20} />
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
                  Promo Grid
                </h1>

                <p
                  className="
                    mt-1
                    text-xs
                    text-(--admin-text-muted)
                    sm:text-sm
                  "
                >
                  Manage promotional grid
                  sections on your homepage.
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

              Add Grid Item
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
                dispatch(
                  clearPromoGridError()
                )
              }
              className="
                rounded-lg
                p-1
                hover:bg-red-100
                dark:hover:bg-red-950/40
              "
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
            icon={<Layers3 size={17} />}
            label="Total Items"
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
            icon={<Sparkles size={17} />}
            label="Large Layouts"
            value={largeCount}
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
                placeholder="Search promo grid..."
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

            <div
              className="
                flex
                flex-wrap
                items-center
                gap-2
              "
            >
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

              <div
                className="
                  hidden
                  h-6
                  w-px
                  bg-(--admin-border)
                  sm:block
                "
              />

              <TypeFilterButton
                active={
                  typeFilter === "all"
                }
                onClick={() =>
                  setTypeFilter("all")
                }
              >
                All Types
              </TypeFilterButton>

              <TypeFilterButton
                active={
                  typeFilter === "large"
                }
                onClick={() =>
                  setTypeFilter("large")
                }
              >
                Large
              </TypeFilterButton>

              <TypeFilterButton
                active={
                  typeFilter === "wide"
                }
                onClick={() =>
                  setTypeFilter("wide")
                }
              >
                Wide
              </TypeFilterButton>

              <TypeFilterButton
                active={
                  typeFilter === "small"
                }
                onClick={() =>
                  setTypeFilter("small")
                }
              >
                Small
              </TypeFilterButton>
            </div>
          </div>
        </motion.div>

        {/* =================================================
            LIST
        ================================================= */}

        {loading ? (
          <LoadingState />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            hasFilters={
              Boolean(search) ||
              statusFilter !== "all" ||
              typeFilter !== "all"
            }
            onCreate={handleCreate}
            onClear={clearFilters}
          />
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredItems.map(
                (item, index) => (
                  <PromoGridCard
                    key={item._id}
                    item={item}
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
                      setPreviewItem(item);
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
            previewItem && (
              <PromoGridPreviewModal
                item={previewItem}
                onClose={() => {
                  setShowPreview(false);
                  setPreviewItem(null);
                }}
              />
            )}
        </AnimatePresence>

        {/* =================================================
            FORM
        ================================================= */}

        <AnimatePresence>
          {showForm && (
            <PromoGridFormModal
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
                item={deleteTarget}
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
   IMAGE URL HELPER
========================================================= */

function getImageUrl(image) {
  if (!image) {
    return "";
  }

  if (typeof image === "string") {
    return image;
  }

  if (typeof image === "object") {
    return (
      image.url ||
      image.secure_url ||
      image.src ||
      image.path ||
      image.location ||
      ""
    );
  }

  return "";
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
      whileHover={{
        y: -2,
      }}
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
   TYPE FILTER
========================================================= */

function TypeFilterButton({
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
        border
        px-3
        text-[10px]
        font-bold
        transition-all
        ${
          active
            ? "border-(--admin-primary) bg-(--admin-primary)/10 text-(--admin-primary)"
            : "border-(--admin-control-border) bg-(--admin-control-bg) text-(--admin-text-muted) hover:text-(--admin-text)"
        }
      `}
    >
      {children}
    </button>
  );
}

/* =========================================================
   PROMO GRID CARD
========================================================= */

function PromoGridCard({
  item,
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
    menuId === item._id;

  const imageUrl =
    getImageUrl(item.image);

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
        {/* =================================================
            IMAGE
        ================================================= */}

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
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={item.title}
              className="
                h-full
                w-full
                object-cover
                transition-transform
                duration-500
                group-hover:scale-105
              "
              style={{
                objectPosition:
                  item.backgroundPosition ||
                  "center",
              }}
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

          {/* GRADIENT */}

          {item.gradient && (
            <div
              className="
                pointer-events-none
                absolute
                inset-0
                bg-gradient-to-r
                from-black/65
                via-black/25
                to-transparent
              "
            />
          )}

          {/* DARK */}

          {item.dark && (
            <div
              className="
                pointer-events-none
                absolute
                inset-0
                bg-black/25
              "
            />
          )}

          {/* BOTTOM VIGNETTE */}

          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              bottom-0
              h-20
              bg-gradient-to-t
              from-black/45
              to-transparent
            "
          />

          {/* ORDER */}

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
            #{Number(item.order || 0) + 1}
          </div>

          {/* TYPE */}

          <div
            className="
              absolute
              bottom-3
              left-3
              rounded-full
              bg-black/55
              px-2.5
              py-1
              text-[9px]
              font-bold
              uppercase
              tracking-wide
              text-white
              backdrop-blur-sm
            "
          >
            {item.type || "small"}
          </div>

          {/* STATUS */}

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
                item.isActive
                  ? "bg-emerald-500 text-white"
                  : "bg-black/60 text-white/80"
              }
            `}
          >
            {item.isActive
              ? "Active"
              : "Inactive"}
          </div>

          {/* PREVIEW */}

          <button
            type="button"
            onClick={onPreview}
            className="
              absolute
              bottom-3
              right-3
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

        {/* =================================================
            CONTENT
        ================================================= */}

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
              <div className="flex flex-wrap gap-2">
                {item.label && (
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
                    {item.label}
                  </span>
                )}

                <span
                  className="
                    inline-flex
                    rounded-full
                    border
                    border-(--admin-border)
                    px-2
                    py-1
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-wide
                    text-(--admin-text-muted)
                  "
                >
                  {item.type}
                </span>
              </div>

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
                {item.title}
              </h2>

              {item.titleLines?.length >
                0 && (
                <p
                  className="
                    mt-1
                    text-[10px]
                    text-(--admin-text-muted)
                  "
                >
                  {item.titleLines.join(
                    " • "
                  )}
                </p>
              )}

              <p
                className="
                  mt-3
                  text-xs
                  text-(--admin-text-muted)
                "
              >
                {item.buttonText
                  ? `CTA: ${item.buttonText}`
                  : "No CTA configured."}
              </p>
            </div>

            {/* =================================================
                MENU
            ================================================= */}

            <div className="relative shrink-0">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();

                  setMenuId(
                    isMenuOpen
                      ? null
                      : item._id
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
                        onEdit(item)
                      }
                    >
                      Edit Item
                    </MenuButton>

                    <MenuButton
                      icon={
                        item.isActive ? (
                          <Clock3 size={14} />
                        ) : (
                          <CheckCircle2
                            size={14}
                          />
                        )
                      }
                      onClick={() =>
                        onToggleStatus(
                          item
                        )
                      }
                      disabled={
                        togglingId ===
                        item._id
                      }
                    >
                      {togglingId ===
                      item._id
                        ? "Updating..."
                        : item.isActive
                        ? "Deactivate"
                        : "Activate"}
                    </MenuButton>

                    <MenuButton
                      danger
                      icon={
                        <Trash2 size={14} />
                      }
                      onClick={() =>
                        onDelete(item)
                      }
                    >
                      Delete Item
                    </MenuButton>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* =================================================
              DETAILS
          ================================================= */}

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
                  item.order || 0
                ) + 1}
              </InfoBadge>

              <InfoBadge>
                {item.backgroundSize ||
                  "cover"}
              </InfoBadge>

              {item.gradient && (
                <InfoBadge>
                  Gradient
                </InfoBadge>
              )}

              {item.dark && (
                <InfoBadge>
                  Dark
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
                  onEdit(item)
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

function InfoBadge({
  children,
}) {
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
  hasFilters,
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
        {hasFilters
          ? "No promo grid items found"
          : "No promo grid items yet"}
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
        {hasFilters
          ? "Try another search term or clear your filters."
          : "Create your first promotional grid item to start building the storefront."}
      </p>

      <div className="mt-5">
        {hasFilters ? (
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
            Add First Item
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* =========================================================
   PROMO GRID FORM MODAL
========================================================= */

function PromoGridFormModal({
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
        {/* =================================================
            HEADER
        ================================================= */}

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
                <LayoutGrid size={15} />
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
                  ? "Edit Promo Grid Item"
                  : "Create Promo Grid Item"}
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
              Configure promotional content,
              layout and visual treatment.
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

        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={onSubmit}
          className="
            min-h-0
            overflow-y-auto
          "
        >
          <div className="p-4 sm:p-6">
            {/* =================================================
                ERROR
            ================================================= */}

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
              {/* IMAGE */}

              <div>
                <FieldLabel>
                  Promo Image{" "}
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
                        alt="Promo"
                        className="
                          h-full
                          w-full
                          object-cover
                        "
                        style={{
                          objectPosition:
                            form.backgroundPosition,
                          objectFit:
                            form.backgroundSize ===
                            "contain"
                              ? "contain"
                              : "cover",
                        }}
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
                          Upload promo image
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

              {/* LIVE PREVIEW */}

              <div>
                <FieldLabel>
                  Live Preview
                </FieldLabel>

                <PromoGridLivePreview
                  form={form}
                  image={previewImage}
                />
              </div>
            </div>

            {/* =================================================
                PROMO CONTENT
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
                      Promo Content
                    </h3>

                    <p
                      className="
                        mt-0.5
                        text-[10px]
                        text-(--admin-text-muted)
                      "
                    >
                      Define the message displayed
                      inside this promotion.
                    </p>
                  </div>
                </div>

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
                  Homepage Promotion
                </span>
              </div>

              <div className="p-5 sm:p-6">
                {/* TYPE */}

                <div className="mb-5">
                  <FieldLabel>
                    Layout Type
                  </FieldLabel>

                  <div
                    className="
                      grid
                      grid-cols-1
                      gap-2
                      sm:grid-cols-3
                    "
                  >
                    <LayoutTypeOption
                      value="large"
                      label="Large"
                      description="Large feature block"
                      active={
                        form.type ===
                        "large"
                      }
                      onClick={() =>
                        setForm(
                          (prev) => ({
                            ...prev,
                            type: "large",
                          })
                        )
                      }
                    />

                    <LayoutTypeOption
                      value="wide"
                      label="Wide"
                      description="Horizontal promotion"
                      active={
                        form.type ===
                        "wide"
                      }
                      onClick={() =>
                        setForm(
                          (prev) => ({
                            ...prev,
                            type: "wide",
                          })
                        )
                      }
                    />

                    <LayoutTypeOption
                      value="small"
                      label="Small"
                      description="Compact promotion"
                      active={
                        form.type ===
                        "small"
                      }
                      onClick={() =>
                        setForm(
                          (prev) => ({
                            ...prev,
                            type: "small",
                          })
                        )
                      }
                    />
                  </div>
                </div>

                {/* LABEL */}

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
                      Label
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

                  <input
                    name="label"
                    value={form.label}
                    onChange={
                      onInputChange
                    }
                    placeholder="New Arrival"
                    maxLength={40}
                    className="
                      FormInput
                      h-11
                    "
                  />
                </div>

                {/* TITLE */}

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
                    onChange={
                      onInputChange
                    }
                    placeholder="Upgrade Your Everyday"
                    maxLength={100}
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
                      Keep promotional headings
                      short and clear.
                    </span>

                    <span
                      className="
                        text-[9px]
                        tabular-nums
                        text-(--admin-text-muted)
                      "
                    >
                      {form.title.length}/100
                    </span>
                  </div>
                </div>

                {/* TITLE LINES */}

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
                      Title Lines
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
                      Optional
                    </span>
                  </div>

                  <textarea
                    name="titleLines"
                    value={
                      form.titleLines
                    }
                    onChange={
                      onInputChange
                    }
                    rows={3}
                    placeholder={
                      "Upgrade Your Everyday\nWith Something Better"
                    }
                    className="
                      min-h-24
                      w-full
                      resize-none
                      rounded-xl
                      border
                      border-(--admin-control-border)
                      bg-(--admin-control-bg)
                      px-3
                      py-3
                      text-xs
                      leading-5
                      text-(--admin-text)
                      outline-none
                      transition-colors
                      placeholder:text-(--admin-text-muted)
                      focus:border-(--admin-primary)
                      focus:ring-2
                      focus:ring-(--admin-primary)/10
                    "
                  />

                  <p
                    className="
                      mt-1.5
                      text-[9px]
                      text-(--admin-text-muted)
                    "
                  >
                    Enter one title line per
                    row. React will decide how
                    these lines are rendered.
                  </p>
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
                  <Sparkles size={14} />
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
                    Configure the promotional
                    button.
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
                    Button Text
                  </FieldLabel>

                  <input
                    name="buttonText"
                    value={
                      form.buttonText
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
                    Button Link
                  </FieldLabel>

                  <input
                    name="buttonLink"
                    value={
                      form.buttonLink
                    }
                    onChange={
                      onInputChange
                    }
                    placeholder="/products"
                    className="FormInput"
                  />
                </div>
              </div>
            </div>

            {/* =================================================
                IMAGE SETTINGS
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
                  <FileImage size={14} />
                </div>

                <div>
                  <h3
                    className="
                      text-xs
                      font-bold
                      text-(--admin-text)
                    "
                  >
                    Image Settings
                  </h3>

                  <p
                    className="
                      text-[9px]
                      text-(--admin-text-muted)
                    "
                  >
                    Control how the image is
                    positioned inside the grid.
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
                {/* POSITION */}

                <div>
                  <FieldLabel>
                    Background Position
                  </FieldLabel>

                  <select
                    name="backgroundPosition"
                    value={
                      form.backgroundPosition
                    }
                    onChange={
                      onInputChange
                    }
                    className="FormInput"
                  >
                    <option value="center">
                      Center
                    </option>

                    <option value="top">
                      Top
                    </option>

                    <option value="bottom">
                      Bottom
                    </option>

                    <option value="left">
                      Left
                    </option>

                    <option value="right">
                      Right
                    </option>

                    <option value="center top">
                      Center Top
                    </option>

                    <option value="center bottom">
                      Center Bottom
                    </option>
                  </select>

                  <p
                    className="
                      mt-1.5
                      text-[9px]
                      text-(--admin-text-muted)
                    "
                  >
                    Controls which portion of
                    the image remains visible.
                  </p>
                </div>

                {/* SIZE */}

                <div>
                  <FieldLabel>
                    Background Size
                  </FieldLabel>

                  <select
                    name="backgroundSize"
                    value={
                      form.backgroundSize
                    }
                    onChange={
                      onInputChange
                    }
                    className="FormInput"
                  >
                    <option value="cover">
                      Cover
                    </option>

                    <option value="contain">
                      Contain
                    </option>
                  </select>

                  <p
                    className="
                      mt-1.5
                      text-[9px]
                      text-(--admin-text-muted)
                    "
                  >
                    Cover fills the area;
                    contain preserves the
                    complete image.
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                VISUAL SETTINGS
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
                  <Sparkles size={14} />
                </div>

                <div>
                  <h3
                    className="
                      text-xs
                      font-bold
                      text-(--admin-text)
                    "
                  >
                    Visual Treatment
                  </h3>

                  <p
                    className="
                      text-[9px]
                      text-(--admin-text-muted)
                    "
                  >
                    These are configuration flags.
                    The actual visual styles remain
                    inside React.
                  </p>
                </div>
              </div>

              <div
                className="
                  grid
                  grid-cols-1
                  gap-3
                  md:grid-cols-2
                "
              >
                {/* GRADIENT */}

                <VisualToggle
                  title="Gradient Overlay"
                  description={
                    form.gradient
                      ? "Gradient overlay enabled."
                      : "No gradient overlay."
                  }
                  active={
                    form.gradient
                  }
                  onClick={() =>
                    setForm(
                      (prev) => ({
                        ...prev,
                        gradient:
                          !prev.gradient,
                      })
                    )
                  }
                />

                {/* DARK */}

                <VisualToggle
                  title="Dark Treatment"
                  description={
                    form.dark
                      ? "Dark image treatment enabled."
                      : "Normal image treatment."
                  }
                  active={
                    form.dark
                  }
                  onClick={() =>
                    setForm(
                      (prev) => ({
                        ...prev,
                        dark:
                          !prev.dark,
                      })
                    )
                  }
                />
              </div>
            </div>

            {/* =================================================
                ORDER + VISIBILITY
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
              {/* ORDER */}

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

              {/* VISIBILITY */}

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
                    setForm(
                      (prev) => ({
                        ...prev,
                        isActive:
                          !prev.isActive,
                      })
                    )
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

          {/* =================================================
              FOOTER
          ================================================= */}

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
                    : "Create Item"}
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
   LAYOUT TYPE OPTION
========================================================= */

function LayoutTypeOption({
  value,
  label,
  description,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-xl
        border
        p-3
        text-left
        transition-all
        ${
          active
            ? "border-(--admin-primary) bg-(--admin-primary)/5 ring-2 ring-(--admin-primary)/10"
            : "border-(--admin-control-border) bg-(--admin-control-bg) hover:border-(--admin-primary)/50"
        }
      `}
    >
      <div className="flex items-center justify-between">
        <span
          className="
            text-xs
            font-bold
            text-(--admin-text)
          "
        >
          {label}
        </span>

        {active && (
          <span
            className="
              flex
              h-5
              w-5
              items-center
              justify-center
              rounded-full
              bg-(--admin-primary)
              text-white
            "
          >
            <Check size={12} />
          </span>
        )}
      </div>

      <p
        className="
          mt-1
          text-[9px]
          leading-4
          text-(--admin-text-muted)
        "
      >
        {description}
      </p>

      <div className="mt-3">
        {value === "large" && (
          <div
            className="
              h-7
              w-full
              rounded-md
              bg-(--admin-surface-soft)
            "
          />
        )}

        {value === "wide" && (
          <div
            className="
              h-5
              w-full
              rounded-md
              bg-(--admin-surface-soft)
            "
          />
        )}

        {value === "small" && (
          <div
            className="
              h-7
              w-1/2
              rounded-md
              bg-(--admin-surface-soft)
            "
          />
        )}
      </div>
    </button>
  );
}

/* =========================================================
   VISUAL TOGGLE
========================================================= */

function VisualToggle({
  title,
  description,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex
        w-full
        items-center
        justify-between
        rounded-xl
        border
        border-(--admin-control-border)
        bg-(--admin-control-bg)
        px-3
        py-3
        text-left
        transition-colors
        hover:border-(--admin-primary)
      "
    >
      <div className="min-w-0 pr-3">
        <p
          className="
            text-xs
            font-semibold
            text-(--admin-text)
          "
        >
          {title}
        </p>

        <p
          className="
            mt-0.5
            text-[9px]
            leading-4
            text-(--admin-text-muted)
          "
        >
          {description}
        </p>
      </div>

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
            active
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
              active
                ? "translate-x-[18px]"
                : "translate-x-[3px]"
            }
          `}
        />
      </span>
    </button>
  );
}

/* =========================================================
   LIVE PREVIEW
========================================================= */

function PromoGridLivePreview({
  form,
  image,
}) {
  const isLarge =
    form.type === "large";

  const isWide =
    form.type === "wide";

  return (
    <div
      className={`
        relative
        overflow-hidden
        rounded-xl
        bg-black
        shadow-sm
        ${
          isLarge
            ? "aspect-[16/10]"
            : isWide
            ? "aspect-[16/7]"
            : "aspect-[16/9]"
        }
      `}
    >
      {image ? (
        <img
          src={image}
          alt="Promo live preview"
          className="
            absolute
            inset-0
            h-full
            w-full
          "
          style={{
            objectFit:
              form.backgroundSize ===
              "contain"
                ? "contain"
                : "cover",
            objectPosition:
              form.backgroundPosition,
          }}
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

      {/* GRADIENT */}

      {form.gradient && (
        <div
          className="
            absolute
            inset-0
            bg-gradient-to-r
            from-black/70
            via-black/25
            to-transparent
          "
        />
      )}

      {/* DARK */}

      {form.dark && (
        <div
          className="
            absolute
            inset-0
            bg-black/30
          "
        />
      )}

      {/* DEFAULT CONTRAST */}

      {!form.gradient &&
        !form.dark && (
          <div
            className="
              absolute
              inset-0
              bg-gradient-to-t
              from-black/45
              via-transparent
              to-transparent
            "
          />
        )}

      {/* CONTENT */}

      <div
        className={`
          absolute
          inset-0
          flex
          flex-col
          justify-end
          ${
            isLarge
              ? "p-5"
              : isWide
              ? "p-4"
              : "p-3"
          }
        `}
      >
        {form.label && (
          <span
            className="
              mb-2
              w-fit
              rounded-full
              bg-white/15
              px-2
              py-1
              text-[7px]
              font-bold
              uppercase
              tracking-wide
              text-white
              backdrop-blur-md
            "
          >
            {form.label}
          </span>
        )}

        <h3
          className={`
            max-w-[90%]
            font-black
            leading-tight
            text-white
            ${
              isLarge
                ? "text-xl"
                : isWide
                ? "text-base"
                : "text-sm"
            }
          `}
        >
          {form.title ||
            "Your Promotional Title"}
        </h3>

        {form.titleLines && (
          <p
            className="
              mt-1
              text-[7px]
              leading-3
              text-white/65
            "
          >
            {form.titleLines
              .split("\n")
              .filter(Boolean)
              .join(" • ")}
          </p>
        )}

        {form.buttonText && (
          <span
            className="
              mt-3
              w-fit
              rounded-md
              bg-white
              px-3
              py-1.5
              text-[8px]
              font-bold
              text-black
            "
          >
            {form.buttonText}
          </span>
        )}
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
========================================================= */

function PromoGridPreviewModal({
  item,
  onClose,
}) {
  const imageUrl =
    getImageUrl(item.image);

  const titleLines =
    Array.isArray(item.titleLines)
      ? item.titleLines
      : [];

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
        {/* CLOSE */}

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

        {/* PREVIEW */}

        <div
          className={`
            relative
            ${
              item.type === "large"
                ? "aspect-[16/9]"
                : item.type === "wide"
                ? "aspect-[16/7]"
                : "aspect-[16/8]"
            }
          `}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={item.title}
              className="
                absolute
                inset-0
                h-full
                w-full
              "
              style={{
                objectFit:
                  item.backgroundSize ===
                  "contain"
                    ? "contain"
                    : "cover",
                objectPosition:
                  item.backgroundPosition ||
                  "center",
              }}
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

          {/* GRADIENT */}

          {item.gradient && (
            <div
              className="
                absolute
                inset-0
                bg-gradient-to-r
                from-black/75
                via-black/30
                to-transparent
              "
            />
          )}

          {/* DARK */}

          {item.dark && (
            <div
              className="
                absolute
                inset-0
                bg-black/35
              "
            />
          )}

          {!item.gradient &&
            !item.dark && (
              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-black/55
                  via-transparent
                  to-transparent
                "
              />
            )}

          {/* CONTENT */}

          <div
            className="
              absolute
              inset-0
              flex
              flex-col
              justify-end
              p-6
              sm:p-10
            "
          >
            {item.label && (
              <span
                className="
                  mb-3
                  w-fit
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
                {item.label}
              </span>
            )}

            <h2
              className={`
                max-w-4xl
                font-black
                leading-tight
                text-white
                ${
                  item.type === "large"
                    ? "text-3xl sm:text-5xl lg:text-6xl"
                    : item.type === "wide"
                    ? "text-2xl sm:text-4xl"
                    : "text-xl sm:text-3xl"
                }
              `}
            >
              {item.title}

              {titleLines.length >
                0 && (
                <span className="mt-2 block text-white/80">
                  {titleLines.join(" ")}
                </span>
              )}
            </h2>

            {item.buttonText && (
              <div className="mt-5">
                <span
                  className="
                    inline-flex
                    rounded-lg
                    bg-white
                    px-4
                    py-2.5
                    text-[11px]
                    font-bold
                    text-black
                  "
                >
                  {item.buttonText}
                </span>
              </div>
            )}
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
  item,
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
                Delete promo grid item?
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
                  {item.title}
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
                Delete Item
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}