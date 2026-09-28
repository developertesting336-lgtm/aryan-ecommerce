import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { AnimatePresence, motion } from "motion/react";

import {
  Check,
  CheckCircle2,
  Clock3,
  Edit3,
  Eye,
  FileImage,
  ImagePlus,
  Loader2,
  MoreHorizontal,
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
  getPromoCards,
  getPromoCardById,
  createPromoCard,
  updatePromoCard,
  deletePromoCard,
  togglePromoCardStatus,
  clearPromoCardError,
  clearSelectedPromoCard,
} from "../../../../redux/slices/content/homepage/promoCardSlice";


/*
 * =========================================
 * INITIAL FORM
 * =========================================
 */

const INITIAL_FORM = {
  eyebrow: "",
  title: "",
  description: "",
  buttonText: "Shop Now",
  buttonLink: "/products",
  imagePosition: "center",
  overlay: true,
  order: 0,
  isActive: true,
};


/*
 * =========================================
 * INPUT CLASS
 * =========================================
 */

const INPUT_CLASS = `
  h-11
  w-full
  rounded-xl
  border
  border-(--admin-control-border)
  bg-white
  px-3
  text-sm
  text-(--admin-text)
  outline-none
  transition-all
  duration-200
  placeholder:text-(--admin-text-muted)
  focus:border-(--admin-primary)
  focus:ring-2
  focus:ring-(--admin-primary)/10
  dark:bg-slate-800
`;


/*
 * =========================================
 * MAIN COMPONENT
 * =========================================
 */

