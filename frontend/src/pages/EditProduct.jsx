import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Save,
  Upload,
  Trash2,
  Image as ImageIcon,
  Package,
  CircleCheck,
  AlertCircle,
  Layers,
  FolderTree,
  ChevronDown,
  Search,
  CheckCircle,
} from "lucide-react";

import {
  getProductById,
  editProduct,
} from "../redux/slices/productSlice";

import {
  getRootCategories,
  getCategoryChildren,
  getCategoryById,
  selectRootCategories,
  selectCategoryChildren,
  selectCategoryLoading,
} from "../redux/slices/categorySlice";

/* =========================================================
   HELPERS
========================================================= */

const getId = (category) => {
  if (!category) return "";

  return String(
    category?._id ||
      category?.id ||
      ""
  );
};

const getCategoryName = (category) => {
  if (!category) return "";

  return (
    category?.name ||
    category?.title ||
    category?.categoryName ||
    ""
  );
};

const getParentId = (category) => {
  if (!category) return "";

  return String(
    category?.parent?._id ||
      category?.parent?.id ||
      category?.parent ||
      category?.parentCategory?._id ||
      category?.parentCategory?.id ||
      category?.parentCategory ||
      ""
  );
};

const getImageValue = (image) => {
  if (!image) return "";

  if (typeof image === "string") {
    return image;
  }

  return (
    image?.url ||
    image?.secure_url ||
    image?.path ||
    image?.filename ||
    ""
  );
};

