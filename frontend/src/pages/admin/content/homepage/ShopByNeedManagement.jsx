import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Plus,
  RefreshCw,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  X,
  Upload,
  Image as ImageIcon,
  Video,
  Play,
  Link as LinkIcon,
  Save,
  Layers3,
  CheckCircle2,
  CircleOff,
  ArrowUpDown,
  FileVideo,
  ExternalLink,
  AlertCircle,
  ChevronDown,
//preview
   ShoppingBag,
  Smartphone,
  Laptop,
  Shirt,
  Sofa,
  Sparkles,
  Dumbbell,
  Watch,
  Headphones,
  Footprints,
  Baby,
  Car,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import {
  getShopByNeedItems,
  getShopByNeedItemById,
  createShopByNeedItem,
  updateShopByNeedItem,
  deleteShopByNeedItem,
  toggleShopByNeedItemStatus,
  clearShopByNeedError,
  clearShopByNeedStatus,
  clearSelectedShopByNeedItem,
} from "../../../../redux/slices/content/homepage/shopByNeedSlice";

const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const initialForm = {
  title: "",
  description: "",
  eyebrow: "",
  icon: "",
  query: "",
  category: "",
  video: "",
  fallbackImage: "",
  isActive: true,
  order: 0,
};

const iconOptions = [
  { value: "ShoppingBag", label: "Shopping Bag" },
  { value: "Smartphone", label: "Smartphone" },
  { value: "Laptop", label: "Laptop" },
  { value: "Shirt", label: "Fashion" },
  { value: "Sofa", label: "Home" },
  { value: "Sparkles", label: "Beauty" },
  { value: "Dumbbell", label: "Fitness" },
  { value: "Watch", label: "Watch" },
  { value: "Headphones", label: "Audio" },
  { value: "Footprints", label: "Footwear" },
  { value: "Baby", label: "Kids" },
  { value: "Car", label: "Automotive" },
  { value: "Gamepad2", label: "Gamepad" },
];


const getId = (item) => item?._id || item?.id;

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const getMediaUrl = (value) => {
  if (!value) return "";

  const url = String(value).trim();

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  return `${API_BASE_URL.replace(/\/$/, "")}/${url.replace(
    /^\//,
    ""
  )}`;
};

const normalizeCategory = (category) => {
  if (!category) return "";

  if (typeof category === "string") return category;

  return category?._id || category?.id || "";
};

const normalizeItem = (item) => {
  if (!item) return initialForm;

  return {
    title: item.title || "",
    description: item.description || "",
    eyebrow: item.eyebrow || "",
    icon: item.icon || "",
    query: item.query || "",
    category: normalizeCategory(item.category),
    video: item.video || "",
    fallbackImage: item.fallbackImage || "",
    isActive:
      typeof item.isActive === "boolean"
        ? item.isActive
        : true,
    order:
      typeof item.order === "number"
        ? item.order
        : Number(item.order || 0),
  };
};