const PromoCardsManagement = () => {
  const dispatch = useDispatch();

  /*
   * =========================================
   * REDUX
   * =========================================
   */

  const promoCardState = useSelector(
    (state) => state.promoCard || {}
  );

  const promoCards =
    promoCardState.promoCards ||
    promoCardState.items ||
    promoCardState.cards ||
    promoCardState.data ||
    [];

  const loading = Boolean(
    promoCardState.loading
  );

  const error =
    promoCardState.error || null;

  const selectedPromoCard =
    promoCardState.selectedPromoCard ||
    promoCardState.selectedItem ||
    null;


  /*
   * =========================================
   * FILTER / UI STATE
   * =========================================
   */

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

  const [previewCard, setPreviewCard] =
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


  /*
   * =========================================
   * INITIAL LOAD
   * =========================================
   */

  useEffect(() => {
    dispatch(getPromoCards());

    return () => {
      dispatch(clearSelectedPromoCard());
      dispatch(clearPromoCardError());
    };
  }, [dispatch]);


  /*
   * =========================================
   * FILTERED CARDS
   * =========================================
   */

  const filteredCards = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return [...promoCards]
      .filter((card) => {
        if (statusFilter === "active") {
          return card.isActive === true;
        }

        if (statusFilter === "inactive") {
          return card.isActive === false;
        }

        return true;
      })
      .filter((card) => {
        if (!query) return true;

        return (
          card.title
            ?.toLowerCase()
            .includes(query) ||
          card.eyebrow
            ?.toLowerCase()
            .includes(query) ||
          card.description
            ?.toLowerCase()
            .includes(query) ||
          card.buttonText
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
    promoCards,
    search,
    statusFilter,
  ]);


  /*
   * =========================================
   * CREATE
   * =========================================
   */

  const handleCreate = () => {
    dispatch(clearPromoCardError());

    setEditingId(null);

    setForm({
      ...INITIAL_FORM,
      order: promoCards.length,
    });

    setSelectedFile(null);
    setPreviewImage("");
    setFormError("");

    setShowForm(true);
  };


  /*
   * =========================================
   * EDIT
   * =========================================
   */

  const handleEdit = async (card) => {
    dispatch(clearPromoCardError());

    setMenuId(null);

    setEditingId(card._id);

    setForm({
      eyebrow: card.eyebrow || "",
      title: card.title || "",
      description:
        card.description || "",
      buttonText:
        card.buttonText || "Shop Now",
      buttonLink:
        card.buttonLink || "/products",
      imagePosition:
        card.imagePosition || "center",
      overlay:
        card.overlay !== false,
      order:
        Number(card.order || 0),
      isActive:
        card.isActive !== false,
    });

    setSelectedFile(null);

    setPreviewImage(
      card.image || ""
    );

    setFormError("");
    setShowForm(true);

    if (card._id) {
      dispatch(
        getPromoCardById(card._id)
      );
    }
  };


  /*
   * =========================================
   * INPUT CHANGE
   * =========================================
   */

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setFormError("");
  };


  /*
   * =========================================
   * IMAGE CHANGE
   * =========================================
   */

  const handleImageChange = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError(
        "Please select a valid image file."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError(
        "Image size must be less than 5MB."
      );
      return;
    }

    setSelectedFile(file);

    setPreviewImage(
      URL.createObjectURL(file)
    );

    setFormError("");
  };


  /*
   * =========================================
   * SUBMIT
   * =========================================
   */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");

    if (!form.title.trim()) {
      setFormError(
        "Promo card title is required."
      );
      return;
    }

    if (
      !editingId &&
      !selectedFile &&
      !previewImage
    ) {
      setFormError(
        "Please select a promo card image."
      );
      return;
    }

    try {
      setSubmitting(true);

      const formData =
        new FormData();

      formData.append(
        "eyebrow",
        form.eyebrow.trim()
      );

      formData.append(
        "title",
        form.title.trim()
      );

      formData.append(
        "description",
        form.description.trim()
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
        "imagePosition",
        form.imagePosition
      );

      formData.append(
        "overlay",
        String(form.overlay)
      );

      formData.append(
        "order",
        String(form.order)
      );

      formData.append(
        "isActive",
        String(form.isActive)
      );

      /*
       * IMPORTANT:
       *
       * Your Multer configuration
       * uses "images".
       */
      if (selectedFile) {
        formData.append(
          "images",
          selectedFile
        );
      }

      if (editingId) {
        await dispatch(
          updatePromoCard({
            id: editingId,
            data: formData,
          })
        ).unwrap();
      } else {
        await dispatch(
          createPromoCard(formData)
        ).unwrap();
      }

      await dispatch(
        getPromoCards()
      ).unwrap();

      closeForm(true);
    } catch (submitError) {
      console.error(
        "Promo card save error:",
        submitError
      );

      setFormError(
        submitError ||
          "Failed to save promo card."
      );
    } finally {
      setSubmitting(false);
    }
  };


  /*
   * =========================================
   * CLOSE FORM
   * =========================================
   */

  const closeForm = (force = false) => {
    if (submitting && !force) {
      return;
    }

    setShowForm(false);
    setEditingId(null);
    setSelectedFile(null);
    setPreviewImage("");
    setFormError("");

    setForm(INITIAL_FORM);
  };


  /*
   * =========================================
   * DELETE
   * =========================================
   */

  const openDeleteModal = (card) => {
    setDeleteTarget(card);
    setMenuId(null);
    setShowDeleteModal(true);
  };


  const closeDeleteModal = (
    force = false
  ) => {
    if (deleting && !force) {
      return;
    }

    setShowDeleteModal(false);
    setDeleteTarget(null);
  };


  const handleDelete = async () => {
    if (!deleteTarget?._id) {
      return;
    }

    try {
      setDeleting(true);

      await dispatch(
        deletePromoCard(
          deleteTarget._id
        )
      ).unwrap();

      await dispatch(
        getPromoCards()
      ).unwrap();

      closeDeleteModal(true);
    } catch (deleteError) {
      console.error(
        "Promo card delete error:",
        deleteError
      );
    } finally {
      setDeleting(false);
    }
  };


  /*
   * =========================================
   * TOGGLE STATUS
   * =========================================
   */

  const handleToggleStatus = async (
    card
  ) => {
    if (!card?._id) return;

    try {
      setTogglingId(card._id);
      setMenuId(null);

      await dispatch(
        togglePromoCardStatus(
          card._id
        )
      ).unwrap();

      await dispatch(
        getPromoCards()
      ).unwrap();
    } catch (toggleError) {
      console.error(
        "Promo card status error:",
        toggleError
      );
    } finally {
      setTogglingId(null);
    }
  };


  /*
   * =========================================
   * PREVIEW
   * =========================================
   */

  const handlePreview = (card) => {
    setPreviewCard(card);
    setShowPreview(true);
    setMenuId(null);
  };


  /*
   * =========================================
   * IMAGE URL CLEANUP
   * =========================================
   */

  useEffect(() => {
    return () => {
      if (
        previewImage &&
        previewImage.startsWith("blob:")
      ) {
        URL.revokeObjectURL(
          previewImage
        );
      }
    };
  }, [previewImage]);


  /*
   * =========================================
   * COUNTS
   * =========================================
   */

  const activeCount = promoCards.filter(
    (card) => card.isActive
  ).length;

  const inactiveCount =
    promoCards.length -
    activeCount;


  return (
    <div className="min-h-screen bg-(--admin-bg) p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">

        {/* =====================================
            HEADER
        ====================================== */}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--admin-primary)/10 text-(--admin-primary)">
                <Zap size={16} />
              </div>

              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-(--admin-text-muted)">
                Homepage Content
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-(--admin-text) sm:text-3xl">
              Promo Cards
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-(--admin-text-muted)">
              Manage promotional cards displayed
              across your storefront homepage.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                dispatch(getPromoCards())
              }
              disabled={loading}
              className="
                inline-flex
                h-10
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-(--admin-control-border)
                bg-(--admin-control-bg)
                px-4
                text-sm
                font-medium
                text-(--admin-text)
                transition-all
                hover:bg-(--admin-hover)
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              <RefreshCw
                size={16}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
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
                rounded-xl
                bg-(--admin-primary)
                px-4
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition-all
                hover:-translate-y-0.5
                hover:shadow-md
              "
            >
              <Plus size={17} />

              Add Promo Card
            </button>
          </div>
        </div>


        {/* =====================================
            STATS
        ====================================== */}

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">

          <StatCard
            icon={<FileImage size={18} />}
            label="Total Cards"
            value={promoCards.length}
          />

          <StatCard
            icon={<CheckCircle2 size={18} />}
            label="Active"
            value={activeCount}
          />

          <StatCard
            icon={<Clock3 size={18} />}
            label="Inactive"
            value={inactiveCount}
          />

        </div>


        {/* =====================================
            ERROR
        ====================================== */}

        <AnimatePresence>
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
              exit={{
                opacity: 0,
                y: -8,
              }}
              className="
                mb-5
                flex
                items-start
                justify-between
                gap-4
                rounded-xl
                border
                border-red-500/20
                bg-red-500/5
                px-4
                py-3
                text-sm
                text-red-600
              "
            >
              <span>{error}</span>

              <button
                type="button"
                onClick={() =>
                  dispatch(
                    clearPromoCardError()
                  )
                }
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>


        {/* =====================================
            FILTER BAR
        ====================================== */}

        <div
          className="
            mb-6
            flex
            flex-col
            gap-3
            rounded-2xl
            border
            border-(--admin-border)
            bg-(--admin-card)
            p-3
            shadow-sm

            lg:flex-row
            lg:items-center
          "
        >

          <div className="relative flex-1">
            <Search
              size={17}
              className="
                pointer-events-none
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-(--admin-text-muted)
              "
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search promo cards..."
              className={`${INPUT_CLASS} pl-10`}
            />
          </div>


          <div className="flex items-center gap-1 rounded-xl bg-(--admin-control-bg) p-1">

            {[
              {
                value: "all",
                label: "All",
              },
              {
                value: "active",
                label: "Active",
              },
              {
                value: "inactive",
                label: "Inactive",
              },
            ].map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() =>
                  setStatusFilter(
                    filter.value
                  )
                }
                className={`
                  rounded-lg
                  px-3
                  py-2
                  text-xs
                  font-medium
                  transition-all

                  ${
                    statusFilter ===
                    filter.value
                      ? "bg-(--admin-card) text-(--admin-text) shadow-sm"
                      : "text-(--admin-text-muted) hover:text-(--admin-text)"
                  }
                `}
              >
                {filter.label}
              </button>
            ))}

          </div>

        </div>


        {/* =====================================
            CONTENT
        ====================================== */}

        {loading && !promoCards.length ? (
          <LoadingState />
        ) : filteredCards.length === 0 ? (
          <EmptyState
            hasSearch={
              Boolean(search) ||
              statusFilter !== "all"
            }
            onCreate={handleCreate}
          />
        ) : (
          <div
            className="
              grid
              grid-cols-1
              gap-5

              sm:grid-cols-2

              xl:grid-cols-3

              2xl:grid-cols-4
            "
          >
            {filteredCards.map(
              (card, index) => (
                <PromoCardItem
                  key={
                    card._id || index
                  }
                  card={card}
                  index={index}
                  menuId={menuId}
                  setMenuId={setMenuId}
                  onEdit={handleEdit}
                  onDelete={
                    openDeleteModal
                  }
                  onPreview={
                    handlePreview
                  }
                  onToggleStatus={
                    handleToggleStatus
                  }
                  togglingId={
                    togglingId
                  }
                />
              )
            )}
          </div>
        )}

      </div>


      {/* =======================================
          FORM MODAL
      ======================================== */}

      <AnimatePresence>
        {showForm && (
          <PromoCardFormModal
            form={form}
            editingId={editingId}
            previewImage={previewImage}
            selectedFile={selectedFile}
            formError={formError}
            submitting={submitting}
            onChange={handleChange}
            onImageChange={
              handleImageChange
            }
            onSubmit={handleSubmit}
            onClose={() =>
              closeForm()
            }
          />
        )}
      </AnimatePresence>


      {/* =======================================
          DELETE MODAL
      ======================================== */}

      <AnimatePresence>
        {showDeleteModal &&
          deleteTarget && (
            <DeleteModal
              card={deleteTarget}
              deleting={deleting}
              onClose={() =>
                closeDeleteModal()
              }
              onDelete={handleDelete}
            />
          )}
      </AnimatePresence>


      {/* =======================================
          PREVIEW MODAL
      ======================================== */}

      <AnimatePresence>
        {showPreview &&
          previewCard && (
            <PromoCardPreviewModal
              card={previewCard}
              onClose={() => {
                setShowPreview(false);
                setPreviewCard(null);
              }}
            />
          )}
      </AnimatePresence>

    </div>
  );
};


