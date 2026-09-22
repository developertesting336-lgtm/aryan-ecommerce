import React, { useEffect, useState, useRef } from "react";
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

// import {
  
//   editProduct,
// } from "../../redux/slices/adminSlice";
import {getProductById,editProduct} from "../redux/slices/productSlice"
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
  return category?._id || category?.id || "";
};

const getCategoryName = (category) => {
  if (!category) return "";

  return (
    category.name ||
    category.title ||
    category.categoryName ||
    ""
  );
};

const getChildren = (category) => {
  return (
    category?.children ||
    category?.subcategories ||
    []
  );
};

/* =========================================================
   COMPONENT
========================================================= */

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
const {user} = useSelector((state)=> state.auth)
console.log("edit uer",user)
  /* =======================================================
     ADMIN / PRODUCT STATE
  ======================================================= */

  const {
    product,
    loading: reduxLoading,
    error: reduxError,
  } = useSelector((state) => state.product);

  /* =======================================================
     CATEGORY STATE FROM REDUX
  ======================================================= */

  const parentCategories = useSelector(
    selectRootCategories
  );

  const categoryLoading = useSelector(
    selectCategoryLoading
  );

  const [parentCategoryId, setParentCategoryId] =
    useState("");

  const [subcategoryId, setSubcategoryId] =
    useState("");

  /*
   * Subcategories are stored in Redux as:
   *
   * state.category.children[parentId]
   *
   * So we select only the children belonging to
   * the currently selected parent.
   */
  const subcategories = useSelector((state) =>
    parentCategoryId
      ? selectCategoryChildren(
          state,
          parentCategoryId
        )
      : []
  );

  /* =======================================================
     PAGE STATE
  ======================================================= */

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =======================================================
     FORM
  ======================================================= */

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    brand: "",
    price: "",
    discount: "",
    stock: "",
    sku: "",
    status: "active",
  });

  /* =======================================================
     IMAGES
  ======================================================= */

  const [images, setImages] = useState([]);

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

  const categoryScrollRef =
    useRef(null);

  /* =========================================================
     LOAD ROOT CATEGORIES
  ========================================================= */

  useEffect(() => {
    dispatch(getRootCategories())
      .unwrap()
      .catch((err) => {
        console.error(
          "Failed to load root categories:",
          err
        );
      });
  }, [dispatch]);

  /* =========================================================
     LOAD PRODUCT
  ========================================================= */

  useEffect(() => {
    if (!id) {
      setError("Product ID is missing.");
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

  /* =========================================================
     POPULATE FORM WHEN PRODUCT LOADS
  ========================================================= */

  useEffect(() => {
    if (!product) return;

    /*
     * Product category can be:
     *
     * category: "123"
     *
     * OR:
     *
     * category: {
     *   _id: "123",
     *   name: "Shoes"
     * }
     */

    const categoryId =
      typeof product.category === "object"
        ? product.category?._id
        : product.category;

    setFormData({
      name: product.name || "",
      description: product.description || "",
      category: categoryId || "",
      brand: product.brand || "",
      price: product.price ?? "",
      discount: product.discount ?? "",
      stock: product.stock ?? "",
      sku: product.sku || "",
      status: product.status || "active",
    });

    /* =====================================================
       IMAGES
    ===================================================== */

    const productImages = (
      product.images || []
    ).map((image, index) => {
      if (typeof image === "string") {
        return {
          id: `${image}-${index}`,
          _id: null,
          url: image,
          secure_url: image,
          isNew: false,
        };
      }

      return {
        id:
          image._id ||
          image.id ||
          image.url ||
          `image-${index}`,

        _id: image._id,

        url:
          image.url ||
          image.secure_url,

        secure_url:
          image.secure_url,

        isNew: false,
      };
    });

    setImages(productImages);
  }, [product]);

  /* =========================================================
     RESOLVE PRODUCT CATEGORY
  ========================================================= */

  /*
   * This is important for EDIT MODE.
   *
   * If product.category is already a root category,
   * select it directly.
   *
   * If it is a subcategory, call getCategoryById()
   * to find its parent.
   */

  useEffect(() => {
    if (!product?.category) return;

    const categoryId =
      typeof product.category === "object"
        ? getId(product.category)
        : product.category;

    if (!categoryId) return;

    /*
     * First check whether the product category
     * is itself a root category.
     */

    const existingParent =
      parentCategories.find(
        (category) =>
          String(getId(category)) ===
          String(categoryId)
      );

    if (existingParent) {
      setParentCategoryId(
        String(categoryId)
      );

      setSubcategoryId("");

      return;
    }

    /*
     * If not a root category, check whether the
     * product object already contains parent info.
     */

    if (
      typeof product.category === "object"
    ) {
      const productCategory =
        product.category;

      const parentId =
        productCategory?.parent?._id ||
        productCategory?.parent ||
        productCategory?.parentCategory?._id ||
        productCategory?.parentCategory ||
        "";

      if (parentId) {
        setParentCategoryId(
          String(parentId)
        );

        setSubcategoryId(
          String(categoryId)
        );

        return;
      }
    }

    /*
     * Otherwise ask the category API for the
     * category details.
     */

    dispatch(
      getCategoryById(categoryId)
    )
      .unwrap()
      .then((category) => {
        const parentId =
          category?.parent?._id ||
          category?.parent ||
          category?.parentCategory?._id ||
          category?.parentCategory ||
          "";

        if (parentId) {
          setParentCategoryId(
            String(parentId)
          );

          setSubcategoryId(
            String(categoryId)
          );
        }
      })
      .catch((err) => {
        console.error(
          "Failed to resolve product category:",
          err
        );
      });
  }, [
    product,
    parentCategories,
    dispatch,
  ]);

  /* =========================================================
     LOAD SUBCATEGORIES WHEN PARENT CHANGES
  ========================================================= */

  useEffect(() => {
    if (!parentCategoryId) return;

    /*
     * Check whether Redux already has the children.
     */

    const alreadyLoaded =
      subcategories.length > 0;

    if (alreadyLoaded) return;

    dispatch(
      getCategoryChildren(
        parentCategoryId
      )
    )
      .unwrap()
      .catch((err) => {
        console.error(
          "Failed to load subcategories:",
          err
        );
      });
  }, [
    parentCategoryId,
    dispatch,
    subcategories.length,
  ]);

  /* =========================================================
     ENSURE EDITED SUBCATEGORY IS LOADED
  ========================================================= */

  /*
   * When editing:
   *
   * 1. getCategoryById finds parent
   * 2. parentCategoryId changes
   * 3. getCategoryChildren loads children
   * 4. subcategoryId remains selected
   *
   * Nothing else is required here.
   */

  /* =========================================================
     REDUX ERROR
  ========================================================= */

  useEffect(() => {
    if (reduxError && !error) {
      setError(
        typeof reduxError === "string"
          ? reduxError
          : reduxError?.message ||
              "Something went wrong."
      );
    }
  }, [reduxError, error]);

  /* =========================================================
     CLOSE CATEGORY DROPDOWN OUTSIDE CLICK
  ========================================================= */

  useEffect(() => {
    const handleClickOutside = (event) => {
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

  /* =========================================================
     FORM CHANGE
  ========================================================= */

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  /* =========================================================
     SELECT PARENT CATEGORY
  ========================================================= */

  const handleParentCategorySelect = (
    category
  ) => {
    const categoryId =
      getId(category);

    setParentCategoryId(
      String(categoryId)
    );

    setSubcategoryId("");

    /*
     * Important:
     * Do NOT put parent category into
     * formData.category yet if your product
     * must use the subcategory.
     */

    setFormData((prev) => ({
      ...prev,
      category: "",
    }));

    setCategorySearch("");
  };

  /* =========================================================
     SELECT SUBCATEGORY
  ========================================================= */

  const handleSubcategorySelect = (
    subcategory
  ) => {
    const subId =
      getId(subcategory);

    setSubcategoryId(
      String(subId)
    );

    setFormData((prev) => ({
      ...prev,
      category: String(subId),
    }));

    setCategoryOpen(false);
    setCategorySearch("");

    setError("");
  };

  /* =========================================================
     IMAGE UPLOAD
  ========================================================= */

  const handleImageUpload = (e) => {
    const files = Array.from(
      e.target.files || []
    );

    if (!files.length) return;

    const newImages = files.map(
      (file) => ({
        id: `${file.name}-${Date.now()}-${Math.random()}`,

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

    e.target.value = "";
  };

  /* =========================================================
     REMOVE IMAGE
  ========================================================= */

  const removeImage = (imageId) => {
    setImages((prev) => {
      const imageToRemove =
        prev.find(
          (image) =>
            (image.id ||
              image._id ||
              image.url) ===
            imageId
        );

      if (!imageToRemove) {
        return prev;
      }

      /*
       * NEW IMAGE
       */

      if (imageToRemove.isNew) {
        if (
          imageToRemove.preview
        ) {
          URL.revokeObjectURL(
            imageToRemove.preview
          );
        }

        return prev.filter(
          (image) =>
            (image.id ||
              image._id ||
              image.url) !==
            imageId
        );
      }

      /*
       * EXISTING IMAGE
       */

      const imageValue =
        imageToRemove._id ||
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

      return prev.filter(
        (image) =>
          (image.id ||
            image._id ||
            image.url) !==
          imageId
      );
    });
  };

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Product name is required.";
    }

    if (!formData.description.trim()) {
      return "Product description is required.";
    }

    if (!formData.category) {
      return "Please select a category and subcategory.";
    }

    if (
      formData.price === "" ||
      Number(formData.price) <= 0
    ) {
      return "Please enter a valid price.";
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

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

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

      const data = new FormData();

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
        formData.category
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
        "sku",
        formData.sku
          .trim()
          .toUpperCase()
      );

      data.append(
        "status",
        formData.status
      );

      /*
       * NEW IMAGES
       */

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

      /*
       * REMOVED IMAGES
       */

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

      setTimeout(() => {
        navigate(
          user.role === "admin"?
          "/admin/products" : "/vendor/products"
        );
      }, 900);
    } catch (err) {
      setError(
        typeof err === "string"
          ? err
          : err?.message ||
              "Failed to update product."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     CLEANUP PREVIEW URLS
  ========================================================= */

  useEffect(() => {
    return () => {
      images.forEach((image) => {
        if (
          image.isNew &&
          image.preview
        ) {
          URL.revokeObjectURL(
            image.preview
          );
        }
      });
    };
  }, [images]);

  /* =========================================================
     SELECTED CATEGORY
  ========================================================= */

  const selectedCategory =
    parentCategories.find(
      (category) =>
        String(
          getId(category)
        ) ===
        String(
          formData.category
        )
    ) ||
    subcategories.find(
      (category) =>
        String(
          getId(category)
        ) ===
        String(
          formData.category
        )
    );

  const selectedParent =
    parentCategories.find(
      (category) =>
        String(
          getId(category)
        ) ===
        String(
          parentCategoryId
        )
    );

  const selectedSubcategory =
    subcategories.find(
      (category) =>
        String(
          getId(category)
        ) ===
        String(
          subcategoryId
        )
    );

  /* =========================================================
     PRICE
  ========================================================= */

  const price = Number(
    formData.price || 0
  );

  const discount = Number(
    formData.discount || 0
  );

  const discountedPrice =
    price -
    (price * discount) / 100;

  /* =========================================================
     FILTER CATEGORIES
  ========================================================= */

  const filteredParentCategories =
    parentCategories.filter(
      (category) =>
        getCategoryName(category)
          ?.toLowerCase()
          .includes(
            categorySearch.toLowerCase()
          )
    );

  const filteredSubcategories =
    subcategories.filter(
      (category) =>
        getCategoryName(category)
          ?.toLowerCase()
          .includes(
            categorySearch.toLowerCase()
          )
    );

  /* =========================================================
     LOADING
  ========================================================= */

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

  /* =========================================================
     PAGE
  ========================================================= */

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
                  navigate(
                   user.role === "admin"?
          "/admin/products" : "/vendor/products"
                  )
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
              >
                <ArrowLeft size={18} />
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
                  navigate(
                    user.role === "admin"?
          "/admin/products" : "/vendor/products"
                  )
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
              LEFT
          ================================================== */}

          <div className="space-y-6 xl:col-span-2">

            {/* PRODUCT INFORMATION */}

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 px-5 py-4 sm:px-6">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Package size={18} />
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
                    value={formData.name}
                    onChange={handleChange}
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
                    onChange={handleChange}
                    rows={5}
                    placeholder="Enter product description"
                    className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                  />

                  <p className="mt-1.5 text-xs text-slate-400">
                    Provide a clear description of the product.
                  </p>

                </div>

                {/* CATEGORY + BRAND */}

                {/* <div className="grid grid-cols-1 gap-5 md:grid-cols-2"> */}

                  {/* CATEGORY */}

                  <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

                    <div className="mb-5 flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                        <Layers size={19} />
                      </div>

                      <div>

                        <h2 className="text-base font-semibold text-gray-900">
                          Product Category
                        </h2>

                        <p className="text-xs text-gray-400">
                          Choose a parent category first, then select its subcategory.
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

                      {/* SELECTED */}

                      {(parentCategoryId ||
                        subcategoryId) && (
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
                              <span className="inline-flex items-center rounded-lg border border-blue-100 bg-white px-3 py-1.5 text-sm font-medium text-gray-700">
                                {getCategoryName(
                                  selectedParent
                                )}
                              </span>
                            )}

                            {selectedSubcategory && (
                              <>
                                <span className="text-gray-400">
                                  /
                                </span>

                                <span className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white">
                                  {getCategoryName(
                                    selectedSubcategory
                                  )}
                                </span>
                              </>
                            )}

                          </div>

                        </div>
                      )}

                      {/* BUTTON */}

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
                          ) : subcategoryId ? (
                            <div>

                              <p className="truncate text-sm font-semibold text-gray-900">
                                {getCategoryName(
                                  selectedSubcategory
                                )}
                              </p>

                              <p className="mt-0.5 text-xs text-gray-400">
                                {getCategoryName(
                                  selectedParent
                                )}
                              </p>

                            </div>
                          ) : parentCategoryId ? (
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
                                onChange={(
                                  e
                                ) =>
                                  setCategorySearch(
                                    e.target.value
                                  )
                                }
                                placeholder={
                                  parentCategoryId
                                    ? "Search subcategories..."
                                    : "Search parent categories..."
                                }
                                className="h-10 w-full rounded-lg border border-gray-200 pl-9 pr-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                                autoFocus
                              />

                            </div>

                          </div>

                          {/* PARENT */}

                          {!parentCategoryId ? (
                            <div>

                              <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">

                                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                                  Step 1
                                </p>

                                <p className="mt-1 text-sm font-semibold text-gray-800">
                                  Select a parent category
                                </p>

                              </div>

                              <div
                                ref={
                                  categoryScrollRef
                                }
                                className="max-h-64 overflow-y-auto py-1"
                              >

                                {filteredParentCategories.map(
                                  (
                                    category
                                  ) => {

                                    const categoryId =
                                      getId(
                                        category
                                      );

                                    const children =
                                      getChildren(
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

                                              <p className="mt-0.5 text-xs text-gray-400">
                                                {children.length >
                                                0
                                                  ? `${children.length} subcategories`
                                                  : "No subcategories"}
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
                          ) : (

                            /* SUBCATEGORY */

                            <div>

                              <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">

                                <div className="flex items-center justify-between gap-3">

                                  <div>

                                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                                      Step 2
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-gray-800">
                                      Select a subcategory
                                    </p>

                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setParentCategoryId(
                                        ""
                                      );

                                      setSubcategoryId(
                                        ""
                                      );

                                      setCategorySearch(
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
                                    }}
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
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

                                {filteredSubcategories.map(
                                  (
                                    subcategory
                                  ) => {

                                    const subId =
                                      getId(
                                        subcategory
                                      );

                                    const selected =
                                      String(
                                        subcategoryId
                                      ) ===
                                      String(
                                        subId
                                      );

                                    return (
                                      <button
                                        key={
                                          subId
                                        }
                                        type="button"
                                        onClick={() =>
                                          handleSubcategorySelect(
                                            subcategory
                                          )
                                        }
                                        className={`w-full px-4 py-3 text-left transition ${
                                          selected
                                            ? "bg-blue-50 text-blue-700"
                                            : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                      >

                                        <div className="flex items-center justify-between gap-3">

                                          <div className="flex min-w-0 items-center gap-3">

                                            <div
                                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                                selected
                                                  ? "bg-blue-100 text-blue-600"
                                                  : "bg-gray-100 text-gray-400"
                                              }`}
                                            >
                                              <FolderTree
                                                size={
                                                  16
                                                }
                                              />
                                            </div>

                                            <span
                                              className={`truncate text-sm ${
                                                selected
                                                  ? "font-semibold"
                                                  : "font-medium"
                                              }`}
                                            >
                                              {getCategoryName(
                                                subcategory
                                              )}
                                            </span>

                                          </div>

                                          {selected && (
                                            <CheckCircle
                                              size={
                                                17
                                              }
                                              className="shrink-0 text-blue-600"
                                            />
                                          )}

                                        </div>

                                      </button>
                                    );
                                  }
                                )}

                                {filteredSubcategories.length ===
                                  0 && (
                                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                                    No subcategories found.
                                  </div>
                                )}

                              </div>

                            </div>
                          )}

                        </div>
                      )}

                      <p className="mt-2 text-xs text-gray-400">
                        Choose the parent category first, then select the subcategory.
                      </p>

                    </div>

                  </section>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

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

                </div>

                {/* PRICE + DISCOUNT */}

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
                        $
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

                </div>

                {/* STOCK + SKU */}

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

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

                </div>

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
                        image.preview ||
                        image.url ||
                        image.secure_url;

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
                                image.isNew
                                  ? imageSrc
                                  : `http://localhost:3000/uploads/${imageSrc}`
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

                    <Upload size={22} />

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
                            : `http://localhost:3000/uploads/${
                                images[0].url ||
                                images[0].secure_url
                              }`
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
                        $
                        {discountedPrice.toFixed(
                          2
                        )}
                      </span>

                      {discount >
                        0 && (
                        <span className="text-xs text-slate-400 line-through">
                          $
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
              navigate(
               user.role === "admin"?
          "/admin/products" : "/vendor/products"
              )
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