/* =========================================================
   COMPONENT
========================================================= */

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();

  /* =======================================================
     AUTH
  ======================================================= */

  const user = useSelector(
    (state) => state.auth?.user
  );

  const backPath =
    user?.role === "admin"
      ? "/admin/products"
      : "/vendor/products";

  /* =======================================================
     PRODUCT REDUX STATE
  ======================================================= */

  const {
    product,
    loading: reduxLoading,
    error: reduxError,
  } = useSelector(
    (state) => state.product
  );

  /* =======================================================
     CATEGORY REDUX STATE
  ======================================================= */

  const parentCategories = useSelector(
    selectRootCategories
  );

  const categoryLoading = useSelector(
    selectCategoryLoading
  );

  const [parentCategoryId, setParentCategoryId] =
    useState("");

  const [childCategoryId, setChildCategoryId] =
    useState("");

  const [finalCategoryId, setFinalCategoryId] =
    useState("");

  const [parentCategoriesLoaded, setParentCategoriesLoaded] =
    useState(false);

  /*
   * Children of selected parent
   */
  const childCategories = useSelector((state) =>
    parentCategoryId
      ? selectCategoryChildren(
          state,
          parentCategoryId
        )
      : []
  );

  /*
   * Children of selected child.
   * These are the final categories.
   */
  const finalCategories = useSelector((state) =>
    childCategoryId
      ? selectCategoryChildren(
          state,
          childCategoryId
        )
      : []
  );

  /* =======================================================
     API BASE URL
  ======================================================= */

  const BASE_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000";

  const getImageUrl = (image) => {
    if (!image) {
      return "/1786052049893.webp";
    }

    const imageValue =
      getImageValue(image);

    if (!imageValue) {
      return "/1786052049893.webp";
    }

    /*
     * Already a complete URL.
     */
    if (
      imageValue.startsWith("http://") ||
      imageValue.startsWith("https://") ||
      imageValue.startsWith("blob:")
    ) {
      return imageValue;
    }

    /*
     * Absolute uploads path.
     */
    if (
      imageValue.startsWith("/uploads/")
    ) {
      return `${BASE_URL}${imageValue}`;
    }

    /*
     * Relative uploads path.
     */
    if (
      imageValue.startsWith("uploads/")
    ) {
      return `${BASE_URL}/${imageValue}`;
    }

    /*
     * Normal relative filename/path.
     */
    if (imageValue.startsWith("/")) {
      return `${BASE_URL}${imageValue}`;
    }

    return `${BASE_URL}/${imageValue}`;
  };

  /* =======================================================
     PAGE STATE
  ======================================================= */

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* =======================================================
     FORM DATA
  ======================================================= */

  const [formData, setFormData] =
    useState({
      name: "",
      description: "",
      category: "",
      brand: "",
      price: "",
      mrp: "",
      discount: "",
      stock: "",
      sku: "",
      status: "active",
      hasVariants: false,
      variants: [],
    });

  /* =======================================================
     IMAGES
  ======================================================= */

  const [images, setImages] =
    useState([]);

  const [removedImages, setRemovedImages] =
    useState([]);

  /* =======================================================
     CATEGORY UI
  ======================================================= */

  const [categoryOpen, setCategoryOpen] =
    useState(false);

  const [categorySearch, setCategorySearch] =
    useState("");

  const categoryDropdownRef =
    useRef(null);

  /* =======================================================
     LOAD ROOT CATEGORIES
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    dispatch(getRootCategories())
      .unwrap()
      .catch((err) => {
        console.error(
          "Failed to load root categories:",
          err
        );
      })
      .finally(() => {
        if (mounted) {
          setParentCategoriesLoaded(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, [dispatch]);

  /* =======================================================
     LOAD PRODUCT
  ======================================================= */

  useEffect(() => {
    if (!id) {
      setError(
        "Product ID is missing."
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    dispatch(getProductById(id))
      .unwrap()
      .then(() => {
        setLoading(false);
      })
      .catch((err) => {
        setError(
          typeof err === "string"
            ? err
            : err?.message ||
                "Failed to load product."
        );

        setLoading(false);
      });
  }, [id, dispatch]);

  /* =======================================================
     POPULATE FORM WHEN PRODUCT LOADS
  ======================================================= */

  useEffect(() => {
    if (!product) return;

    const categoryId =
      typeof product.category === "object"
        ? getId(product.category)
        : String(
            product.category || ""
          );

    setFormData({
      name: product.name || "",

      description:
        product.description || "",

      category: categoryId,

      brand: product.brand || "",

      price:
        product.price ??
        product.sellingPrice ??
        "",

      mrp:
        product.mrp ??
        "",

      discount:
        product.discount ??
        "",

      stock:
        product.stock ??
        "",

      sku:
        product.sku ||
        "",

      status:
        product.status ||
        "active",

      hasVariants:
        product.hasVariants === true ||
        product.hasVariants === "true",

      variants:
        Array.isArray(product.variants)
          ? product.variants
          : [],
    });

    /*
     * Existing product images.
     */
    const productImages =
      Array.isArray(product.images)
        ? product.images.map(
            (image, index) => {
              const imageValue =
                getImageValue(image);

              return {
                id:
                  image?._id ||
                  image?.id ||
                  imageValue ||
                  `existing-image-${index}`,

                _id:
                  image?._id ||
                  null,

                url:
                  image?.url ||
                  imageValue ||
                  "",

                secure_url:
                  image?.secure_url ||
                  imageValue ||
                  "",

                originalUrl:
                  imageValue,

                isNew: false,
              };
            }
          )
        : [];

    setImages(productImages);
    setRemovedImages([]);
  }, [product]);

  /* =======================================================
     RESOLVE PRODUCT CATEGORY HIERARCHY
  ======================================================= */

  useEffect(() => {
    if (!product?.category) return;

    if (!parentCategoriesLoaded) {
      return;
    }

    const categoryId =
      typeof product.category === "object"
        ? getId(product.category)
        : String(
            product.category || ""
          );

    if (!categoryId) return;

    const categoryObject =
      typeof product.category === "object"
        ? product.category
        : null;

    /*
     * If backend already provides the hierarchy.
     *
     * Example:
     *
     * final category
     *   -> parent = child
     *       -> parent = root
     */
    const directParentId =
      categoryObject?.parent?._id ||
      categoryObject?.parent?.id ||
      categoryObject?.parent ||
      categoryObject?.parentCategory?._id ||
      categoryObject?.parentCategory?.id ||
      categoryObject?.parentCategory ||
      "";

    const parentParentId =
      categoryObject?.parent?.parent?._id ||
      categoryObject?.parent?.parent?.id ||
      categoryObject?.parent?.parent ||
      categoryObject?.parentCategory?.parent?._id ||
      categoryObject?.parentCategory?.parent?.id ||
      categoryObject?.parentCategory?.parent ||
      "";

    if (
      directParentId &&
      parentParentId
    ) {
      setParentCategoryId(
        String(parentParentId)
      );

      setChildCategoryId(
        String(directParentId)
      );

      setFinalCategoryId(
        String(categoryId)
      );

      return;
    }

    /*
     * Check if selected category is a root category.
     */
    const rootCategory =
      parentCategories.find(
        (category) =>
          String(
            getId(category)
          ) ===
          String(categoryId)
      );

    if (rootCategory) {
      setParentCategoryId(
        String(categoryId)
      );

      setChildCategoryId("");
      setFinalCategoryId("");

      return;
    }

    /*
     * Otherwise fetch category details.
     */
    dispatch(
      getCategoryById(categoryId)
    )
      .unwrap()
      .then((category) => {
        const parentId =
          getParentId(category);

        /*
         * No parent = root category.
         */
        if (!parentId) {
          setParentCategoryId(
            String(categoryId)
          );

          setChildCategoryId("");
          setFinalCategoryId("");

          return;
        }

        /*
         * Fetch parent to determine
         * whether current category is:
         *
         * Root -> Child
         *
         * or
         *
         * Root -> Child -> Final
         */
        return dispatch(
          getCategoryById(parentId)
        )
          .unwrap()
          .then((parentCategory) => {
            const grandParentId =
              getParentId(
                parentCategory
              );

            /*
             * Root -> Child -> Final
             */
            if (grandParentId) {
              setParentCategoryId(
                String(grandParentId)
              );

              setChildCategoryId(
                String(parentId)
              );

              setFinalCategoryId(
                String(categoryId)
              );
            } else {
              /*
               * Root -> Child
               */
              setParentCategoryId(
                String(parentId)
              );

              setChildCategoryId(
                String(categoryId)
              );

              setFinalCategoryId("");
            }
          });
      })
      .catch((err) => {
        console.error(
          "Failed to resolve category hierarchy:",
          err
        );
      });
  }, [
    product,
    parentCategoriesLoaded,
    parentCategories,
    dispatch,
  ]);

  /* =======================================================
     LOAD CHILDREN OF ROOT CATEGORY
  ======================================================= */

  useEffect(() => {
    if (!parentCategoryId) return;

    dispatch(
      getCategoryChildren(
        parentCategoryId
      )
    )
      .unwrap()
      .catch((err) => {
        console.error(
          "Failed to load child categories:",
          err
        );
      });
  }, [
    parentCategoryId,
    dispatch,
  ]);

  /* =======================================================
     LOAD FINAL CATEGORIES
  ======================================================= */

  useEffect(() => {
    if (!childCategoryId) return;

    dispatch(
      getCategoryChildren(
        childCategoryId
      )
    )
      .unwrap()
      .catch((err) => {
        console.error(
          "Failed to load final categories:",
          err
        );
      });
  }, [
    childCategoryId,
    dispatch,
  ]);

  /* =======================================================
     REDUX ERROR
  ======================================================= */

  useEffect(() => {
    if (!reduxError) return;

    setError((currentError) => {
      if (currentError) {
        return currentError;
      }

      return typeof reduxError === "string"
        ? reduxError
        : reduxError?.message ||
            "Something went wrong.";
    });
  }, [reduxError]);

  /* =======================================================
     CLOSE DROPDOWN OUTSIDE CLICK
  ======================================================= */

  useEffect(() => {
    const handleClickOutside = (
      event
    ) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(
          event.target
        )
      ) {
        setCategoryOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* =======================================================
     FORM CHANGE
  ======================================================= */

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  /* =======================================================
     CATEGORY SELECTION
  ======================================================= */

  const handleParentCategorySelect = (
    category
  ) => {
    const selectedId =
      getId(category);

    setParentCategoryId(
      String(selectedId)
    );

    setChildCategoryId("");
    setFinalCategoryId("");

    setFormData((prev) => ({
      ...prev,
      category: "",
    }));

    setCategorySearch("");
    setError("");
  };

  const handleChildCategorySelect = (
    category
  ) => {
    const selectedId =
      getId(category);

    setChildCategoryId(
      String(selectedId)
    );

    setFinalCategoryId("");

    setFormData((prev) => ({
      ...prev,
      category: "",
    }));

    setCategorySearch("");
    setError("");
  };

  const handleFinalCategorySelect = (
    category
  ) => {
    const selectedId =
      getId(category);

    setFinalCategoryId(
      String(selectedId)
    );

    setFormData((prev) => ({
      ...prev,
      category: String(selectedId),
    }));

    setCategoryOpen(false);
    setCategorySearch("");
    setError("");
  };

  /* =======================================================
     SELECTED CATEGORY OBJECTS
  ======================================================= */

  const selectedParent = useMemo(() => {
    return parentCategories.find(
      (category) =>
        String(
          getId(category)
        ) ===
        String(parentCategoryId)
    );
  }, [
    parentCategories,
    parentCategoryId,
  ]);

  const selectedChild = useMemo(() => {
    return childCategories.find(
      (category) =>
        String(
          getId(category)
        ) ===
        String(childCategoryId)
    );
  }, [
    childCategories,
    childCategoryId,
  ]);

  const selectedFinalCategory =
    useMemo(() => {
      return finalCategories.find(
        (category) =>
          String(
            getId(category)
          ) ===
          String(finalCategoryId)
      );
    }, [
      finalCategories,
      finalCategoryId,
    ]);

  /*
   * Used in product preview.
   */
  const selectedCategory =
    selectedFinalCategory ||
    selectedChild ||
    selectedParent;

  /* =======================================================
     FILTERED CATEGORIES
  ======================================================= */

  const normalizedSearch =
    categorySearch
      .trim()
      .toLowerCase();

  const filteredParentCategories =
    useMemo(() => {
      return parentCategories.filter(
        (category) =>
          getCategoryName(category)
            .toLowerCase()
            .includes(normalizedSearch)
      );
    }, [
      parentCategories,
      normalizedSearch,
    ]);

  const filteredChildCategories =
    useMemo(() => {
      return childCategories.filter(
        (category) =>
          getCategoryName(category)
            .toLowerCase()
            .includes(normalizedSearch)
      );
    }, [
      childCategories,
      normalizedSearch,
    ]);

  const filteredFinalCategories =
    useMemo(() => {
      return finalCategories.filter(
        (category) =>
          getCategoryName(category)
            .toLowerCase()
            .includes(normalizedSearch)
      );
    }, [
      finalCategories,
      normalizedSearch,
    ]);

  /* =======================================================
     IMAGE UPLOAD
  ======================================================= */

  const handleImageUpload = (e) => {
    const files = Array.from(
      e.target.files || []
    );

    if (!files.length) return;

    const validFiles = files.filter(
      (file) =>
        file.type ===
          "image/png" ||
        file.type ===
          "image/jpeg" ||
        file.type ===
          "image/webp"
    );

    if (!validFiles.length) {
      setError(
        "Please select PNG, JPG, or WEBP images."
      );

      e.target.value = "";
      return;
    }

    const newImages =
      validFiles.map(
        (file) => ({
          id: `new-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}`,

          file,

          preview:
            URL.createObjectURL(file),

          isNew: true,
        })
      );

    setImages((prev) => [
      ...prev,
      ...newImages,
    ]);

    setError("");
    e.target.value = "";
  };

  /* =======================================================
     REMOVE IMAGE
  ======================================================= */

  const removeImage = (imageId) => {
    const imageToRemove =
      images.find(
        (image) =>
          String(
            image.id ||
              image._id ||
              image.url
          ) ===
          String(imageId)
      );

    if (!imageToRemove) {
      return;
    }

    /*
     * New uploaded image.
     */
    if (imageToRemove.isNew) {
      if (
        imageToRemove.preview
      ) {
        URL.revokeObjectURL(
          imageToRemove.preview
        );
      }

      setImages((prev) =>
        prev.filter(
          (image) =>
            String(
              image.id ||
                image._id ||
                image.url
            ) !==
            String(imageId)
        )
      );

      return;
    }

    /*
     * Existing image.
     */
    const imageValue =
      imageToRemove._id ||
      imageToRemove.originalUrl ||
      imageToRemove.url;

    if (imageValue) {
      setRemovedImages(
        (current) => {
          if (
            current.includes(
              imageValue
            )
          ) {
            return current;
          }

          return [
            ...current,
            imageValue,
          ];
        }
      );
    }

    setImages((prev) =>
      prev.filter(
        (image) =>
          String(
            image.id ||
              image._id ||
              image.url
          ) !==
          String(imageId)
      )
    );
  };

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Product name is required.";
    }

    if (!formData.description.trim()) {
      return "Product description is required.";
    }

    if (!formData.category) {
      return "Please select the final product category.";
    }

    if (
      formData.price === "" ||
      Number(formData.price) <= 0
    ) {
      return "Please enter a valid price.";
    }

    if (
      formData.mrp !== "" &&
      Number(formData.mrp) < 0
    ) {
      return "MRP cannot be negative.";
    }

    if (
      formData.discount !== "" &&
      (Number(formData.discount) < 0 ||
        Number(formData.discount) > 100)
    ) {
      return "Discount must be between 0 and 100.";
    }

    if (
      formData.stock === "" ||
      Number(formData.stock) < 0
    ) {
      return "Please enter a valid stock quantity.";
    }

    return "";
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const data =
        new FormData();

      data.append(
        "name",
        formData.name.trim()
      );

      data.append(
        "description",
        formData.description.trim()
      );

      data.append(
        "category",
        String(
          formData.category
        )
      );

      data.append(
        "price",
        String(
          Number(formData.price)
        )
      );

      data.append(
        "stock",
        String(
          Number(formData.stock)
        )
      );

      data.append(
        "brand",
        formData.brand.trim()
      );

      data.append(
        "discount",
        String(
          formData.discount === ""
            ? 0
            : Number(
                formData.discount
              )
        )
      );

      data.append(
        "mrp",
        String(
          formData.mrp === ""
            ? 0
            : Number(formData.mrp)
        )
      );

      data.append(
        "sku",
        formData.sku
          .trim()
          .toUpperCase()
      );

      data.append(
        "status",
        formData.status ||
          "active"
      );

      data.append(
        "hasVariants",
        String(
          formData.hasVariants
        )
      );

      /*
       * Send variants if your backend
       * expects them.
       */
      if (
        Array.isArray(
          formData.variants
        )
      ) {
        data.append(
          "variants",
          JSON.stringify(
            formData.variants
          )
        );
      }

      /* -----------------------------------------------------
         NEW IMAGES
      ----------------------------------------------------- */

      images
        .filter(
          (image) =>
            image.isNew &&
            image.file
        )
        .forEach((image) => {
          data.append(
            "images",
            image.file
          );
        });

      /* -----------------------------------------------------
         REMOVED IMAGES
      ----------------------------------------------------- */

      removedImages.forEach(
        (image) => {
          data.append(
            "removeImages",
            image
          );
        }
      );

      const result =
        await dispatch(
          editProduct({
            id,
            data,
          })
        ).unwrap();

      setSuccess(
        result?.message ||
          "Product updated successfully."
      );

      /*
       * Small delay so user can see
       * success message.
       */
      setTimeout(() => {
        navigate(backPath);
      }, 900);
    } catch (err) {
      console.error(
        "Update product error:",
        err
      );

      setError(
        typeof err === "string"
          ? err
          : err?.message ||
              err?.error ||
              "Failed to update product."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     CLEANUP NEW IMAGE PREVIEWS
  ======================================================= */

  useEffect(() => {
    return () => {
      images.forEach(
        (image) => {
          if (
            image.isNew &&
            image.preview
          ) {
            URL.revokeObjectURL(
              image.preview
            );
          }
        }
      );
    };
  }, [images]);

  /* =======================================================
     PRICE CALCULATIONS
  ======================================================= */

  const price = Number(
    formData.price || 0
  );

  const discount = Number(
    formData.discount || 0
  );

  const discountedPrice =
    Math.max(
      0,
      price -
        (price * discount) /
          100
    );

  /* =======================================================
     LOADING
  ======================================================= */

  if (
    loading ||
    reduxLoading
  ) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

            <p className="text-sm text-slate-500">
              Loading product...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex min-w-0 items-center gap-3">

              <button
                type="button"
                onClick={() =>
                  navigate(backPath)
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
              >
                <ArrowLeft
                  size={18}
                />
              </button>

              <div className="min-w-0">

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>
                    Products
                  </span>

                  <span>/</span>

                  <span>
                    Edit Product
                  </span>
                </div>

                <h1 className="mt-1 truncate text-xl font-bold text-slate-900 sm:text-2xl">
                  Edit Product
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Update product information and inventory.
                </p>

              </div>
            </div>

            <div className="flex w-full gap-2 sm:w-auto">

              <button
                type="button"
                onClick={() =>
                  navigate(backPath)
                }
                disabled={saving}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="edit-product-form"
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
              >
                <Save size={17} />

                {saving
                  ? "Updating..."
                  : "Update Product"}
              </button>

            </div>

          </div>
        </div>
      </div>

      {/* =====================================================
          FORM
      ====================================================== */}

      <form
        id="edit-product-form"
        onSubmit={handleSubmit}
        className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8"
      >

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span>
              {error}
            </span>

          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">

            <CircleCheck
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span>
              {success}
            </span>

          </div>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

          {/* =================================================
              LEFT SIDE
          ================================================== */}

          <div className="space-y-6 xl:col-span-2">

            {/* PRODUCT INFORMATION */}

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 px-5 py-4 sm:px-6">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Package
                      size={18}
                    />
                  </div>

                  <div>

                    <h2 className="text-base font-semibold text-slate-900">
                      Product Information
                    </h2>

                    <p className="text-xs text-slate-400">
                      Basic information about your product.
                    </p>

                  </div>

                </div>

              </div>

              <div className="space-y-5 p-5 sm:p-6">

                {/* NAME */}

                <div>

                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Product Name
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={
                      formData.name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter product name"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                  />

                </div>

                {/* DESCRIPTION */}

                <div>

                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Description
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    value={
                      formData.description
                    }
                    onChange={
                      handleChange
                    }
                    rows={5}
                    placeholder="Enter product description"
                    className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                  />

                  <p className="mt-1.5 text-xs text-slate-400">
                    Provide a clear description of the product.
                  </p>

                </div>

                {/* CATEGORY */}

                <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

                  <div className="mb-5 flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                      <Layers
                        size={19}
                      />
                    </div>

                    <div>

                      <h2 className="text-base font-semibold text-gray-900">
                        Product Category
                      </h2>

                      <p className="text-xs text-gray-400">
                        Select parent, child, and final category.
                      </p>

                    </div>

                  </div>

                  <div
                    ref={
                      categoryDropdownRef
                    }
                    className="relative"
                  >

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Category
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    {/* SELECTED PATH */}

                    {parentCategoryId && (
                      <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3">

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <FolderTree
                            size={14}
                          />

                          <span>
                            Selected category
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2">

                          {selectedParent && (
                            <span className="rounded-lg border border-blue-100 bg-white px-3 py-1.5 text-sm font-medium text-gray-700">
                              {getCategoryName(
                                selectedParent
                              )}
                            </span>
                          )}

                          {selectedChild && (
                            <>
                              <span className="text-gray-400">
                                /
                              </span>

                              <span className="rounded-lg border border-blue-100 bg-white px-3 py-1.5 text-sm font-medium text-gray-700">
                                {getCategoryName(
                                  selectedChild
                                )}
                              </span>
                            </>
                          )}

                          {selectedFinalCategory && (
                            <>
                              <span className="text-gray-400">
                                /
                              </span>

                              <span className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white">
                                {getCategoryName(
                                  selectedFinalCategory
                                )}
                              </span>
                            </>
                          )}

                        </div>

                      </div>
                    )}

                    {/* CATEGORY BUTTON */}

                    <button
                      type="button"
                      disabled={
                        categoryLoading
                      }
                      onClick={() =>
                        setCategoryOpen(
                          (prev) =>
                            !prev
                        )
                      }
                      className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm text-gray-900 outline-none transition hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-gray-50"
                    >

                      <div className="min-w-0">

                        {categoryLoading ? (
                          <span className="text-gray-400">
                            Loading categories...
                          </span>
                        ) : selectedFinalCategory ? (
                          <div>

                            <p className="truncate text-sm font-semibold text-gray-900">
                              {getCategoryName(
                                selectedFinalCategory
                              )}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-gray-400">
                              {getCategoryName(
                                selectedParent
                              )}{" "}
                              /{" "}
                              {getCategoryName(
                                selectedChild
                              )}
                            </p>

                          </div>
                        ) : selectedChild ? (
                          <div>

                            <p className="truncate text-sm font-semibold text-gray-900">
                              {getCategoryName(
                                selectedChild
                              )}
                            </p>

                            <p className="mt-0.5 text-xs text-gray-400">
                              {getCategoryName(
                                selectedParent
                              )}
                            </p>

                          </div>
                        ) : selectedParent ? (
                          <p className="text-sm font-semibold text-gray-900">
                            {getCategoryName(
                              selectedParent
                            )}
                          </p>
                        ) : (
                          <span className="text-gray-400">
                            Select parent category
                          </span>
                        )}

                      </div>

                      <ChevronDown
                        size={18}
                        className={`shrink-0 text-gray-400 transition-transform ${
                          categoryOpen
                            ? "rotate-180"
                            : ""
                        }`}
                      />

                    </button>

                    {/* DROPDOWN */}

                    {categoryOpen && (
                      <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">

                        {/* SEARCH */}

                        <div className="border-b border-gray-100 p-3">

                          <div className="relative">

                            <Search
                              size={17}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                              type="text"
                              value={
                                categorySearch
                              }
                              onChange={(e) =>
                                setCategorySearch(
                                  e.target.value
                                )
                              }
                              placeholder={
                                !parentCategoryId
                                  ? "Search parent categories..."
                                  : !childCategoryId
                                  ? "Search child categories..."
                                  : "Search final categories..."
                              }
                              className="h-10 w-full rounded-lg border border-gray-200 pl-9 pr-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                              autoFocus
                            />

                          </div>

                        </div>

                        {/* =================================================
                            STEP 1
                        ================================================== */}

                        {!parentCategoryId && (
                          <div>

                            <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">

                              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                                Step 1
                              </p>

                              <p className="mt-1 text-sm font-semibold text-gray-800">
                                Select parent category
                              </p>

                            </div>

                            <div className="max-h-64 overflow-y-auto py-1">

                              {filteredParentCategories.map(
                                (
                                  category
                                ) => {
                                  const categoryId =
                                    getId(
                                      category
                                    );

                                  return (
                                    <button
                                      key={
                                        categoryId
                                      }
                                      type="button"
                                      onClick={() =>
                                        handleParentCategorySelect(
                                          category
                                        )
                                      }
                                      className="w-full px-4 py-3 text-left transition hover:bg-blue-50"
                                    >

                                      <div className="flex items-center justify-between gap-3">

                                        <div className="flex min-w-0 items-center gap-3">

                                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                                            <Layers
                                              size={
                                                17
                                              }
                                            />
                                          </div>

                                          <div className="min-w-0">

                                            <p className="truncate text-sm font-semibold">
                                              {getCategoryName(
                                                category
                                              )}
                                            </p>

                                          </div>

                                        </div>

                                        <ChevronDown
                                          size={
                                            17
                                          }
                                          className="-rotate-90 shrink-0 text-gray-400"
                                        />

                                      </div>

                                    </button>
                                  );
                                }
                              )}

                              {filteredParentCategories.length ===
                                0 && (
                                <div className="px-4 py-8 text-center text-sm text-gray-500">
                                  No parent categories found.
                                </div>
                              )}

                            </div>

                          </div>
                        )}

                        {/* =================================================
                            STEP 2
                        ================================================== */}

                        {parentCategoryId &&
                          !childCategoryId && (
                            <div>

                              <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">

                                <div className="flex items-center justify-between">

                                  <div>

                                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                                      Step 2
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-gray-800">
                                      Select child category
                                    </p>

                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setParentCategoryId(
                                        ""
                                      );

                                      setChildCategoryId(
                                        ""
                                      );

                                      setFinalCategoryId(
                                        ""
                                      );

                                      setFormData(
                                        (
                                          prev
                                        ) => ({
                                          ...prev,
                                          category:
                                            "",
                                        })
                                      );

                                      setCategorySearch(
                                        ""
                                      );
                                    }}
                                    className="text-xs font-semibold text-blue-600"
                                  >
                                    Change
                                  </button>

                                </div>

                                <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5">

                                  <Layers
                                    size={
                                      14
                                    }
                                    className="text-purple-500"
                                  />

                                  <span className="text-xs font-medium text-gray-700">
                                    {getCategoryName(
                                      selectedParent
                                    )}
                                  </span>

                                </div>

                              </div>

                              <div className="max-h-64 overflow-y-auto py-1">

                                {filteredChildCategories.map(
                                  (
                                    category
                                  ) => {
                                    const categoryId =
                                      getId(
                                        category
                                      );

                                    return (
                                      <button
                                        key={
                                          categoryId
                                        }
                                        type="button"
                                        onClick={() =>
                                          handleChildCategorySelect(
                                            category
                                          )
                                        }
                                        className="w-full px-4 py-3 text-left transition hover:bg-blue-50"
                                      >

                                        <div className="flex items-center justify-between">

                                          <div className="flex items-center gap-3">

                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                                              <FolderTree
                                                size={
                                                  16
                                                }
                                              />
                                            </div>

                                            <span className="text-sm font-medium text-gray-700">
                                              {getCategoryName(
                                                category
                                              )}
                                            </span>

                                          </div>

                                          <ChevronDown
                                            size={
                                              16
                                            }
                                            className="-rotate-90 text-gray-400"
                                          />

                                        </div>

                                      </button>
                                    );
                                  }
                                )}

                                {categoryLoading &&
                                  filteredChildCategories.length ===
                                    0 && (
                                    <div className="px-4 py-8 text-center text-sm text-gray-500">
                                      Loading child categories...
                                    </div>
                                  )}

                                {!categoryLoading &&
                                  filteredChildCategories.length ===
                                    0 && (
                                    <div className="px-4 py-8 text-center text-sm text-gray-500">
                                      No child categories found.
                                    </div>
                                  )}

                              </div>

                            </div>
                          )}

                        {/* =================================================
                            STEP 3
                        ================================================== */}

                        {parentCategoryId &&
                          childCategoryId && (
                            <div>

                              <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">

                                <div className="flex items-center justify-between">

                                  <div>

                                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                                      Step 3
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-gray-800">
                                      Select final category
                                    </p>

                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setChildCategoryId(
                                        ""
                                      );

                                      setFinalCategoryId(
                                        ""
                                      );

                                      setFormData(
                                        (
                                          prev
                                        ) => ({
                                          ...prev,
                                          category:
                                            "",
                                        })
                                      );

                                      setCategorySearch(
                                        ""
                                      );
                                    }}
                                    className="text-xs font-semibold text-blue-600"
                                  >
                                    Back
                                  </button>

                                </div>

                                <div className="mt-2 flex flex-wrap items-center gap-2">

                                  <span className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600">
                                    {getCategoryName(
                                      selectedParent
                                    )}
                                  </span>

                                  <span className="text-gray-400">
                                    /
                                  </span>

                                  <span className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                                    {getCategoryName(
                                      selectedChild
                                    )}
                                  </span>

                                </div>

                              </div>

                              <div className="max-h-64 overflow-y-auto py-1">

                                {filteredFinalCategories.map(
                                  (
                                    category
                                  ) => {
                                    const categoryId =
                                      getId(
                                        category
                                      );

                                    const selected =
                                      String(
                                        finalCategoryId
                                      ) ===
                                      String(
                                        categoryId
                                      );

                                    return (
                                      <button
                                        key={
                                          categoryId
                                        }
                                        type="button"
                                        onClick={() =>
                                          handleFinalCategorySelect(
                                            category
                                          )
                                        }
                                        className={`w-full px-4 py-3 text-left transition ${
                                          selected
                                            ? "bg-blue-50"
                                            : "hover:bg-gray-50"
                                        }`}
                                      >

                                        <div className="flex items-center justify-between">

                                          <div className="flex items-center gap-3">

                                            <div
                                              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                                selected
                                                  ? "bg-blue-100 text-blue-600"
                                                  : "bg-gray-100 text-gray-500"
                                              }`}
                                            >
                                              <FolderTree
                                                size={
                                                  16
                                                }
                                              />
                                            </div>

                                            <span
                                              className={`text-sm ${
                                                selected
                                                  ? "font-semibold text-blue-700"
                                                  : "font-medium text-gray-700"
                                              }`}
                                            >
                                              {getCategoryName(
                                                category
                                              )}
                                            </span>

                                          </div>

                                          {selected && (
                                            <CheckCircle
                                              size={
                                                17
                                              }
                                              className="text-blue-600"
                                            />
                                          )}

                                        </div>

                                      </button>
                                    );
                                  }
                                )}

                                {categoryLoading &&
                                  filteredFinalCategories.length ===
                                    0 && (
                                    <div className="px-4 py-8 text-center text-sm text-gray-500">
                                      Loading final categories...
                                    </div>
                                  )}

                                {!categoryLoading &&
                                  filteredFinalCategories.length ===
                                    0 && (
                                    <div className="px-4 py-8 text-center text-sm text-gray-500">
                                      No final categories found.
                                    </div>
                                  )}

                              </div>

                            </div>
                          )}

                      </div>
                    )}

                    <p className="mt-2 text-xs text-gray-400">
                      Choose parent → child → final category.
                    </p>

                  </div>

                </section>

                {/* BRAND */}

                <div>

                  <label
                    htmlFor="brand"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Brand
                  </label>

                  <input
                    id="brand"
                    name="brand"
                    type="text"
                    value={
                      formData.brand
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter brand"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                  />

                </div>

                {/* PRICE + MRP */}

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                  <div>

                    <label
                      htmlFor="price"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Price
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <div className="relative">

                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                       ₹
                      </span>

                      <input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          formData.price
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="0.00"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                      />

                    </div>

                  </div>

                  <div>

                    <label
                      htmlFor="mrp"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      MRP
                    </label>

                    <div className="relative">

                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                       ₹
                      </span>

                      <input
                        id="mrp"
                        name="mrp"
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          formData.mrp
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="0.00"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                      />

                    </div>

                  </div>

                </div>

                {/* DISCOUNT + STOCK */}

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                  <div>

                    <label
                      htmlFor="discount"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Discount
                    </label>

                    <div className="relative">

                      <input
                        id="discount"
                        name="discount"
                        type="number"
                        min="0"
                        max="100"
                        value={
                          formData.discount
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="0"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                      />

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                        %
                      </span>

                    </div>

                  </div>

                  <div>

                    <label
                      htmlFor="stock"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Stock
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      id="stock"
                      name="stock"
                      type="number"
                      min="0"
                      value={
                        formData.stock
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="0"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                    />

                  </div>

                </div>

                {/* SKU */}

                <div>

                  <label
                    htmlFor="sku"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    SKU
                  </label>

                  <input
                    id="sku"
                    name="sku"
                    type="text"
                    value={
                      formData.sku
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. NIKE-270"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm uppercase text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                  />

                </div>
{formData.hasVariants && (
  <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
      <h2 className="text-base font-semibold text-slate-900">
        Product Variants
      </h2>

      <p className="mt-1 text-xs text-slate-400">
        Manage variants using their attributes.
      </p>
    </div>

  {formData.variants.map((variant, variantIndex) => (
  <div
    key={variantIndex}
    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
  >
    {/* Variant title */}
    <div className="mb-4">
      <p className="text-sm font-semibold text-slate-900">
        {variant.attributes
          ?.map((attr) => attr.value)
          .filter(Boolean)
          .join(" / ") || `Variant ${variantIndex + 1}`}
      </p>
    </div>

    {/* PRICE / MRP / STOCK */}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

      {/* PRICE */}
      <div>
        <label className="mb-2 block text-xs font-medium text-slate-600">
          Price
        </label>

        <input
          type="number"
          value={variant.price ?? ""}
          onChange={(e) => {
            const value = e.target.value;

            setFormData((prev) => ({
              ...prev,
              variants: prev.variants.map((item, i) =>
                i === variantIndex
                  ? {
                      ...item,
                      price: value,
                    }
                  : item
              ),
            }));
          }}
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
        />
      </div>

      {/* MRP */}
      <div>
        <label className="mb-2 block text-xs font-medium text-slate-600">
          MRP
        </label>

        <input
          type="number"
          value={variant.mrp ?? ""}
          onChange={(e) => {
            const value = e.target.value;

            setFormData((prev) => ({
              ...prev,
              variants: prev.variants.map((item, i) =>
                i === variantIndex
                  ? {
                      ...item,
                      mrp: value,
                    }
                  : item
              ),
            }));
          }}
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
        />
      </div>

      {/* STOCK */}
      <div>
        <label className="mb-2 block text-xs font-medium text-slate-600">
          Stock
        </label>

        <input
          type="number"
          value={variant.stock ?? ""}
          onChange={(e) => {
            const value = e.target.value;

            setFormData((prev) => ({
              ...prev,
              variants: prev.variants.map((item, i) =>
                i === variantIndex
                  ? {
                      ...item,
                      stock: value,
                    }
                  : item
              ),
            }));
          }}
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
        />
      </div>
    </div>

    {/* ATTRIBUTES */}
    <div className="mt-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-600">
          Attributes
        </p>

        <button
          type="button"
          onClick={() => {
            setFormData((prev) => ({
              ...prev,
              variants: prev.variants.map((item, i) =>
                i === variantIndex
                  ? {
                      ...item,
                      attributes: [
                        ...(item.attributes || []),
                        {
                          name: "",
                          value: "",
                        },
                      ],
                    }
                  : item
              ),
            }));
          }}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
        >
          + Add Attribute
        </button>
      </div>

      <div className="space-y-3">
        {(variant.attributes || []).map(
          (attribute, attributeIndex) => (
            <div
              key={attributeIndex}
              className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]"
            >
              {/* ATTRIBUTE NAME */}
              <input
                type="text"
                value={attribute.name || ""}
                placeholder="Attribute name"
                onChange={(e) => {
                  const value = e.target.value;

                  setFormData((prev) => ({
                    ...prev,
                    variants: prev.variants.map(
                      (item, i) =>
                        i === variantIndex
                          ? {
                              ...item,
                              attributes:
                                item.attributes.map(
                                  (attr, ai) =>
                                    ai === attributeIndex
                                      ? {
                                          ...attr,
                                          name: value,
                                        }
                                      : attr
                                ),
                            }
                          : item
                    ),
                  }));
                }}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
              />

              {/* ATTRIBUTE VALUE */}
              <input
                type="text"
                value={attribute.value || ""}
                placeholder="Attribute value"
                onChange={(e) => {
                  const value = e.target.value;

                  setFormData((prev) => ({
                    ...prev,
                    variants: prev.variants.map(
                      (item, i) =>
                        i === variantIndex
                          ? {
                              ...item,
                              attributes:
                                item.attributes.map(
                                  (attr, ai) =>
                                    ai === attributeIndex
                                      ? {
                                          ...attr,
                                          value,
                                        }
                                      : attr
                                ),
                            }
                          : item
                    ),
                  }));
                }}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
              />

              {/* REMOVE ATTRIBUTE */}
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    variants: prev.variants.map(
                      (item, i) =>
                        i === variantIndex
                          ? {
                              ...item,
                              attributes:
                                item.attributes.filter(
                                  (_, ai) =>
                                    ai !== attributeIndex
                                ),
                            }
                          : item
                    ),
                  }));
                }}
                className="h-10 rounded-lg border border-red-200 bg-white px-3 text-red-500 hover:bg-red-50"
              >
                Remove
              </button>
            </div>
          )
        )}
      </div>
    </div>
  </div>
))}

  </section>
)}

              </div>

            </section>

            {/* =================================================
                IMAGES
            ================================================== */}

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 px-5 py-4 sm:px-6">

                <h2 className="text-base font-semibold text-slate-900">
                  Product Images
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Manage product images and upload new ones.
                </p>

              </div>

              <div className="p-5 sm:p-6">

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">

                  {images.map(
                    (image) => {
                      const imageKey =
                        image.id ||
                        image._id ||
                        image.url;

                      const imageSrc =
                        image.isNew
                          ? image.preview
                          : getImageUrl(
                              image.url ||
                                image.secure_url
                            );

                      return (
                        <div
                          key={
                            imageKey
                          }
                          className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                        >

                          {imageSrc ? (
                            <img
                              src={
                                imageSrc
                              }
                              alt="Product"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-slate-300">
                              <ImageIcon
                                size={
                                  36
                                }
                              />
                            </div>
                          )}

                          {image.isNew && (
                            <span className="absolute left-2 top-2 rounded-md bg-indigo-600 px-2 py-1 text-[9px] font-semibold text-white">
                              NEW
                            </span>
                          )}

                          <div className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-black/40 to-transparent p-2 opacity-0 transition group-hover:opacity-100">

                            <button
                              type="button"
                              onClick={() =>
                                removeImage(
                                  imageKey
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-red-500 shadow-sm transition hover:bg-red-50"
                              title="Remove image"
                            >
                              <Trash2
                                size={
                                  15
                                }
                              />
                            </button>

                          </div>

                        </div>
                      );
                    }
                  )}

                  {/* ADD IMAGE */}

                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600">

                    <Upload
                      size={22}
                    />

                    <span className="mt-2 text-xs font-medium">
                      Add Image
                    </span>

                    <span className="mt-1 text-[10px]">
                      PNG, JPG, WEBP
                    </span>

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      multiple
                      className="hidden"
                      onChange={
                        handleImageUpload
                      }
                    />

                  </label>

                </div>

                {images.length ===
                  0 && (
                  <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-400">
                    No product images have been added yet.
                  </div>
                )}

              </div>

            </section>

          </div>

          {/* =================================================
              RIGHT SIDEBAR
          ================================================== */}

          <div className="space-y-6">

            {/* STATUS */}

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 px-5 py-4">

                <h2 className="text-base font-semibold text-slate-900">
                  Product Status
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Control product visibility.
                </p>

              </div>

              <div className="p-5">

                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Status
                </label>

                <select
                  id="status"
                  name="status"
                  value={
                    formData.status
                  }
                  onChange={
                    handleChange
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                >

                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>

                </select>

                <div
                  className={`mt-4 flex items-center gap-3 rounded-xl px-3 py-3 ${
                    formData.status ===
                    "active"
                      ? "bg-emerald-50"
                      : "bg-slate-100"
                  }`}
                >

                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      formData.status ===
                      "active"
                        ? "bg-emerald-500"
                        : "bg-slate-400"
                    }`}
                  />

                  <span
                    className={`text-xs font-medium ${
                      formData.status ===
                      "active"
                        ? "text-emerald-700"
                        : "text-slate-600"
                    }`}
                  >
                    {formData.status ===
                    "active"
                      ? "Product is visible to customers"
                      : "Product is hidden from customers"}
                  </span>

                </div>

              </div>

            </section>

            {/* PREVIEW */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 px-5 py-4">

                <h2 className="text-base font-semibold text-slate-900">
                  Product Preview
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Preview how the product information looks.
                </p>

              </div>

              <div className="p-5">

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

                  <div className="relative flex aspect-square items-center justify-center bg-slate-50">

                    {images.length >
                      0 &&
                    (images[0].preview ||
                      images[0].url ||
                      images[0].secure_url) ? (

                      <img
                        src={
                          images[0].isNew
                            ? images[0].preview
                            : getImageUrl(
                                images[0].url ||
                                  images[0].secure_url
                              )
                        }
                        alt={
                          formData.name ||
                          "Product"
                        }
                        className="h-full w-full object-cover"
                      />

                    ) : (

                      <div className="flex flex-col items-center text-slate-300">

                        <ImageIcon
                          size={42}
                        />

                        <span className="mt-2 text-xs">
                          No image
                        </span>

                      </div>
                    )}

                    {formData.status ===
                      "active" && (
                      <span className="absolute left-3 top-3 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-semibold text-white">
                        Active
                      </span>
                    )}

                  </div>

                  <div className="p-4">

                    <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      {getCategoryName(
                        selectedCategory
                      ) ||
                        "Category"}
                    </p>

                    <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">
                      {formData.name ||
                        "Product Name"}
                    </h3>

                    {formData.brand && (
                      <p className="mt-1 text-xs text-slate-400">
                        {formData.brand}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-2">

                      <span className="text-base font-bold text-slate-900">
                       ₹
                        {discountedPrice.toFixed(
                          2
                        )}
                      </span>

                      {discount >
                        0 && (
                        <span className="text-xs text-slate-400 line-through">
                         ₹
                          {price.toFixed(
                            2
                          )}
                        </span>
                      )}

                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">

                      <span className="text-xs text-slate-400">
                        Stock
                      </span>

                      <span
                        className={`text-xs font-semibold ${
                          Number(
                            formData.stock
                          ) === 0
                            ? "text-red-500"
                            : Number(
                                  formData.stock
                                ) <= 5
                            ? "text-amber-500"
                            : "text-emerald-600"
                        }`}
                      >
                        {Number(
                          formData.stock
                        ) === 0
                          ? "Out of stock"
                          : `${formData.stock} available`}
                      </span>

                    </div>

                  </div>

                </div>

              </div>

            </section>

            {/* INVENTORY */}

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="p-5">

                <h3 className="text-sm font-semibold text-slate-900">
                  Inventory Information
                </h3>

                <div className="mt-4 space-y-3">

                  <div className="flex items-center justify-between">

                    <span className="text-xs text-slate-400">
                      SKU
                    </span>

                    <span className="max-w-[150px] truncate text-xs font-medium text-slate-700">
                      {formData.sku ||
                        "—"}
                    </span>

                  </div>

                  <div className="flex items-center justify-between">

                    <span className="text-xs text-slate-400">
                      Stock
                    </span>

                    <span className="text-xs font-semibold text-slate-700">
                      {formData.stock ||
                        0}
                    </span>

                  </div>

                  <div className="flex items-center justify-between">

                    <span className="text-xs text-slate-400">
                      Discount
                    </span>

                    <span className="text-xs font-semibold text-slate-700">
                      {formData.discount ||
                        0}
                      %
                    </span>

                  </div>

                </div>

              </div>

            </section>

          </div>

        </div>

        {/* ===================================================
            MOBILE ACTIONS
        ==================================================== */}

        <div className="mt-6 flex gap-3 border-t border-slate-200 pt-6 sm:hidden">

          <button
            type="button"
            onClick={() =>
              navigate(backPath)
            }
            disabled={saving}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >

            <Save size={17} />

            {saving
              ? "Updating..."
              : "Update"}

          </button>

        </div>

      </form>

    </div>
  );
}