/*
 * =========================================
 * STAT CARD
 * =========================================
 */

const StatCard = ({
  icon,
  label,
  value,
}) => {
  return (
    <div
      className="
        rounded-2xl
        border
        border-(--admin-border)
        bg-(--admin-card)
        p-4
        shadow-sm
      "
    >
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-(--admin-primary)/10 text-(--admin-primary)">
        {icon}
      </div>

      <p className="text-xs font-medium text-(--admin-text-muted)">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-(--admin-text)">
        {value}
      </p>
    </div>
  );
};


/*
 * =========================================
 * PROMO CARD ITEM
 * =========================================
 */

const PromoCardItem = ({
  card,
  index,
  menuId,
  setMenuId,
  onEdit,
  onDelete,
  onPreview,
  onToggleStatus,
  togglingId,
}) => {
  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.25,
        delay: index * 0.04,
      }}
      className="
        group
        overflow-hidden
        rounded-2xl
        border
        border-(--admin-border)
        bg-(--admin-card)
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-lg
      "
    >

      {/* IMAGE */}

      <div className="relative h-52 overflow-hidden bg-(--admin-control-bg)">

        {card.image ? (
          <img
            src={card.image}
            alt={
              card.title ||
              "Promo card"
            }
            className={`
              h-full
              w-full
              object-cover
              transition-transform
              duration-500
              group-hover:scale-105
            `}
            style={{
              objectPosition:
                card.imagePosition ||
                "center",
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-(--admin-text-muted)">
            <ImagePlus size={32} />
          </div>
        )}

        {card.overlay && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
        )}

        {/* STATUS */}

        <div className="absolute left-3 top-3">
          <span
            className={`
              inline-flex
              items-center
              gap-1.5
              rounded-full
              border
              px-2.5
              py-1
              text-[10px]
              font-semibold
              backdrop-blur-md
              ${
                card.isActive
                  ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-500"
                  : "border-white/20 bg-black/30 text-white"
              }
            `}
          >
            <span
              className={`
                h-1.5
                w-1.5
                rounded-full
                ${
                  card.isActive
                    ? "bg-emerald-400"
                    : "bg-white/50"
                }
              `}
            />

            {card.isActive
              ? "Active"
              : "Inactive"}
          </span>
        </div>


        {/* MENU */}

        <div className="absolute right-3 top-3">

          <button
            type="button"
            onClick={() =>
              setMenuId(
                menuId === card._id
                  ? null
                  : card._id
              )
            }
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              bg-black/30
              text-white
              backdrop-blur-md
              transition
              hover:bg-black/50
            "
          >
            <MoreHorizontal size={18} />
          </button>


          <AnimatePresence>
            {menuId === card._id && (
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.96,
                  y: -5,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.96,
                  y: -5,
                }}
                className="
                  absolute
                  right-0
                  top-11
                  z-30
                  w-44
                  overflow-hidden
                  rounded-xl
                  border
                  border-(--admin-border)
                  
                  p-1
                  shadow-xl
                   bg-white
                     dark:bg-slate-800
                "
              >

                <MenuButton
                  icon={<Edit3 size={15} />}
                  label="Edit"
                  onClick={() =>
                    onEdit(card)
                  }
                />

                <MenuButton
                  icon={
                    <Eye size={15} />
                  }
                  label="Preview"
                  onClick={() =>
                    onPreview(card)
                  }
                />

                <MenuButton
                  icon={
                    togglingId ===
                    card._id ? (
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />
                    ) : (
                      <Check
                        size={15}
                      />
                    )
                  }
                  label={
                    card.isActive
                      ? "Deactivate"
                      : "Activate"
                  }
                  onClick={() =>
                    onToggleStatus(card)
                  }
                />

                <div className="my-1 h-px bg-(--admin-border)" />

                <MenuButton
                  danger
                  icon={
                    <Trash2 size={15} />
                  }
                  label="Delete"
                  onClick={() =>
                    onDelete(card)
                  }
                />

              </motion.div>
            )}
          </AnimatePresence>

        </div>


        {/* PREVIEW BUTTON */}

        <button
          type="button"
          onClick={() =>
            onPreview(card)
          }
          className="
            absolute
            bottom-3
            right-3
            inline-flex
            items-center
            gap-1.5
            rounded-lg
            bg-black/35
            px-2.5
            py-1.5
            text-[11px]
            font-medium
            text-white
            opacity-0
            backdrop-blur-md
            transition
            group-hover:opacity-100
          "
        >
          <Eye size={13} />
          Preview
        </button>

      </div>


      {/* CONTENT */}

      <div className="p-4">

        <div className="mb-2 flex items-center justify-between gap-3">

          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-(--admin-primary)">
            {card.eyebrow ||
              "Promotion"}
          </span>

          <span className="text-[10px] font-medium text-(--admin-text-muted)">
            Order #{Number(card.order || 0)}
          </span>

        </div>


        <h3 className="line-clamp-2 text-base font-semibold text-(--admin-text)">
          {card.title ||
            "Untitled Promo Card"}
        </h3>


        {card.description && (
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-(--admin-text-muted)">
            {card.description}
          </p>
        )}


        <div className="mt-4 flex items-center justify-between gap-3 border-t border-(--admin-border) pt-3">

          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-(--admin-text-muted)">
            <span className="h-1.5 w-1.5 rounded-full bg-(--admin-primary)" />

            {card.buttonText ||
              "Shop Now"}
          </span>


          <button
            type="button"
            onClick={() =>
              onEdit(card)
            }
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-lg
              px-2.5
              py-1.5
              text-xs
              font-semibold
              text-(--admin-primary)
              transition
              hover:bg-(--admin-primary)/10
            "
          >
            <Edit3 size={13} />

            Edit
          </button>

        </div>

      </div>

    </motion.div>
  );
};