export default function ShopByNeedManagement() {
  const dispatch = useDispatch();

  const {
    shopByNeedItems = [],
    selectedShopByNeedItem = null,

    loading = false,
    error = null,

    createLoading = false,
    createError = null,
    createSuccess = false,

    updateLoading = false,
    updateError = null,
    updateSuccess = false,

    deleteLoading = false,
    deleteError = null,
  } = useSelector((state) => state.shopByNeed || {});

  /*
   * ---------------------------------------------------
   * STATE
   * ---------------------------------------------------
   */

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
const [showPreview, setShowPreview] = useState(false);
const [previewItem, setPreviewItem] = useState(null);
  const [form, setForm] = useState(initialForm);

  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const [imagePreview, setImagePreview] = useState("");
  const [videoPreview, setVideoPreview] = useState("");

  const [removeExistingImage, setRemoveExistingImage] =
    useState(false);

  const [removeExistingVideo, setRemoveExistingVideo] =
    useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [openMenuId, setOpenMenuId] = useState(null);

  const [formError, setFormError] = useState("");

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

const handlePreview = (item) => {
  setPreviewItem(item);
  setShowPreview(true);
  setOpenMenuId(null);
};
  /*
   * ---------------------------------------------------
   * INITIAL LOAD
   * ---------------------------------------------------
   */

  useEffect(() => {
    dispatch(getShopByNeedItems());
  }, [dispatch]);

  /*
   * ---------------------------------------------------
   * SUCCESS HANDLING
   * ---------------------------------------------------
   */

  useEffect(() => {
    if (!createSuccess && !updateSuccess) return;

    closeModal();

    dispatch(clearShopByNeedStatus());

    dispatch(getShopByNeedItems());
  }, [createSuccess, updateSuccess, dispatch]);

  /*
   * ---------------------------------------------------
   * CLEANUP PREVIEWS
   * ---------------------------------------------------
   */

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }

      if (videoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, [imagePreview, videoPreview]);

  /*
   * ---------------------------------------------------
   * FILTERED ITEMS
   * ---------------------------------------------------
   */

  const filteredItems = useMemo(() => {
    const source = Array.isArray(shopByNeedItems)
      ? shopByNeedItems
      : [];

    return source
      .filter((item) => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) return true;

        return (
          item?.title?.toLowerCase().includes(keyword) ||
          item?.description?.toLowerCase().includes(keyword) ||
          item?.eyebrow?.toLowerCase().includes(keyword) ||
          item?.query?.toLowerCase().includes(keyword)
        );
      })
      .filter((item) => {
        if (statusFilter === "all") return true;

        if (statusFilter === "active") {
          return item?.isActive === true;
        }

        if (statusFilter === "inactive") {
          return item?.isActive === false;
        }

        return true;
      })
      .sort(
        (a, b) =>
          Number(a?.order || 0) -
          Number(b?.order || 0)
      );
  }, [shopByNeedItems, search, statusFilter]);

  /*
   * ---------------------------------------------------
   * STATS
   * ---------------------------------------------------
   */

  const totalCount = shopByNeedItems.length;

  const activeCount = shopByNeedItems.filter(
    (item) => item?.isActive === true
  ).length;

  const inactiveCount = totalCount - activeCount;

  const videoCount = shopByNeedItems.filter(
    (item) => Boolean(item?.video)
  ).length;

  /*
   * ---------------------------------------------------
   * OPEN CREATE
   * ---------------------------------------------------
   */

  const openCreateModal = () => {
    dispatch(clearShopByNeedError());
    dispatch(clearShopByNeedStatus());
    dispatch(clearSelectedShopByNeedItem());

    clearMediaState();

    setEditingId(null);
    setForm(initialForm);
    setFormError("");
    setIsModalOpen(true);
  };

  /*
   * ---------------------------------------------------
   * OPEN EDIT
   * ---------------------------------------------------
   */

  const openEditModal = async (item) => {
    const id = getId(item);

    if (!id) return;

    dispatch(clearShopByNeedError());
    dispatch(clearShopByNeedStatus());

    setEditingId(id);
    setForm(normalizeItem(item));

    setSelectedImage(null);
    setSelectedVideo(null);

    setRemoveExistingImage(false);
    setRemoveExistingVideo(false);

    setImagePreview(
      getMediaUrl(item?.fallbackImage || "")
    );

    setVideoPreview(
      getMediaUrl(item?.video || "")
    );

    setFormError("");
    setIsModalOpen(true);

    try {
      await dispatch(
        getShopByNeedItemById(id)
      ).unwrap();
    } catch {
      // Existing list item is already enough to edit.
      // If the API fails, keep the current data.
    }
  };

  /*
   * ---------------------------------------------------
   * SYNC SELECTED ITEM
   * ---------------------------------------------------
   */

  useEffect(() => {
    if (!isModalOpen || !editingId) return;

    if (!selectedShopByNeedItem) return;

    const selectedId =
      getId(selectedShopByNeedItem);

    if (selectedId !== editingId) return;

    const normalized =
      normalizeItem(selectedShopByNeedItem);

    setForm(normalized);

    if (
      selectedShopByNeedItem.fallbackImage &&
      !selectedImage
    ) {
      setImagePreview(
        getMediaUrl(
          selectedShopByNeedItem.fallbackImage
        )
      );
    }

    if (
      selectedShopByNeedItem.video &&
      !selectedVideo
    ) {
      setVideoPreview(
        getMediaUrl(
          selectedShopByNeedItem.video
        )
      );
    }
  }, [
    selectedShopByNeedItem,
    editingId,
    isModalOpen,
    selectedImage,
    selectedVideo,
  ]);

  /*
   * ---------------------------------------------------
   * CLOSE MODAL
   * ---------------------------------------------------
   */

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);

    setForm(initialForm);
    setSelectedImage(null);
    setSelectedVideo(null);

    setRemoveExistingImage(false);
    setRemoveExistingVideo(false);

    setImagePreview("");
    setVideoPreview("");

    setFormError("");

    dispatch(clearSelectedShopByNeedItem());
    dispatch(clearShopByNeedStatus());
    dispatch(clearShopByNeedError());
  };

  /*
   * ---------------------------------------------------
   * CLEAR MEDIA
   * ---------------------------------------------------
   */

  const clearMediaState = () => {
    setSelectedImage(null);
    setSelectedVideo(null);

    setImagePreview("");
    setVideoPreview("");

    setRemoveExistingImage(false);
    setRemoveExistingVideo(false);
  };

  /*
   * ---------------------------------------------------
   * INPUT CHANGE
   * ---------------------------------------------------
   */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formError) {
      setFormError("");
    }
  };

  /*
   * ---------------------------------------------------
   * BOOLEAN CHANGE
   * ---------------------------------------------------
   */

  const handleActiveChange = () => {
    setForm((prev) => ({
      ...prev,
      isActive: !prev.isActive,
    }));
  };

  /*
   * ---------------------------------------------------
   * IMAGE SELECT
   * ---------------------------------------------------
   */

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setFormError("");

    if (!file.type.startsWith("image/")) {
      setFormError(
        "Please select a valid image file."
      );

      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setFormError(
        "Image size must be 10MB or smaller."
      );

      event.target.value = "";
      return;
    }

    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl =
      URL.createObjectURL(file);

    setSelectedImage(file);
    setImagePreview(previewUrl);
    setRemoveExistingImage(false);
  };

  /*
   * ---------------------------------------------------
   * VIDEO SELECT
   * ---------------------------------------------------
   */

  const handleVideoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setFormError("");

    if (!file.type.startsWith("video/")) {
      setFormError(
        "Please select a valid video file."
      );

      event.target.value = "";
      return;
    }

    if (file.size > MAX_VIDEO_SIZE) {
      setFormError(
        "Video size must be 100MB or smaller."
      );

      event.target.value = "";
      return;
    }

    if (videoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(videoPreview);
    }

    const previewUrl =
      URL.createObjectURL(file);

    setSelectedVideo(file);
    setVideoPreview(previewUrl);
    setRemoveExistingVideo(false);
  };

  /*
   * ---------------------------------------------------
   * REMOVE IMAGE
   * ---------------------------------------------------
   */

  const removeImage = () => {
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(null);
    setImagePreview("");

    if (editingId && form.fallbackImage) {
      setRemoveExistingImage(true);
    }

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  /*
   * ---------------------------------------------------
   * REMOVE VIDEO
   * ---------------------------------------------------
   */

  const removeVideo = () => {
    if (videoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(videoPreview);
    }

    setSelectedVideo(null);
    setVideoPreview("");

    if (editingId && form.video) {
      setRemoveExistingVideo(true);
    }

    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  /*
   * ---------------------------------------------------
   * VALIDATION
   * ---------------------------------------------------
   */

  const validateForm = () => {
    if (!form.title.trim()) {
      return "Title is required.";
    }

    if (!form.description.trim()) {
      return "Description is required.";
    }

    if (!form.icon.trim()) {
      return "Please select an icon.";
    }

    if (!form.query.trim()) {
      return "Product query is required.";
    }

    const order = Number(form.order);

    if (Number.isNaN(order)) {
      return "Order must be a valid number.";
    }

    const hasImage =
      Boolean(selectedImage) ||
      Boolean(
        form.fallbackImage &&
          !removeExistingImage
      );

    const hasVideo =
      Boolean(selectedVideo) ||
      Boolean(
        form.video &&
          !removeExistingVideo
      );

    if (!hasImage && !hasVideo) {
      return (
        "Please provide at least an image or a video."
      );
    }

    return "";
  };

  /*
   * ---------------------------------------------------
   * BUILD FORMDATA
   * ---------------------------------------------------
   */

  const buildFormData = () => {
    const formData = new FormData();

    formData.append(
      "title",
      form.title.trim()
    );

    formData.append(
      "description",
      form.description.trim()
    );

    formData.append(
      "eyebrow",
      form.eyebrow.trim()
    );

    formData.append(
      "icon",
      form.icon.trim()
    );

    formData.append(
      "query",
      form.query.trim()
    );

    formData.append(
      "category",
      form.category || ""
    );

    formData.append(
      "isActive",
      String(Boolean(form.isActive))
    );

    formData.append(
      "order",
      String(Number(form.order || 0))
    );

    /*
     * ------------------------------------------------
     * IMAGE
     * IMPORTANT:
     * Your Multer setup already uses `images`.
     * ------------------------------------------------
     */

    if (selectedImage) {
      formData.append(
        "images",
        selectedImage
      );
    }

    /*
     * ------------------------------------------------
     * VIDEO
     *
     * IMPORTANT:
     * Backend Multer must accept `videos`.
     * ------------------------------------------------
     */

    if (selectedVideo) {
      formData.append(
        "videos",
        selectedVideo
      );
    }

    /*
     * ------------------------------------------------
     * EXISTING IMAGE
     * ------------------------------------------------
     */

    if (
      editingId &&
      removeExistingImage
    ) {
      formData.append(
        "removeExistingImage",
        "true"
      );
    }

    /*
     * ------------------------------------------------
     * EXISTING VIDEO
     * ------------------------------------------------
     */

    if (
      editingId &&
      removeExistingVideo
    ) {
      formData.append(
        "removeExistingVideo",
        "true"
      );
    }

    /*
     * ------------------------------------------------
     * VIDEO URL
     *
     * If a video file is selected, the file is used.
     * Otherwise an existing/manual URL can be used.
     * ------------------------------------------------
     */

    if (
      !selectedVideo &&
      form.video.trim() &&
      !removeExistingVideo
    ) {
      formData.append(
        "video",
        form.video.trim()
      );
    }

    /*
     * ------------------------------------------------
     * IMAGE URL
     *
     * Existing fallbackImage remains supported.
     * ------------------------------------------------
     */

    if (
      !selectedImage &&
      form.fallbackImage.trim() &&
      !removeExistingImage
    ) {
      formData.append(
        "fallbackImage",
        form.fallbackImage.trim()
      );
    }

    return formData;
  };

  /*
   * ---------------------------------------------------
   * SUBMIT
   * ---------------------------------------------------
   */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");

    const validationError =
      validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    const formData = buildFormData();

    try {
      if (editingId) {
        await dispatch(
          updateShopByNeedItem({
            id: editingId,
            data: formData,
          })
        ).unwrap();
      } else {
        await dispatch(
          createShopByNeedItem(formData)
        ).unwrap();
      }
    } catch (submitError) {
      setFormError(
        typeof submitError === "string"
          ? submitError
          : "Unable to save shop by need item."
      );
    }
  };

  /*
   * ---------------------------------------------------
   * DELETE
   * ---------------------------------------------------
   */

  const handleDelete = async (item) => {
    const id = getId(item);

    if (!id) return;

    const confirmed = window.confirm(
      `Delete "${item?.title || "this item"}"?`
    );

    if (!confirmed) return;

    try {
      await dispatch(
        deleteShopByNeedItem(id)
      ).unwrap();

      setOpenMenuId(null);

      dispatch(getShopByNeedItems());
    } catch {
      // Redux stores deleteError.
    }
  };

  /*
   * ---------------------------------------------------
   * TOGGLE STATUS
   * ---------------------------------------------------
   */

  const handleToggleStatus = async (item) => {
    const id = getId(item);

    if (!id) return;

    try {
      await dispatch(
        toggleShopByNeedItemStatus(id)
      ).unwrap();

      setOpenMenuId(null);
    } catch {
      // Redux stores the error.
    }
  };

  /*
   * ---------------------------------------------------
   * REFRESH
   * ---------------------------------------------------
   */

  const handleRefresh = () => {
    dispatch(getShopByNeedItems());
  };

  /*
   * ---------------------------------------------------
   * IMAGE DRAG HANDLERS
   * ---------------------------------------------------
   */

  const handleImageDrop = (event) => {
    event.preventDefault();

    const file =
      event.dataTransfer.files?.[0];

    if (!file) return;

    const fakeEvent = {
      target: {
        files: [file],
        value: "",
      },
    };

    handleImageChange(fakeEvent);
  };

  /*
   * ---------------------------------------------------
   * VIDEO DRAG HANDLERS
   * ---------------------------------------------------
   */

  const handleVideoDrop = (event) => {
    event.preventDefault();

    const file =
      event.dataTransfer.files?.[0];

    if (!file) return;

    const fakeEvent = {
      target: {
        files: [file],
        value: "",
      },
    };

    handleVideoChange(fakeEvent);
  };

  /*
   * ---------------------------------------------------
   * ERROR
   * ---------------------------------------------------
   */

  const combinedError =
    formError ||
    error ||
    createError ||
    updateError ||
    deleteError;

  /*
   * ---------------------------------------------------
   * RENDER
   * ---------------------------------------------------
   */

  return (
    <div className="min-h-full bg-(--admin-bg) text-(--admin-text)">
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

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="
                mt-1
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-(--admin-border)
                bg-(--admin-surface)
                text-(--admin-text-secondary)
                shadow-(--admin-card-shadow)
                transition
                hover:bg-(--admin-surface-soft)
                hover:text-(--admin-text)
              "
            >
              <ArrowLeft size={18} />
            </button>

            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-(--admin-primary)
                text-white
                shadow-sm
              "
            >
              <Layers3 size={20} />
            </div>

            <div className="min-w-0">
              <h1 className="text-lg font-bold tracking-tight sm:text-xl">
                Shop By Need
              </h1>

              <p className="mt-0.5 max-w-2xl text-xs text-(--admin-text-muted) sm:text-sm">
                Manage homepage shopping needs,
                categories, media and customer-facing
                discovery sections.
              </p>
            </div>
          </div>

          <div className="flex w-full gap-2 sm:w-auto">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="
                flex
                h-10
                flex-1
                items-center
                justify-center
                gap-2
                rounded-lg
                border
                border-(--admin-control-border)
                bg-(--admin-control-bg)
                px-3
                text-xs
                font-bold
                text-(--admin-text-secondary)
                transition
                hover:bg-(--admin-surface-soft)
                disabled:cursor-not-allowed
                disabled:opacity-50
                sm:flex-none
              "
            >
              <RefreshCw
                size={15}
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
              onClick={openCreateModal}
              className="
                flex
                h-10
                flex-1
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
                transition
                hover:opacity-90
                sm:flex-none
              "
            >
              <Plus size={16} />
              Add Item
            </button>
          </div>
        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}

        <AnimatePresence>
          {combinedError && (
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
                gap-3
                rounded-xl
                border
                border-red-200
                bg-red-50
                p-3
                text-sm
                text-red-700
                dark:border-red-900/40
                dark:bg-red-950/20
                dark:text-red-300
              "
            >
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  Something went wrong
                </p>

                <p className="mt-0.5 text-xs opacity-90">
                  {combinedError}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFormError("");
                  dispatch(
                    clearShopByNeedError()
                  );
                  dispatch(
                    clearShopByNeedStatus()
                  );
                }}
                className="rounded-lg p-1 hover:bg-red-100 dark:hover:bg-red-900/30"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =====================================================
            STATS
        ===================================================== */}

        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={<Layers3 size={17} />}
            label="Total Items"
            value={totalCount}
          />

          <StatCard
            icon={<CheckCircle2 size={17} />}
            label="Active"
            value={activeCount}
          />

          <StatCard
            icon={<CircleOff size={17} />}
            label="Inactive"
            value={inactiveCount}
          />

          <StatCard
            icon={<Video size={17} />}
            label="Video Content"
            value={videoCount}
          />
        </div>

        {/* =====================================================
            FILTERS
        ===================================================== */}

        <section
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
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search
                size={16}
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
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search title, description, eyebrow or query..."
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
                  transition
                  placeholder:text-(--admin-text-muted)
                  focus:border-(--admin-primary)
                "
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <FilterButton
                active={statusFilter === "all"}
                onClick={() =>
                  setStatusFilter("all")
                }
              >
                All
              </FilterButton>

              <FilterButton
                active={statusFilter === "active"}
                onClick={() =>
                  setStatusFilter("active")
                }
              >
                Active
              </FilterButton>

              <FilterButton
                active={statusFilter === "inactive"}
                onClick={() =>
                  setStatusFilter("inactive")
                }
              >
                Inactive
              </FilterButton>
            </div>
          </div>
        </section>

        {/* =====================================================
            CONTENT
        ===================================================== */}

        {loading && !shopByNeedItems.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {Array.from({ length: 4 }).map(
              (_, index) => (
                <div
                  key={index}
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
        ) : filteredItems.length === 0 ? (
          <EmptyState
            hasFilters={
              Boolean(search) ||
              statusFilter !== "all"
            }
            onAdd={openCreateModal}
            onClear={() => {
              setSearch("");
              setStatusFilter("all");
            }}
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <ShopByNeedCard
                  key={getId(item)}
                  item={item}
                  openMenuId={openMenuId}
                  setOpenMenuId={setOpenMenuId}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                  onToggle={handleToggleStatus}
                  deleteLoading={deleteLoading}
                  onPreview={handlePreview}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* =====================================================
          MODAL
      ===================================================== */}

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
                event.target === event.currentTarget
              ) {
                closeModal();
              }
            }}
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.97,
                y: 12,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.97,
                y: 12,
              }}
              transition={{
                duration: 0.18,
              }}
              className="
                flex
                max-h-[94vh]
                w-full
                max-w-6xl
                flex-col
                overflow-hidden
                rounded-2xl
                border
                border-(--admin-border)
                bg-(--admin-surface)
                shadow-2xl
              "
            >
              {/* MODAL HEADER */}

              <div
                className="
                  flex
                  shrink-0
                  items-center
                  justify-between
                  gap-4
                  border-b
                  border-(--admin-border)
                  px-4
                  py-4
                  sm:px-6
                "
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-(--admin-primary)
                      text-white
                    "
                  >
                    {editingId ? (
                      <Pencil size={17} />
                    ) : (
                      <Plus size={18} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-bold sm:text-base">
                      {editingId
                        ? "Edit Shop By Need"
                        : "Create Shop By Need"}
                    </h2>

                    <p className="mt-0.5 text-[10px] text-(--admin-text-muted) sm:text-xs">
                      Build a customer-facing homepage
                      discovery card.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    text-(--admin-text-muted)
                    transition
                    hover:bg-(--admin-surface-soft)
                    hover:text-(--admin-text)
                  "
                >
                  <X size={18} />
                </button>
              </div>

              {/* MODAL BODY */}

              <form
                onSubmit={handleSubmit}
                className="min-h-0 flex-1 overflow-y-auto"
              >
                <div className="space-y-5 p-4 sm:p-6">
                  {/* FORM ERROR */}

                  <AnimatePresence>
                    {formError && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          height: 0,
                        }}
                        animate={{
                          opacity: 1,
                          height: "auto",
                        }}
                        exit={{
                          opacity: 0,
                          height: 0,
                        }}
                        className="
                          flex
                          items-start
                          gap-2
                          overflow-hidden
                          rounded-xl
                          border
                          border-red-200
                          bg-red-50
                          p-3
                          text-xs
                          text-red-700
                          dark:border-red-900/40
                          dark:bg-red-950/20
                          dark:text-red-300
                        "
                      >
                        <AlertCircle
                          size={15}
                          className="mt-0.5 shrink-0"
                        />

                        <span>
                          {formError}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* =================================================
                      BASIC INFORMATION
                  ================================================= */}

                  <FormSection
                    number="01"
                    title="Basic Information"
                    description="Define the text and discovery information shown to customers."
                  >
                    <div className="grid gap-4 lg:grid-cols-2">
                      <Field
                        label="Title"
                        required
                        hint="Main customer-facing heading."
                        className="lg:col-span-2"
                      >
                        <input
                          name="title"
                          value={form.title}
                          onChange={handleChange}
                          placeholder="e.g. Smart Tech"
                          className="FormInput"
                        />
                      </Field>

                      <Field
                        label="Eyebrow"
                        hint="Small label above the title."
                      >
                        <input
                          name="eyebrow"
                          value={form.eyebrow}
                          onChange={handleChange}
                          placeholder="TRENDING NOW"
                          className="FormInput"
                        />
                      </Field>

                      <Field
                        label="Icon"
                        required
                        hint="Stored as an icon key. React handles the actual icon."
                      >
                        <div className="relative">
                          <select
                            name="icon"
                            value={form.icon}
                            onChange={handleChange}
                            className="
                              FormInput
                              appearance-none
                              pr-9
                            "
                          >
                            <option value="">
                              Select icon
                            </option>

                            {iconOptions.map(
                              (icon) => (
                                <option
                                  key={icon.value}
                                  value={icon.value}
                                >
                                  {icon.label}
                                </option>
                              )
                            )}
                          </select>

                          <ChevronDown
                            size={15}
                            className="
                              pointer-events-none
                              absolute
                              right-3
                              top-1/2
                              -translate-y-1/2
                              text-(--admin-text-muted)
                            "
                          />
                        </div>
                      </Field>

                      <Field
                        label="Product Query"
                        required
                        hint="Used by the frontend to discover matching products."
                      >
                        <input
                          name="query"
                          value={form.query}
                          onChange={handleChange}
                          placeholder="e.g. smartphones"
                          className="FormInput"
                        />
                      </Field>

                      <Field
                        label="Category"
                        hint="Optional MongoDB category ID."
                      >
                        <input
                          name="category"
                          value={form.category}
                          onChange={handleChange}
                          placeholder="Category ObjectId"
                          className="FormInput"
                        />
                      </Field>

                      <Field
                        label="Display Order"
                        required
                        hint="Lower numbers appear first."
                      >
                        <input
                          type="number"
                          name="order"
                          value={form.order}
                          onChange={handleChange}
                          min="0"
                          className="FormInput"
                        />
                      </Field>

                      <Field
                        label="Description"
                        required
                        hint="Short supporting text shown below the title."
                        className="lg:col-span-2"
                      >
                        <textarea
                          name="description"
                          value={form.description}
                          onChange={handleChange}
                          rows={4}
                          placeholder="Discover the latest products..."
                          className="
                            FormInput
                            min-h-24
                            resize-y
                            py-3
                             w-full
                          "
                        />
                      </Field>
                    </div>
                  </FormSection>

                  {/* =================================================
                      MEDIA
                  ================================================= */}

                  <FormSection
                    number="02"
                    title="Media"
                    description="Upload the visual assets used by the homepage section."
                  >
                    <div className="grid gap-5 xl:grid-cols-2">
                      {/* IMAGE */}

                      <MediaUploadCard
                        type="image"
                        title="Fallback Image"
                        description="Recommended for poster/fallback content."
                        inputRef={imageInputRef}
                        file={selectedImage}
                        preview={imagePreview}
                        existingValue={
                          form.fallbackImage
                        }
                        onFileChange={
                          handleImageChange
                        }
                        onDrop={handleImageDrop}
                        onRemove={removeImage}
                        onOpen={() =>
                          imageInputRef.current?.click()
                        }
                      />

                      {/* VIDEO */}

                      <MediaUploadCard
                        type="video"
                        title="Homepage Video"
                        description="Upload MP4/WebM/MOV or use a hosted video URL."
                        inputRef={videoInputRef}
                        file={selectedVideo}
                        preview={videoPreview}
                        existingValue={form.video}
                        onFileChange={
                          handleVideoChange
                        }
                        onDrop={handleVideoDrop}
                        onRemove={removeVideo}
                        onOpen={() =>
                          videoInputRef.current?.click()
                        }
                      />
                    </div>

                    {/* VIDEO URL */}

                    <div className="mt-5 rounded-2xl border border-(--admin-border) bg-(--admin-surface-soft) p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <LinkIcon
                          size={15}
                          className="text-(--admin-primary)"
                        />

                        <div>
                          <p className="text-xs font-bold">
                            Video URL
                          </p>

                          <p className="text-[10px] text-(--admin-text-muted)">
                            Optional fallback if you do not
                            upload a video file.
                          </p>
                        </div>
                      </div>

                      <input
                        name="video"
                        value={form.video}
                        onChange={handleChange}
                        placeholder="https://cdn.example.com/video.mp4"
                        className="FormInput"
                        disabled={Boolean(
                          selectedVideo
                        )}
                      />

                      {selectedVideo && (
                        <p className="mt-2 text-[10px] text-(--admin-text-muted)">
                          A selected video file takes
                          priority over the URL.
                        </p>
                      )}
                    </div>
                  </FormSection>

                  {/* =================================================
                      STATUS
                  ================================================= */}

                  <FormSection
                    number="03"
                    title="Publishing"
                    description="Control whether this content is available on the homepage."
                  >
                    <div
                      className="
                        flex
                        flex-col
                        gap-4
                        rounded-2xl
                        border
                        border-(--admin-border)
                        bg-(--admin-surface-soft)
                        p-4
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                      "
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            ${
                              form.isActive
                                ? "bg-(--admin-primary) text-white"
                                : "bg-(--admin-control-bg) text-(--admin-text-muted)"
                            }
                          `}
                        >
                          {form.isActive ? (
                            <Eye size={17} />
                          ) : (
                            <EyeOff size={17} />
                          )}
                        </div>

                        <div>
                          <p className="text-xs font-bold">
                            Publish on Homepage
                          </p>

                          <p className="mt-1 max-w-xl text-[10px] leading-relaxed text-(--admin-text-muted)">
                            Active items can be displayed
                            by the customer homepage.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={
                          handleActiveChange
                        }
                        className={`
                          relative
                          flex
                          h-6
                          w-11
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
                        aria-label="Toggle active status"
                      >
                        <span
                          className={`
                            absolute
                            h-4
                            w-4
                            rounded-full
                            bg-white
                            shadow-sm
                            transition-transform
                            ${
                              form.isActive
                                ? "translate-x-6"
                                : "translate-x-1"
                            }
                          `}
                        />
                      </button>
                    </div>
                  </FormSection>
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
                    sm:items-center
                    sm:justify-end
                    sm:px-6
                  "
                >
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={
                      createLoading ||
                      updateLoading
                    }
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
                      transition
                      hover:bg-(--admin-surface-soft)
                      disabled:opacity-50
                    "
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      createLoading ||
                      updateLoading
                    }
                    className="
                      flex
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
                      transition
                      hover:opacity-90
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {createLoading ||
                    updateLoading ? (
                      <>
                        <RefreshCw
                          size={15}
                          className="animate-spin"
                        />

                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={15} />

                        {editingId
                          ? "Update Item"
                          : "Create Item"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
  {showPreview && previewItem && (
    <ShopByNeedPreviewModal
      item={previewItem}
      onClose={() => {
        setShowPreview(false);
        setPreviewItem(null);
      }}
    />
  )}
</AnimatePresence>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| STAT CARD
|--------------------------------------------------------------------------
*/

function StatCard({
  icon,
  label,
  value,
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-(--admin-border)
        bg-(--admin-surface)
        p-4
        shadow-(--admin-card-shadow)
      "
    >
      <div className="flex items-center justify-between gap-3">
        <div
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            bg-(--admin-surface-soft)
            text-(--admin-primary)
          "
        >
          {icon}
        </div>

        <span className="text-xl font-bold">
          {value}
        </span>
      </div>

      <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-(--admin-text-muted)">
        {label}
      </p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| FILTER BUTTON
|--------------------------------------------------------------------------
*/

function FilterButton({
  active,
  onClick,
  children,
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
        transition
        ${
          active
            ? "bg-(--admin-primary) text-white shadow-sm"
            : "bg-(--admin-control-bg) text-(--admin-text-muted) hover:bg-(--admin-surface-soft) hover:text-(--admin-text)"
        }
      `}
    >
      {children}
    </button>
  );
}

/*
|--------------------------------------------------------------------------
| FORM SECTION
|--------------------------------------------------------------------------
*/

function FormSection({
  number,
  title,
  description,
  children,
}) {
  return (
    <section
      className="
        rounded-2xl
        border
        border-(--admin-border)
        bg-(--admin-surface)
        p-4
        sm:p-5
      "
    >
      <div className="mb-5 flex items-start gap-3">
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
            font-bold
            text-white
          "
        >
          {number}
        </div>

        <div>
          <h3 className="text-sm font-bold">
            {title}
          </h3>

          <p className="mt-1 text-[10px] leading-relaxed text-(--admin-text-muted) sm:text-xs">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

/*
|--------------------------------------------------------------------------
| FIELD
|--------------------------------------------------------------------------
*/

function Field({
  label,
  required,
  hint,
  children,
  className = "",
}) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label
          className="
            text-[10px]
            font-bold
            uppercase
            tracking-wider
            text-(--admin-text-secondary)
          "
        >
          {label}

          {required && (
            <span className="ml-1 text-red-500">
              *
            </span>
          )}
        </label>

        {hint && (
          <span className="hidden text-[9px] text-(--admin-text-muted) sm:block">
            {hint}
          </span>
        )}
      </div>

      {children}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| MEDIA UPLOAD CARD
|--------------------------------------------------------------------------
*/

function MediaUploadCard({
  type,
  title,
  description,
  inputRef,
  file,
  preview,
  existingValue,
  onFileChange,
  onDrop,
  onRemove,
  onOpen,
}) {
  const isVideo = type === "video";

  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border
        border-(--admin-border)
        bg-(--admin-surface-soft)
      "
    >
      {/* HEADER */}

      <div className="flex items-start justify-between gap-3 border-b border-(--admin-border) p-4">
        <div className="flex items-start gap-3">
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-(--admin-surface)
              text-(--admin-primary)
            "
          >
            {isVideo ? (
              <Video size={17} />
            ) : (
              <ImageIcon size={17} />
            )}
          </div>

          <div>
            <p className="text-xs font-bold">
              {title}
            </p>

            <p className="mt-1 text-[10px] leading-relaxed text-(--admin-text-muted)">
              {description}
            </p>
          </div>
        </div>

        {file && (
          <span
            className="
              rounded-full
              bg-(--admin-primary)
              px-2
              py-1
              text-[9px]
              font-bold
              text-white
            "
          >
            New file
          </span>
        )}
      </div>

      {/* PREVIEW / UPLOAD */}

      <div className="p-4">
        {preview ? (
          <div className="relative overflow-hidden rounded-xl border border-(--admin-border) bg-black">
            {isVideo ? (
              <video
                src={preview}
                controls
                playsInline
                preload="metadata"
                className="
                  h-64
                  w-full
                  object-contain
                  sm:h-72
                "
              />
            ) : (
              <img
                src={preview}
                alt="Preview"
                className="
                  h-64
                  w-full
                  object-cover
                  sm:h-72
                "
              />
            )}

            <div className="absolute left-3 top-3">
              <span
                className="
                  rounded-lg
                  bg-black/70
                  px-2.5
                  py-1.5
                  text-[9px]
                  font-bold
                  text-white
                  backdrop-blur
                "
              >
                {file
                  ? file.name
                  : "Current media"}
              </span>
            </div>

            <button
              type="button"
              onClick={onRemove}
              className="
                absolute
                right-3
                top-3
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                bg-black/70
                text-white
                backdrop-blur
                transition
                hover:bg-red-600
              "
              title="Remove media"
            >
              <Trash2 size={14} />
            </button>

            {isVideo && (
              <div
                className="
                  pointer-events-none
                  absolute
                  bottom-3
                  left-3
                  flex
                  items-center
                  gap-1.5
                  rounded-lg
                  bg-black/70
                  px-2.5
                  py-1.5
                  text-[9px]
                  font-bold
                  text-white
                  backdrop-blur
                "
              >
                <Play size={11} />
                Video Preview
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpen}
            onDragOver={(event) =>
              event.preventDefault()
            }
            onDrop={onDrop}
            className="
              group
              flex
              min-h-64
              w-full
              flex-col
              items-center
              justify-center
              rounded-xl
              border
              border-dashed
              border-(--admin-control-border)
              bg-(--admin-control-bg)
              px-5
              text-center
              transition
              hover:border-(--admin-primary)
              hover:bg-(--admin-surface)
              sm:min-h-72
            "
          >
            <div
              className="
                mb-4
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-(--admin-surface)
                text-(--admin-primary)
                shadow-sm
                transition
                group-hover:scale-105
              "
            >
              <Upload size={22} />
            </div>

            <p className="text-sm font-bold">
              Click to upload
            </p>

            <p className="mt-1 text-[10px] text-(--admin-text-muted)">
              or drag and drop your file here
            </p>

            <span className="mt-4 rounded-lg border border-(--admin-control-border) bg-(--admin-surface) px-3 py-1.5 text-[9px] font-bold text-(--admin-text-secondary)">
              {isVideo
                ? "MP4 / WebM / MOV • Max 100MB"
                : "JPG / PNG / WEBP • Max 10MB"}
            </span>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={
            isVideo
              ? "video/mp4,video/webm,video/quicktime,video/*"
              : "image/jpeg,image/png,image/webp,image/*"
          }
          onChange={onFileChange}
          className="hidden"
        />

        {/* FILE INFO */}

        {file && (
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-(--admin-border) bg-(--admin-surface) p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--admin-surface-soft) text-(--admin-primary)">
              {isVideo ? (
                <FileVideo size={16} />
              ) : (
                <ImageIcon size={16} />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-bold">
                {file.name}
              </p>

              <p className="mt-0.5 text-[9px] text-(--admin-text-muted)">
                {formatBytes(file.size)}
              </p>
            </div>

            <button
              type="button"
              onClick={onRemove}
              className="
                rounded-lg
                p-2
                text-(--admin-text-muted)
                transition
                hover:bg-red-50
                hover:text-red-600
                dark:hover:bg-red-950/30
              "
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* EXISTING URL */}

        {!file && existingValue && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-(--admin-border) bg-(--admin-surface) px-3 py-2">
            <LinkIcon
              size={13}
              className="shrink-0 text-(--admin-text-muted)"
            />

            <span className="min-w-0 flex-1 truncate text-[9px] text-(--admin-text-muted)">
              {existingValue}
            </span>

            <a
              href={existingValue}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 text-(--admin-primary)"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <ExternalLink size={13} />
            </a>
          </div>
        )}

        {/* RE-UPLOAD */}

        {preview && (
          <button
            type="button"
            onClick={onOpen}
            className="
              mt-3
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-lg
              border
              border-(--admin-control-border)
              bg-(--admin-control-bg)
              py-2.5
              text-[10px]
              font-bold
              text-(--admin-text-secondary)
              transition
              hover:bg-(--admin-surface)
              hover:text-(--admin-text)
            "
          >
            <Upload size={13} />
            Replace {isVideo ? "Video" : "Image"}
          </button>
        )}
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| SHOP BY NEED CARD
|--------------------------------------------------------------------------
*/

function ShopByNeedCard({
  item,
  openMenuId,
  setOpenMenuId,
  onEdit,
  onDelete,
  onToggle,
  deleteLoading,
  onPreview,
}) {
  const id = getId(item);

 const image = getMediaUrl(
  item?.fallbackImage || ""
);

const video = getMediaUrl(
  item?.video || ""
);

  const isOpen =
    openMenuId === id;

  return (
    <motion.article
      layout
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -10,
      }}
      className="
        overflow-visible
        rounded-xl
        border
        border-(--admin-border)
        bg-(--admin-surface)
        shadow-(--admin-card-shadow)
      "
    >
      <div className="flex flex-col sm:flex-row">
        {/* MEDIA */}

        <div className="group relative h-52 shrink-0 overflow-hidden bg-(--admin-surface-soft) sm:h-auto sm:w-56">
          {video ? (
            <video
              src={video}
              muted
              playsInline
              preload="metadata"
              className="
                h-60
                min-h-52
                w-full
                object-cover
              "
            />
          ) : image ? (
            <img
              src={image}
              alt={item?.title || "Shop by need"}
              className="
                h-full
                min-h-52
                w-full
                object-cover
                transition
                duration-300
                hover:scale-105
              "
            />
          ) : (
            <div className="flex h-full min-h-52 items-center justify-center">
              <ImageIcon
                size={32}
                className="text-(--admin-text-muted)"
              />
            </div>
          )}

          {/* MEDIA TYPE */}

          <div className="absolute left-3 top-3">
            <span
              className="
                flex
                items-center
                gap-1.5
                rounded-lg
                bg-black/65
                px-2
                py-1.5
                text-[9px]
                font-bold
                text-white
                backdrop-blur
              "
            >
              {video ? (
                <>
                  <Video size={11} />
                  VIDEO
                </>
              ) : (
                <>
                  <ImageIcon size={11} />
                  IMAGE
                </>
              )}
            </span>
          </div>
          <button
  type="button"
  onClick={() => onPreview(item)}
  className="
    absolute
    bottom-3
    right-3
    z-10
    inline-flex
    items-center
    gap-1.5
    rounded-lg
    bg-black/40
    px-3
    py-1.5
    text-xs
    font-medium
    text-white
    opacity-0
    backdrop-blur-md
    transition-all
    duration-200
    group-hover:opacity-100
    hover:bg-black/60
  "
>
  <Eye size={14} />
  Preview
</button>
        </div>

        {/* CONTENT */}

        <div className="min-w-0 flex-1 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {item?.eyebrow && (
                <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-(--admin-primary)">
                  {item.eyebrow}
                </p>
              )}

              <h3 className="truncate text-base font-bold">
                {item?.title || "Untitled"}
              </h3>
            </div>

            {/* MENU */}

            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() =>
                  setOpenMenuId(
                    isOpen ? null : id
                  )
                }
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  text-(--admin-text-muted)
                  transition
                  hover:bg-(--admin-surface-soft)
                  hover:text-(--admin-text)
                "
              >
                <MoreVertical size={17} />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      scale: 0.96,
                      y: -4,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.96,
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
                  >
                    <MenuButton
                      icon={<Pencil size={14} />}
                      onClick={() => {
                        setOpenMenuId(null);
                        onEdit(item);
                      }}
                    >
                      Edit
                    </MenuButton>

                    <MenuButton
  icon={<Eye size={15} />}
  onClick={() => {
    setOpenMenuId(null);
    onPreview(item);
  }}
>
  Preview
</MenuButton>
                    <MenuButton
                      icon={
                        item?.isActive ? (
                          <EyeOff size={14} />
                        ) : (
                          <Eye size={14} />
                        )
                      }
                      onClick={() =>
                        onToggle(item)
                      }
                    >
                      {item?.isActive
                        ? "Deactivate"
                        : "Activate"}
                    </MenuButton>

                    <MenuButton
                      danger
                      icon={<Trash2 size={14} />}
                      disabled={deleteLoading}
                      onClick={() =>
                        onDelete(item)
                      }
                    >
                      Delete
                    </MenuButton>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-(--admin-text-secondary)">
            {item?.description ||
              "No description available."}
          </p>

          {/* BADGES */}

          <div className="mt-4 flex flex-wrap gap-2">
            <InfoBadge
              label={`Order ${item?.order ?? 0}`}
              icon={<ArrowUpDown size={11} />}
            />

            <InfoBadge
              label={
                item?.isActive
                  ? "Active"
                  : "Inactive"
              }
              icon={
                item?.isActive ? (
                  <CheckCircle2 size={11} />
                ) : (
                  <CircleOff size={11} />
                )
              }
              active={item?.isActive}
            />

            {item?.icon && (
              <InfoBadge
                label={item.icon}
              />
            )}
          </div>

          {/* QUERY */}

          {item?.query && (
            <div className="mt-4 rounded-lg border border-(--admin-border) bg-(--admin-surface-soft) px-3 py-2">
              <p className="text-[9px] font-bold uppercase tracking-wider text-(--admin-text-muted)">
                Product Query
              </p>

              <p className="mt-1 truncate text-[10px] font-semibold text-(--admin-text-secondary)">
                {item.query}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

/*
|--------------------------------------------------------------------------
| INFO BADGE
|--------------------------------------------------------------------------
*/

function InfoBadge({
  label,
  icon,
  active,
}) {
  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-lg
        px-2
        py-1.5
        text-[9px]
        font-bold
        ${
          active === true
            ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300"
            : active === false
              ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              : "bg-(--admin-surface-soft) text-(--admin-text-muted)"
        }
      `}
    >
      {icon}
      {label}
    </span>
  );
}

/*
|--------------------------------------------------------------------------
| MENU BUTTON
|--------------------------------------------------------------------------
*/

function MenuButton({
  icon,
  children,
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
        gap-2.5
        rounded-lg
        px-3
        py-2.5
        text-left
        text-[11px]
        font-semibold
        transition
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${
          danger
            ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            : "text-(--admin-text-secondary) hover:bg-(--admin-surface-soft) hover:text-(--admin-text)"
        }
      `}
    >
      {icon}
      {children}
    </button>
  );
}

/*
|--------------------------------------------------------------------------
| EMPTY STATE
|--------------------------------------------------------------------------
*/

function EmptyState({
  hasFilters,
  onAdd,
  onClear,
}) {
  return (
    <div
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
        <Layers3 size={24} />
      </div>

      <h3 className="mt-4 text-sm font-bold">
        {hasFilters
          ? "No matching items"
          : "No Shop By Need items yet"}
      </h3>

      <p className="mt-1 max-w-md text-xs leading-relaxed text-(--admin-text-muted)">
        {hasFilters
          ? "Try changing your search or status filter."
          : "Create your first homepage discovery item to start building this section."}
      </p>

      <div className="mt-5 flex gap-2">
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="
              h-9
              rounded-lg
              border
              border-(--admin-control-border)
              bg-(--admin-control-bg)
              px-4
              text-[10px]
              font-bold
            "
          >
            Clear Filters
          </button>
        )}

        <button
          type="button"
          onClick={onAdd}
          className="
            flex
            h-9
            items-center
            gap-2
            rounded-lg
            bg-(--admin-primary)
            px-4
            text-[10px]
            font-bold
            text-white
          "
        >
          <Plus size={14} />
          Add Item
        </button>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| FORMAT FILE SIZE
|--------------------------------------------------------------------------
*/

function formatBytes(bytes) {
  if (!bytes) return "0 Bytes";

  const units = [
    "Bytes",
    "KB",
    "MB",
    "GB",
  ];

  const index = Math.floor(
    Math.log(bytes) /
      Math.log(1024)
  );

  return `${(
    bytes /
    Math.pow(1024, index)
  ).toFixed(1)} ${units[index]}`;
}



function ShopByNeedPreviewModal({ item, onClose }) {
  const image = getMediaUrl(
    item?.fallbackImage || item?.image || ""
  );

  const video = getMediaUrl(
    item?.video || item?.videoUrl || ""
  );

  const previewIconMap = {
    "shopping-bag": ShoppingBag,
    smartphone: Smartphone,
    laptop: Laptop,
    shirt: Shirt,
    sofa: Sofa,
    sparkles: Sparkles,
    dumbbell: Dumbbell,
    watch: Watch,
    headphones: Headphones,
    footprints: Footprints,
    baby: Baby,
    car: Car,
  };

  const IconComponent =
    previewIconMap[item?.icon] || Layers3;

  return (
    <motion.div
      className="
        fixed
        inset-0
        z-[120]
        flex
        items-center
        justify-center
        bg-black/70
        p-3
        backdrop-blur-md
        sm:p-6
      "
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="
          relative
          w-full
          max-w-5xl
          overflow-hidden
          rounded-2xl
          bg-black
          shadow-2xl
        "
        initial={{
          opacity: 0,
          scale: 0.96,
          y: 20,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.96,
          y: 20,
        }}
        transition={{
          duration: 0.25,
          ease: "easeOut",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="
            absolute
            right-4
            top-4
            z-30
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            bg-black/45
            text-white
            backdrop-blur-md
            transition
            hover:bg-black/70
          "
        >
          <X size={20} />
        </button>

        {/* Media */}
        <div className="relative min-h-[520px] overflow-hidden sm:min-h-[600px]">
          {video ? (
            <video
              src={video}
              autoPlay
              muted
              loop
              playsInline
              controls
              preload="metadata"
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
              "
            />
          ) : image ? (
            <img
              src={image}
              alt={item?.title || "Shop by Need"}
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
                flex
                flex-col
                items-center
                justify-center
                gap-4
                bg-(--admin-control-bg)
                text-(--admin-text-muted)
              "
            >
              <IconComponent size={64} />
              <span className="text-sm">
                No preview media available
              </span>
            </div>
          )}

          {/* Overlay */}
          <div
            className="
              absolute
              inset-0
              bg-gradient-to-t
              from-black/90
              via-black/40
              to-black/10
            "
          />

          {/* Content */}
          <div
            className="
              absolute
              inset-x-0
              bottom-0
              z-10
              p-5
              sm:p-8
              lg:p-10
            "
          >
            <div className="max-w-3xl">
              {/* Eyebrow */}
              {item?.eyebrow && (
                <div className="mb-3">
                  <span
                    className="
                      inline-flex
                      rounded-full
                      border
                      border-white/20
                      bg-white/10
                      px-3
                      py-1.5
                      text-xs
                      font-medium
                      uppercase
                      tracking-wider
                      text-white
                      backdrop-blur-md
                    "
                  >
                    {item.eyebrow}
                  </span>
                </div>
              )}

              {/* Icon */}
              <div
                className="
                  mb-4
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/20
                  bg-white/15
                  text-white
                  backdrop-blur-md
                "
              >
                <IconComponent size={22} />
              </div>

              {/* Title */}
              <h2
                className="
                  text-3xl
                  font-bold
                  tracking-tight
                  text-white
                  sm:text-4xl
                  lg:text-5xl
                "
              >
                {item?.title || "Shop By Need"}
              </h2>

              {/* Description */}
              {item?.description && (
                <p
                  className="
                    mt-3
                    max-w-2xl
                    text-sm
                    leading-6
                    text-white/80
                    sm:text-base
                    sm:leading-7
                  "
                >
                  {item.description}
                </p>
              )}

              {/* Details */}
              <div className="mt-5 flex flex-wrap gap-2">
                {item?.category && (
                  <span
                    className="
                      rounded-lg
                      border
                      border-white/15
                      bg-white/10
                      px-3
                      py-1.5
                      text-xs
                      text-white/85
                      backdrop-blur-md
                    "
                  >
                    Category: {item.category}
                  </span>
                )}

                {item?.query && (
                  <span
                    className="
                      rounded-lg
                      border
                      border-white/15
                      bg-white/10
                      px-3
                      py-1.5
                      text-xs
                      text-white/85
                      backdrop-blur-md
                    "
                  >
                    Query: {item.query}
                  </span>
                )}

                {item?.order !== undefined && (
                  <span
                    className="
                      rounded-lg
                      border
                      border-white/15
                      bg-white/10
                      px-3
                      py-1.5
                      text-xs
                      text-white/85
                      backdrop-blur-md
                    "
                  >
                    Order: {item.order}
                  </span>
                )}

                <span
                  className="
                    rounded-lg
                    border
                    border-white/15
                    bg-white/10
                    px-3
                    py-1.5
                    text-xs
                    text-white/85
                    backdrop-blur-md
                  "
                >
                  {item?.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}