/*
 * =========================================
 * MENU BUTTON
 * =========================================
 */

const MenuButton = ({
  icon,
  label,
  onClick,
  danger = false,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        w-full
        items-center
        gap-2
        rounded-lg
        px-3
        py-2
        text-left
        text-xs
        font-medium
        transition

        ${
          danger
            ? "text-red-500 hover:bg-red-500/10"
            : "text-(--admin-text) hover:bg-(--admin-hover)"
        }
      `}
    >
      {icon}

      {label}
    </button>
  );
};


/*
 * =========================================
 * FORM MODAL
 * =========================================
 */

const PromoCardFormModal = ({
  form,
  editingId,
  previewImage,
  selectedFile,
  formError,
  submitting,
  onChange,
  onImageChange,
  onSubmit,
  onClose,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/60
        p-3
        backdrop-blur-sm
        sm:p-5
      "
    >

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.96,
          y: 15,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.96,
          y: 15,
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
  bg-white
  shadow-2xl
  dark:bg-slate-900
"
      >

        {/* HEADER */}

        <div className="flex items-center justify-between  border-b border-(--admin-border) px-5 py-4">

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-(--admin-primary)">
              Homepage Content
            </p>

            <h2 className="mt-1 text-lg font-bold text-(--admin-text)">
              {editingId
                ? "Edit Promo Card"
                : "Create Promo Card"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              text-(--admin-text-muted)
              transition
              hover:bg-(--admin-hover)
              hover:text-(--admin-text)
              disabled:opacity-50
            "
          >
            <X size={18} />
          </button>

        </div>


        {/* BODY */}

        <form
          onSubmit={onSubmit}
          className="overflow-y-auto"
        >

          <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-[1fr_360px]">

            {/* LEFT */}

            <div className="space-y-6">

              {/* CONTENT */}

              <section>

                <SectionHeading
                  number="01"
                  title="Promo Content"
                  description="Define the message visitors see on the promotional card."
                />

                <div className="mt-4 space-y-4">

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-(--admin-text)">
                      Eyebrow
                    </label>

                    <input
                      type="text"
                      name="eyebrow"
                      value={form.eyebrow}
                      onChange={onChange}
                      maxLength={40}
                      placeholder="Limited Time"
                      className={INPUT_CLASS}
                    />

                    <div className="mt-1 text-right text-[10px] text-(--admin-text-muted)">
                      {form.eyebrow.length}/40
                    </div>
                  </div>


                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-(--admin-text)">
                      Title
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={onChange}
                      maxLength={100}
                      required
                      placeholder="Upgrade Your Everyday"
                      className={INPUT_CLASS}
                    />

                    <div className="mt-1 text-right text-[10px] text-(--admin-text-muted)">
                      {form.title.length}/100
                    </div>
                  </div>


                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-(--admin-text)">
                      Description
                    </label>

                    <textarea
                      name="description"
                      value={form.description}
                      onChange={onChange}
                      maxLength={180}
                      rows={4}
                      placeholder="Add a short promotional description..."
                      className="
                        min-h-28
                        w-full
                        resize-none
                        rounded-xl
                        border
                        border-(--admin-control-border)
                        bg-(--admin-control-bg)
                        px-3
                        py-3
                        text-sm
                        text-(--admin-text)
                        outline-none
                        transition-all
                        placeholder:text-(--admin-text-muted)
                        focus:border-(--admin-primary)
                        focus:ring-2
                        focus:ring-(--admin-primary)/10
                      "
                    />

                    <div className="mt-1 text-right text-[10px] text-(--admin-text-muted)">
                      {form.description.length}/180
                    </div>
                  </div>

                </div>

              </section>


              {/* CTA */}

              <section>

                <SectionHeading
                  number="02"
                  title="Call To Action"
                  description="Control the action visitors can take from this card."
                />

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-(--admin-text)">
                      Button Text
                    </label>

                    <input
                      type="text"
                      name="buttonText"
                      value={form.buttonText}
                      onChange={onChange}
                      maxLength={30}
                      placeholder="Shop Now"
                      className={INPUT_CLASS}
                    />
                  </div>


                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-(--admin-text)">
                      Button Link
                    </label>

                    <input
                      type="text"
                      name="buttonLink"
                      value={form.buttonLink}
                      onChange={onChange}
                      placeholder="/products"
                      className={INPUT_CLASS}
                    />
                  </div>

                </div>

              </section>


              {/* DISPLAY */}

              <section>

                <SectionHeading
                  number="03"
                  title="Display Settings"
                  description="Control positioning, order and visibility."
                />

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-(--admin-text)">
                      Image Position
                    </label>

                    <select
                      name="imagePosition"
                      value={
                        form.imagePosition
                      }
                      onChange={onChange}
                      className={INPUT_CLASS}
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
                    </select>
                  </div>


                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-(--admin-text)">
                      Display Order
                    </label>

                    <input
                      type="number"
                      name="order"
                      value={form.order}
                      onChange={onChange}
                      min="0"
                      className={INPUT_CLASS}
                    />
                  </div>

                </div>


                <div className="mt-4 flex items-center justify-between rounded-xl border border-(--admin-border) bg-(--admin-control-bg) p-3">

                  <div>
                    <p className="text-xs font-semibold text-(--admin-text)">
                      Image Overlay
                    </p>

                    <p className="mt-0.5 text-[10px] text-(--admin-text-muted)">
                      Add a dark gradient over the image.
                    </p>
                  </div>

                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      name="overlay"
                      checked={form.overlay}
                      onChange={onChange}
                      className="peer sr-only"
                    />

                    <div className="
                      h-6
                      w-11
                      rounded-full
                      bg-gray-300
                      transition
                      peer-checked:bg-(--admin-primary)
                      peer-focus:ring-2
                      peer-focus:ring-(--admin-primary)/20
                    " />

                    <div className="
                      absolute
                      left-1
                      top-1
                      h-4
                      w-4
                      rounded-full
                      bg-white
                      transition-transform
                      peer-checked:translate-x-5
                    " />
                  </label>

                </div>


                <div className="mt-3 flex items-center justify-between rounded-xl border border-(--admin-border) bg-(--admin-control-bg) p-3">

                  <div>
                    <p className="text-xs font-semibold text-(--admin-text)">
                      Visibility
                    </p>

                    <p className="mt-0.5 text-[10px] text-(--admin-text-muted)">
                      Show this card on the storefront.
                    </p>
                  </div>

                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={onChange}
                      className="peer sr-only"
                    />

                    <div className="
                      h-6
                      w-11
                      rounded-full
                      bg-gray-300
                      transition
                      peer-checked:bg-(--admin-primary)
                    " />

                    <div className="
                      absolute
                      left-1
                      top-1
                      h-4
                      w-4
                      rounded-full
                      bg-white
                      transition-transform
                      peer-checked:translate-x-5
                    " />
                  </label>

                </div>

              </section>


              {/* ERROR */}

              {formError && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-500">
                  {formError}
                </div>
              )}

            </div>


            {/* RIGHT */}

            <div>

              <SectionHeading
                number="04"
                title="Promo Image"
                description="Upload the image that will be displayed on the card."
              />


              <label
                className="
                  mt-4
                  flex
                  min-h-[300px]
                  cursor-pointer
                  flex-col
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-2xl
                  border-2
                  border-dashed
                  border-(--admin-control-border)
                  bg-(--admin-control-bg)
                  transition
                  hover:border-(--admin-primary)
                "
              >

                {previewImage ? (
                  <div className="relative h-full min-h-[300px] w-full">

                    <img
                      src={previewImage}
                      alt="Promo preview"
                      className="h-full min-h-[300px] w-full object-cover"
                      style={{
                        objectPosition:
                          form.imagePosition,
                      }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <p className="text-[10px] uppercase tracking-widest text-white/70">
                        {form.eyebrow ||
                          "Promotion"}
                      </p>

                      <h3 className="mt-1 text-lg font-bold">
                        {form.title ||
                          "Promo Card Title"}
                      </h3>
                    </div>

                    <div className="absolute right-3 top-3 rounded-lg bg-black/40 px-2.5 py-1.5 text-[10px] text-white backdrop-blur">
                      Click to replace
                    </div>

                  </div>
                ) : (
                  <>
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-(--admin-primary)/10 text-(--admin-primary)">
                      <Upload size={20} />
                    </div>

                    <p className="text-sm font-semibold text-(--admin-text)">
                      Upload promo image
                    </p>

                    <p className="mt-1 text-xs text-(--admin-text-muted)">
                      PNG, JPG, WEBP up to 5MB
                    </p>
                  </>
                )}

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={onImageChange}
                  className="hidden"
                />

              </label>


              {selectedFile && (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-(--admin-border) bg-(--admin-control-bg) px-3 py-2">

                  <FileImage
                    size={15}
                    className="text-(--admin-primary)"
                  />

                  <span className="min-w-0 flex-1 truncate text-xs text-(--admin-text)">
                    {selectedFile.name}
                  </span>

                  <span className="text-[10px] text-(--admin-text-muted)">
                    {(
                      selectedFile.size /
                      1024 /
                      1024
                    ).toFixed(2)}{" "}
                    MB
                  </span>

                </div>
              )}

            </div>

          </div>


          {/* FOOTER */}

          <div className="flex flex-col-reverse gap-2 border-t border-(--admin-border) bg-(--admin-control-bg)/50 px-5 py-4 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="
                h-10
                rounded-xl
                border
                border-(--admin-control-border)
                px-5
                text-sm
                font-medium
                text-(--admin-text)
                transition
                hover:bg-(--admin-hover)
                disabled:opacity-50
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
                rounded-xl
                bg-(--admin-primary)
                px-5
                text-sm
                font-semibold
                text-white
                transition
                hover:brightness-95
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {submitting ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />

                  Saving...
                </>
              ) : (
                <>
                  <Check size={16} />

                  {editingId
                    ? "Update Promo Card"
                    : "Create Promo Card"}
                </>
              )}
            </button>

          </div>

        </form>

      </motion.div>

    </motion.div>
  );
};


/*
 * =========================================
 * SECTION HEADING
 * =========================================
 */

const SectionHeading = ({
  number,
  title,
  description,
}) => {
  return (
    <div className="flex gap-3">

      <div className="
        flex
        h-7
        w-7
        shrink-0
        items-center
        justify-center
        rounded-lg
        bg-(--admin-primary)/10
        text-[10px]
        font-bold
        text-(--admin-primary)
      ">
        {number}
      </div>

      <div>
        <h3 className="text-sm font-bold text-(--admin-text)">
          {title}
        </h3>

        <p className="mt-0.5 text-[11px] leading-4 text-(--admin-text-muted)">
          {description}
        </p>
      </div>

    </div>
  );
};


/*
 * =========================================
 * DELETE MODAL
 * =========================================
 */

const DeleteModal = ({
  card,
  deleting,
  onClose,
  onDelete,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="
        fixed
        inset-0
        z-[110]
        flex
        items-center
        justify-center
        bg-black/60
        p-4
        backdrop-blur-sm
      "
    >

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.96,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          scale: 0.96,
        }}
        className="
          w-full
          max-w-md
          rounded-2xl
          border
          border-(--admin-border)
          bg-(--admin-card)
          p-5
          shadow-2xl
        "
      >

        <div className="flex items-start gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
            <Trash2 size={19} />
          </div>

          <div>
            <h3 className="text-base font-bold text-(--admin-text)">
              Delete Promo Card?
            </h3>

            <p className="mt-1 text-xs leading-5 text-(--admin-text-muted)">
              This action cannot be undone.
              The promo card will be permanently
              removed from the content manager.
            </p>
          </div>

        </div>


        <div className="mt-4 rounded-xl border border-(--admin-border) bg-(--admin-control-bg) p-3">

          <p className="text-xs font-semibold text-(--admin-text)">
            {card.title ||
              "Untitled Promo Card"}
          </p>

          {card.eyebrow && (
            <p className="mt-1 text-[10px] text-(--admin-text-muted)">
              {card.eyebrow}
            </p>
          )}

        </div>


        <div className="mt-5 flex justify-end gap-2">

          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="
              h-10
              rounded-xl
              border
              border-(--admin-control-border)
              px-4
              text-xs
              font-semibold
              text-(--admin-text)
              transition
              hover:bg-(--admin-hover)
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="
              inline-flex
              h-10
              items-center
              gap-2
              rounded-xl
              bg-red-500
              px-4
              text-xs
              font-semibold
              text-white
              transition
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

                Delete
              </>
            )}
          </button>

        </div>

      </motion.div>

    </motion.div>
  );
};


/*
 * =========================================
 * PREVIEW MODAL
 * =========================================
 */

const PromoCardPreviewModal = ({
  card,
  onClose,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="
        fixed
        inset-0
        z-[120]
        flex
        items-center
        justify-center
        bg-black/70
        p-4
        backdrop-blur-md
      "
      onClick={onClose}
    >

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.94,
          y: 20,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.94,
          y: 20,
        }}
        onClick={(event) =>
          event.stopPropagation()
        }
        className="
          relative
          w-full
          max-w-4xl
          overflow-hidden
          rounded-2xl
          bg-black
          shadow-2xl
        "
      >

        <div className="relative min-h-[420px]">

          {card.image && (
            <img
              src={card.image}
              alt={card.title}
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                objectPosition:
                  card.imagePosition ||
                  "center",
              }}
            />
          )}

          {card.overlay && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
          )}


          <div className="relative z-10 flex min-h-[420px] items-end p-6 sm:p-10">

            <div className="max-w-xl text-white">

              {card.eyebrow && (
                <span className="mb-3 inline-flex rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-xs font-medium backdrop-blur-md">
                  {card.eyebrow}
                </span>
              )}

              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
                {card.title}
              </h2>

              {card.description && (
                <p className="mt-3 max-w-lg text-sm leading-6 text-white/80 sm:text-base">
                  {card.description}
                </p>
              )}

              {card.buttonText && (
                <button
                  type="button"
                  className="
                    mt-6
                    rounded-xl
                    bg-white
                    px-6
                    py-3
                    text-sm
                    font-semibold
                    text-black
                    shadow-xl
                    transition
                    hover:-translate-y-0.5
                  "
                >
                  {card.buttonText}
                </button>
              )}

            </div>

          </div>


          <button
            type="button"
            onClick={onClose}
            className="
              absolute
              right-4
              top-4
              z-20
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-black/30
              text-white
              backdrop-blur-md
              transition
              hover:bg-black/50
            "
          >
            <X size={18} />
          </button>

        </div>

      </motion.div>

    </motion.div>
  );
};


/*
 * =========================================
 * LOADING
 * =========================================
 */

const LoadingState = () => {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 4 }).map(
        (_, index) => (
          <div
            key={index}
            className="
              overflow-hidden
              rounded-2xl
              border
              border-(--admin-border)
              bg-(--admin-card)
            "
          >
            <div className="h-52 animate-pulse bg-(--admin-control-bg)" />

            <div className="space-y-3 p-4">
              <div className="h-3 w-20 animate-pulse rounded bg-(--admin-control-bg)" />

              <div className="h-5 w-3/4 animate-pulse rounded bg-(--admin-control-bg)" />

              <div className="h-8 w-full animate-pulse rounded bg-(--admin-control-bg)" />
            </div>
          </div>
        )
      )}
    </div>
  );
};


/*
 * =========================================
 * EMPTY STATE
 * =========================================
 */

const EmptyState = ({
  hasSearch,
  onCreate,
}) => {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-(--admin-border) bg-(--admin-card) px-5 text-center">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-(--admin-primary)/10 text-(--admin-primary)">
        <ImagePlus size={24} />
      </div>

      <h3 className="mt-4 text-base font-bold text-(--admin-text)">
        {hasSearch
          ? "No promo cards found"
          : "No promo cards yet"}
      </h3>

      <p className="mt-1 max-w-md text-xs leading-5 text-(--admin-text-muted)">
        {hasSearch
          ? "Try changing your search or status filter."
          : "Create your first promotional card to start managing homepage promotions."}
      </p>

      {!hasSearch && (
        <button
          type="button"
          onClick={onCreate}
          className="
            mt-5
            inline-flex
            items-center
            gap-2
            rounded-xl
            bg-(--admin-primary)
            px-4
            py-2.5
            text-xs
            font-semibold
            text-white
            transition
            hover:-translate-y-0.5
          "
        >
          <Plus size={15} />

          Add Promo Card
        </button>
      )}

    </div>
  );
};


export default PromoCardsManagement;