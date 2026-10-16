import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  X,
  Upload,
  Package,
  IndianRupee,
  FileText,
  CheckCircle,
  AlertCircle,
  Layers,
  Plus,
  Search,
  ChevronDown,
  FolderTree,
  Loader2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  createProduct,
  clearCreateProductStatus,
  getProducts,
} from "../redux/slices/productSlice";

import  api from "../api/axios"
import {
  getRootCategories,
  getCategoryChildren,
  selectRootCategories,
  selectCategoryChildren,
  selectCategoryLoading,
} from "../redux/slices/categorySlice";
const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const BASE_URL = "http://localhost:3000/uploads/";

// =====================================================
// HELPERS
// =====================================================

const getId = (item) => {
  if (!item) return "";

  return String(item?._id || item?.id || "");
};

const getCategoryName = (category) => {
  return category?.name || category?.title || "Unnamed Category";
};

const getCategoryData = (response) => {
  const data =
    response?.data?.data?.categories ||
    response?.data?.data?.category ||
    response?.data?.categories ||
    response?.data?.category ||
    response?.data?.data ||
    response?.data ||
    [];

  return Array.isArray(data) ? data : [];
};

// =====================================================
// COMPONENT
// =====================================================

export default function CreateProduct() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fileInputRef = useRef(null);
  const categoryDropdownRef = useRef(null);

  // =====================================================
  // REDUX STATE
  // =====================================================

  const {
    createLoading,
    createError,
    createSuccess,
    product,
  } = useSelector((state) => state.product);

  const { user } = useSelector((state) => state.auth);

  const couponBasePath =
    user?.role === "admin"
      ? "/admin"
      : "/vendor";

  // =====================================================
  // CATEGORY STATE
  // =====================================================

  /*
    selectedCategoryPath stores every selected level.

    Example:

    [
      {
        id: "fashionId",
        name: "Fashion",
        category: {...}
      },
      {
        id: "womenId",
        name: "Women",
        category: {...}
      },
      {
        id: "dressId",
        name: "Dresses",
        category: {...}
      }
    ]
  */

  const [selectedCategoryPath, setSelectedCategoryPath] =
    useState([]);

  /*
    These are the categories shown at the CURRENT level.

    Initially:
      Fashion
      Electronics
      Shoes
      ...

    After clicking Fashion:
      Women
      Men
      ...

    After clicking Women:
      Dresses
      T-Shirts
      ...
  */
  const [categoryOptions, setCategoryOptions] = useState([]);

  const [categoryLoading, setCategoryLoading] =
    useState(false);

  const [categoryOpen, setCategoryOpen] =
    useState(false);

  const [categorySearch, setCategorySearch] =
    useState("");

  const [categoryError, setCategoryError] =
    useState("");

  // Prevent multiple category requests
  const categoryRequestRef = useRef(false);

  // =====================================================
  // FORM STATE
  // =====================================================

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    mrp: "",
    stock: "",
    sku: "",
  });

  // =====================================================
  // VARIANT STATE
  // =====================================================

  const createEmptyVariant = () => ({
    price: "",
    mrp: "",
    stock: "",
    attributes: [
      {
        name: "",
        value: "",
      },
    ],
    isActive: true,
  });

  const [hasVariants, setHasVariants] = useState(false);

  const [variants, setVariants] = useState([
    createEmptyVariant(),
  ]);

  // =====================================================
  // IMAGE STATE
  // =====================================================

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  // =====================================================
  // ADDON PRODUCTS
  // =====================================================

  const [selectedAccessories, setSelectedAccessories] =
    useState([]);

  // =====================================================
  // GET IMAGE URL
  // =====================================================

  const getImageUrl = (image) => {
    if (!image) {
      return "/1786052049893.webp";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("blob:")
    ) {
      return image;
    }

    if (image.startsWith("/uploads/")) {
      return `http://localhost:3000${image}`;
    }

    if (image.startsWith("uploads/")) {
      return `http://localhost:3000/${image}`;
    }

    return `${BASE_URL}${image}`;
  };

  // =====================================================
  // CATEGORY - LOAD ROOT CATEGORIES
  // =====================================================

  const fetchRootCategories = async () => {
    if (categoryRequestRef.current) {
      return;
    }

    try {
      categoryRequestRef.current = true;

      setCategoryLoading(true);
      setCategoryError("");

      const response = await api.get(
        "/categories/roots"
      );

      console.log(
        "Root categories API:",
        response
      );

      const rootCategories =
        getCategoryData(response);

      setCategoryOptions(rootCategories);
    } catch (error) {
      console.error(
        "Failed to load root categories:",
        error
      );

      setCategoryOptions([]);

      setCategoryError(
        error?.response?.data?.message ||
          "Failed to load categories."
      );
    } finally {
      categoryRequestRef.current = false;
      setCategoryLoading(false);
    }
  };

  // =====================================================
  // CATEGORY - LOAD CHILDREN
  // =====================================================

  const fetchCategoryChildren = async (
    categoryId
  ) => {
    if (!categoryId) {
      return [];
    }

    if (categoryRequestRef.current) {
      return [];
    }

    try {
      categoryRequestRef.current = true;

      setCategoryLoading(true);
      setCategoryError("");

      const response = await api.get(
        `/categories/${categoryId}/children`
      );

      console.log(
        `Children for category ${categoryId}:`,
        response
      );

      const children =
        getCategoryData(response);

      return children;
    } catch (error) {
      console.error(
        "Failed to load category children:",
        error
      );

      setCategoryError(
        error?.response?.data?.message ||
          "Failed to load subcategories."
      );

      return [];
    } finally {
      categoryRequestRef.current = false;
      setCategoryLoading(false);
    }
  };

  // =====================================================
  // INITIAL ROOT CATEGORY LOAD
  // =====================================================

  useEffect(() => {
    fetchRootCategories();
  }, []);

  // =====================================================
  // CATEGORY - SELECT
  // =====================================================

  const handleCategorySelect = async (category) => {
    if (createLoading || categoryLoading) {
      return;
    }

    const categoryId = getId(category);

    if (!categoryId) {
      return;
    }

    if (createError || createSuccess) {
      dispatch(clearCreateProductStatus());
    }

    setCategorySearch("");
    setCategoryError("");

    /*
      Add this category to the path immediately.
    */
    const newPath = [
      ...selectedCategoryPath,
      {
        id: categoryId,
        name: getCategoryName(category),
        category,
      },
    ];

    /*
      Ask backend whether this category
      has children.
    */
    const children =
      await fetchCategoryChildren(categoryId);

    /*
      ===================================================
      CASE 1:
      CATEGORY HAS CHILDREN
      ===================================================

      Example:

      Fashion
        ↓
      Women

      Women has children, so we continue.
    */

    if (children.length > 0) {
      setSelectedCategoryPath(newPath);

      setCategoryOptions(children);

      /*
        Keep dropdown open because user
        needs to choose the next level.
      */
      setCategoryOpen(true);

      return;
    }

    /*
      ===================================================
      CASE 2:
      CATEGORY HAS NO CHILDREN
      ===================================================

      This is the deepest category.

      Therefore it becomes the product category.
    */

    setSelectedCategoryPath(newPath);

    setCategoryOptions([]);

    setForm((prev) => ({
      ...prev,
      category: categoryId,
    }));

    /*
      Final category selected.
    */
    setCategoryOpen(false);
    setCategorySearch("");
  };

  // =====================================================
  // CATEGORY - BACK
  // =====================================================

  const handleCategoryBack = async () => {
    if (
      categoryLoading ||
      selectedCategoryPath.length === 0
    ) {
      return;
    }

    if (createError || createSuccess) {
      dispatch(clearCreateProductStatus());
    }

    const newPath =
      selectedCategoryPath.slice(0, -1);

    setCategoryError("");
    setCategorySearch("");

    /*
      ===================================================
      BACK TO ROOT
      ===================================================
    */

    if (newPath.length === 0) {
      setSelectedCategoryPath([]);

      setForm((prev) => ({
        ...prev,
        category: "",
      }));

      await fetchRootCategories();

      return;
    }

    /*
      ===================================================
      BACK TO PREVIOUS CATEGORY
      ===================================================

      Example:

      Fashion
        → Women
          → Dresses

      User clicks Back.

      We return to:

      Fashion
        → Women

      Therefore load Women's children.
    */

    const previousCategory =
      newPath[newPath.length - 1];

    setSelectedCategoryPath(newPath);

    setForm((prev) => ({
      ...prev,
      category: "",
    }));

    const children =
      await fetchCategoryChildren(
        previousCategory.id
      );

    setCategoryOptions(children);
  };

  // =====================================================
  // CATEGORY - CHANGE CATEGORY
  // =====================================================

  const handleChangeCategory = async () => {
    if (categoryLoading) {
      return;
    }

    setSelectedCategoryPath([]);

    setForm((prev) => ({
      ...prev,
      category: "",
    }));

    setCategorySearch("");
    setCategoryError("");

    await fetchRootCategories();

    setCategoryOpen(true);
  };

  // =====================================================
  // CATEGORY - INITIAL OPEN
  // =====================================================

  const handleCategoryDropdownOpen = async () => {
    if (createLoading) {
      return;
    }

    if (categoryOpen) {
      setCategoryOpen(false);
      return;
    }

    setCategoryOpen(true);

    /*
      If there is no selected path,
      show root categories.
    */
    if (selectedCategoryPath.length === 0) {
      if (categoryOptions.length === 0) {
        await fetchRootCategories();
      }
    }
  };

  // =====================================================
  // CATEGORY SEARCH
  // =====================================================

  const searchText =
    categorySearch
      .toLowerCase()
      .trim();

  const filteredCategoryOptions =
    categoryOptions.filter((category) =>
      getCategoryName(category)
        .toLowerCase()
        .includes(searchText)
    );

  // =====================================================
  // CURRENT CATEGORY
  // =====================================================

  const currentCategory =
    selectedCategoryPath.length > 0
      ? selectedCategoryPath[
          selectedCategoryPath.length - 1
        ]
      : null;

  const finalCategory =
    selectedCategoryPath.length > 0
      ? selectedCategoryPath[
          selectedCategoryPath.length - 1
        ]
      : null;

  const hasFinalCategory =
    Boolean(form.category);

  // =====================================================
  // PRODUCTS
  // =====================================================

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  // =====================================================
  // CLOSE DROPDOWN
  // =====================================================

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

  // =====================================================
  // ESCAPE
  // =====================================================

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setCategoryOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  // =====================================================
  // INPUT
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    if (createError || createSuccess) {
      dispatch(
        clearCreateProductStatus()
      );
    }
  };

  // =====================================================
  // IMAGE SELECT
  // =====================================================

  const handleImageChange = (e) => {
    const files = Array.from(
      e.target.files || []
    );

    if (!files.length) return;

    dispatch(
      clearCreateProductStatus()
    );

    const remainingSlots =
      MAX_IMAGES - images.length;

    if (remainingSlots <= 0) {
      alert(
        `You can upload a maximum of ${MAX_IMAGES} images.`
      );

      e.target.value = "";
      return;
    }

    const selectedFiles =
      files.slice(0, remainingSlots);

    const validFiles = [];

    for (const file of selectedFiles) {
      if (
        !file.type.startsWith("image/")
      ) {
        alert(
          `${file.name} is not a valid image.`
        );
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        alert(
          `${file.name} is larger than 5MB.`
        );
        continue;
      }

      validFiles.push(file);
    }

    if (!validFiles.length) {
      e.target.value = "";
      return;
    }

    const newPreviews =
      validFiles.map((file) =>
        URL.createObjectURL(file)
      );

    setImages((prev) => [
      ...prev,
      ...validFiles,
    ]);

    setPreviews((prev) => [
      ...prev,
      ...newPreviews,
    ]);

    e.target.value = "";
  };

  // =====================================================
  // REMOVE IMAGE
  // =====================================================

  const removeImage = (index) => {
    const previewUrl =
      previews[index];

    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    setImages((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );

    setPreviews((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );
  };

  // =====================================================
  // ACCESSORIES
  // =====================================================

  const toggleAccessory = (
    productId
  ) => {
    setSelectedAccessories((prev) => {
      if (
        prev.includes(productId)
      ) {
        return prev.filter(
          (id) => id !== productId
        );
      }

      return [
        ...prev,
        productId,
      ];
    });
  };

  // =====================================================
  // VARIANT HELPERS
  // =====================================================

  const updateVariant = (
    variantIndex,
    field,
    value
  ) => {
    setVariants((prev) =>
      prev.map((variant, index) =>
        index === variantIndex
          ? {
              ...variant,
              [field]: value,
            }
          : variant
      )
    );

    if (createError || createSuccess) {
      dispatch(
        clearCreateProductStatus()
      );
    }
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      createEmptyVariant(),
    ]);
  };

  const removeVariant = (
    variantIndex
  ) => {
    setVariants((prev) => {
      if (prev.length === 1) {
        return prev;
      }

      return prev.filter(
        (_, index) =>
          index !== variantIndex
      );
    });
  };

  const addVariantAttribute = (
    variantIndex
  ) => {
    setVariants((prev) =>
      prev.map((variant, index) => {
        if (
          index !== variantIndex
        ) {
          return variant;
        }

        return {
          ...variant,
          attributes: [
            ...variant.attributes,
            {
              name: "",
              value: "",
            },
          ],
        };
      })
    );
  };

  const removeVariantAttribute = (
    variantIndex,
    attributeIndex
  ) => {
    setVariants((prev) =>
      prev.map((variant, index) => {
        if (
          index !== variantIndex
        ) {
          return variant;
        }

        if (
          variant.attributes.length ===
          1
        ) {
          return variant;
        }

        return {
          ...variant,
          attributes:
            variant.attributes.filter(
              (_, attrIndex) =>
                attrIndex !==
                attributeIndex
            ),
        };
      })
    );
  };

  const updateVariantAttribute = (
    variantIndex,
    attributeIndex,
    field,
    value
  ) => {
    setVariants((prev) =>
      prev.map((variant, index) => {
        if (
          index !== variantIndex
        ) {
          return variant;
        }

        return {
          ...variant,
          attributes:
            variant.attributes.map(
              (
                attribute,
                attrIndex
              ) =>
                attrIndex ===
                attributeIndex
                  ? {
                      ...attribute,
                      [field]:
                        value,
                    }
                  : attribute
            ),
        };
      })
    );
  };

  const toggleVariantMode = (
    enabled
  ) => {
    setHasVariants(enabled);

    if (
      enabled &&
      variants.length === 0
    ) {
      setVariants([
        createEmptyVariant(),
      ]);
    }

    if (!enabled) {
      setVariants([
        createEmptyVariant(),
      ]);
    }

    if (createError || createSuccess) {
      dispatch(
        clearCreateProductStatus()
      );
    }
  };

  // =====================================================
  // VALIDATION
  // =====================================================

  const validateForm = () => {
    const name =
      form.name.trim();

    const description =
      form.description.trim();

    if (!name) {
      return "Product name is required.";
    }

    if (name.length < 3) {
      return "Product name must contain at least 3 characters.";
    }

    if (!description) {
      return "Product description is required.";
    }

    if (description.length < 10) {
      return "Product description must contain at least 10 characters.";
    }

    /*
      Only final/deepest category is valid.
    */
    if (
      selectedCategoryPath.length ===
      0
    ) {
      return "Please select a product category.";
    }

    if (!form.category) {
      return "Please select the most specific product category.";
    }

    if (!images.length) {
      return "Please upload at least one product image.";
    }

    if (hasVariants) {
      if (
        !Array.isArray(variants) ||
        variants.length === 0
      ) {
        return "Please add at least one product variant.";
      }

      const combinations =
        new Set();

      for (
        let i = 0;
        i < variants.length;
        i++
      ) {
        const variant =
          variants[i];

        const price =
          Number(variant.price);

        if (
          variant.price === "" ||
          !Number.isFinite(price) ||
          price < 0
        ) {
          return `Variant ${
            i + 1
          }: Please enter a valid selling price.`;
        }

        if (
          variant.mrp !== ""
        ) {
          const mrp =
            Number(variant.mrp);

          if (
            !Number.isFinite(mrp) ||
            mrp < price
          ) {
            return `Variant ${
              i + 1
            }: MRP should be greater than or equal to selling price.`;
          }
        }

        const stock =
          Number(variant.stock);

        if (
          variant.stock === "" ||
          !Number.isFinite(stock) ||
          stock < 0
        ) {
          return `Variant ${
            i + 1
          }: Please enter a valid stock quantity.`;
        }

        if (
          !Array.isArray(
            variant.attributes
          ) ||
          variant.attributes.length ===
            0
        ) {
          return `Variant ${
            i + 1
          }: At least one attribute is required.`;
        }

        const normalizedAttributes =
          [];

        for (
          let j = 0;
          j <
          variant.attributes.length;
          j++
        ) {
          const attribute =
            variant.attributes[j];

          const attributeName =
            attribute?.name?.trim();

          const attributeValue =
            attribute?.value?.trim();

          if (!attributeName) {
            return `Variant ${
              i + 1
            }: Attribute ${
              j + 1
            } name is required.`;
          }

          if (!attributeValue) {
            return `Variant ${
              i + 1
            }: Attribute ${
              j + 1
            } value is required.`;
          }

          normalizedAttributes.push(
            {
              name:
                attributeName.toLowerCase(),
              value:
                attributeValue.toLowerCase(),
            }
          );
        }

        const combination =
          normalizedAttributes
            .sort((a, b) =>
              `${a.name}:${a.value}`.localeCompare(
                `${b.name}:${b.value}`
              )
            )
            .map(
              (attribute) =>
                `${attribute.name}:${attribute.value}`
            )
            .join("|");

        if (
          combinations.has(
            combination
          )
        ) {
          return `Variant ${
            i + 1
          }: This variant combination already exists.`;
        }

        combinations.add(
          combination
        );
      }

      return "";
    }

    const price =
      Number(form.price);

    const mrp =
      form.mrp !== ""
        ? Number(form.mrp)
        : null;

    const stock =
      Number(form.stock);

    if (
      !form.price ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      return "Please enter a valid product price.";
    }

    if (
      mrp !== null &&
      (!Number.isFinite(mrp) ||
        mrp < price)
    ) {
      return "MRP should be greater than or equal to selling price.";
    }

    if (
      form.stock === "" ||
      !Number.isFinite(stock) ||
      stock < 0
    ) {
      return "Please enter a valid stock quantity.";
    }

    return "";
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (createLoading) {
      return;
    }

    dispatch(
      clearCreateProductStatus()
    );

    const validationError =
      validateForm();

    if (validationError) {
      alert(validationError);
      return;
    }

    try {
      const formData =
        new FormData();

      formData.append(
        "name",
        form.name.trim()
      );

      formData.append(
        "description",
        form.description.trim()
      );

      /*
        IMPORTANT:

        form.category is ALWAYS the
        deepest category because we only
        set it when a category has no children.
      */
      formData.append(
        "category",
        form.category
      );

      /*
        Optional but useful:

        Sends the complete category hierarchy.

        Example:

        [
          {
            id: "...",
            name: "Fashion"
          },
          {
            id: "...",
            name: "Women"
          },
          {
            id: "...",
            name: "Dresses"
          },
          {
            id: "...",
            name: "Western Dresses"
          }
        ]
      */
      formData.append(
        "categoryPath",
        JSON.stringify(
          selectedCategoryPath.map(
            (item) => ({
              id: item.id,
              name: item.name,
            })
          )
        )
      );

      formData.append(
        "hasVariants",
        String(hasVariants)
      );

      // =================================================
      // VARIANTS
      // =================================================

      if (hasVariants) {
        const variantPrices =
          variants.map(
            (variant) =>
              Number(variant.price)
          );

        const totalStock =
          variants.reduce(
            (
              total,
              variant
            ) =>
              total +
              Number(
                variant.stock
              ),
            0
          );

        const validMrps =
          variants
            .map((variant) =>
              variant.mrp !== ""
                ? Number(
                    variant.mrp
                  )
                : null
            )
            .filter((value) =>
              Number.isFinite(
                value
              )
            );

        formData.append(
          "price",
          String(
            Math.min(
              ...variantPrices
            )
          )
        );

        formData.append(
          "stock",
          String(totalStock)
        );

        if (
          validMrps.length > 0
        ) {
          formData.append(
            "mrp",
            String(
              Math.max(
                ...validMrps
              )
            )
          );
        }

        const cleanedVariants =
          variants.map(
            (variant) => ({
              price:
                Number(
                  variant.price
                ),

              mrp:
                variant.mrp !== ""
                  ? Number(
                      variant.mrp
                    )
                  : null,

              stock:
                Number(
                  variant.stock
                ),

              attributes:
                variant.attributes.map(
                  (
                    attribute
                  ) => ({
                    name:
                      attribute.name.trim(),
                    value:
                      attribute.value.trim(),
                  })
                ),

              isActive:
                variant.isActive !==
                false,
            })
          );

        formData.append(
          "variants",
          JSON.stringify(
            cleanedVariants
          )
        );
      } else {
        formData.append(
          "price",
          String(form.price)
        );

        if (
          form.mrp !== ""
        ) {
          formData.append(
            "mrp",
            String(form.mrp)
          );
        }

        formData.append(
          "stock",
          String(form.stock)
        );

        if (
          form.sku.trim()
        ) {
          formData.append(
            "sku",
            form.sku.trim()
          );
        }
      }

      // =================================================
      // IMAGES
      // =================================================

      images.forEach(
        (image) => {
          formData.append(
            "images",
            image,
            image.name
          );
        }
      );

      // =================================================
      // ACCESSORIES
      // =================================================

      if (
        selectedAccessories.length >
        0
      ) {
        formData.append(
          "accessories",
          JSON.stringify(
            selectedAccessories
          )
        );
      }

      console.log(
        "Create product payload:",
        {
          category:
            form.category,

          categoryPath:
            selectedCategoryPath.map(
              (item) =>
                `${item.name} (${item.id})`
            ),

          hasVariants,

          variants: hasVariants
            ? variants
            : [],

          images:
            images.length,
        }
      );

      await dispatch(
        createProduct(formData)
      ).unwrap();

      // =================================================
      // RESET AFTER SUCCESS
      // =================================================

      setForm({
        name: "",
        description: "",
        category: "",
        price: "",
        mrp: "",
        stock: "",
        sku: "",
      });

      setHasVariants(false);

      setVariants([
        createEmptyVariant(),
      ]);

      setSelectedCategoryPath([]);

      setCategoryOptions([]);

      setCategorySearch("");

      setCategoryError("");

      setSelectedAccessories([]);

      previews.forEach((url) =>
        URL.revokeObjectURL(url)
      );

      setImages([]);
      setPreviews([]);

      setCategoryOpen(false);

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }

      navigate(
        `${couponBasePath}/products`
      );
    } catch (error) {
      console.error(
        "Create product error:",
        error
      );
    }
  };

  // =====================================================
  // RESET
  // =====================================================

  const handleReset = () => {
    if (createLoading) {
      return;
    }

    setForm({
      name: "",
      description: "",
      category: "",
      price: "",
      mrp: "",
      stock: "",
      sku: "",
    });

    setHasVariants(false);

    setVariants([
      createEmptyVariant(),
    ]);

    setSelectedCategoryPath([]);

    setCategoryOptions([]);

    setCategorySearch("");

    setCategoryError("");

    setSelectedAccessories([]);

    previews.forEach((url) =>
      URL.revokeObjectURL(url)
    );

    setImages([]);
    setPreviews([]);

    setCategoryOpen(false);

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }

    dispatch(
      clearCreateProductStatus()
    );

    /*
      Reload root categories so the
      selector is ready again.
    */
    fetchRootCategories();
  };

  // =====================================================
  // CLEANUP
  // =====================================================

  useEffect(() => {
    return () => {
      previews.forEach((url) =>
        URL.revokeObjectURL(url)
      );
    };
  }, [previews]);

  // =====================================================
  // ACTIVE PRODUCTS
  // =====================================================

  const activeProducts =
    Array.isArray(product)
      ? product.filter(
          (item) =>
            item?.status === "active"
        )
      : [];

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">

          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition mb-5 dark:text-gray-400 dark:hover:text-blue-400"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center dark:bg-blue-950/40 dark:text-blue-400">
                <Package size={22} />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Create Product
                </h1>

                <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
                  Add a new product to your store
                </p>
              </div>

            </div>

            <div className="inline-flex items-center gap-2 w-fit rounded-full bg-gray-100 border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
              <span className="w-2 h-2 rounded-full bg-gray-500" />

              {user?.role === "admin"
                ? "Active on Creation"
                : "Draft on Creation"}
            </div>

          </div>
        </div>
      </header>

      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {createError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 flex items-start gap-3 text-red-700">
            <AlertCircle
              size={19}
              className="shrink-0 mt-0.5"
            />

            <p className="text-sm font-medium">
              {createError}
            </p>
          </div>
        )}

        {createSuccess && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 flex items-start gap-3 text-green-700">
            <CheckCircle
              size={19}
              className="shrink-0 mt-0.5"
            />

            <p className="text-sm font-medium">
              Product created successfully.
              {user?.role === "vendor"
                ? " It has been saved as a draft."
                : " It is now active."}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            {/* =================================================
                MAIN
            ================================================= */}

            <div className="lg:col-span-2 space-y-6">

              {/* =================================================
                  BASIC INFORMATION
              ================================================= */}

              <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 sm:p-6">

                <SectionHeader
                  icon={<FileText size={19} />}
                  iconClass="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                  title="Basic Information"
                  description="Enter the main product details"
                />

                <div>
                  <label className={labelClass}>
                    Product Name
                    <Required />
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. iPhone 17 Pro"
                    className={inputClass}
                    disabled={createLoading}
                  />
                </div>

                <div className="mt-5">
                  <label className={labelClass}>
                    Product Description
                    <Required />
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Describe your product, features, materials, specifications..."
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none resize-none transition placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-950/40 disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:cursor-not-allowed"
                    disabled={createLoading}
                  />

                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      Minimum 10 characters
                    </span>

                    <span className="text-xs text-gray-400">
                      {form.description.length}
                    </span>
                  </div>
                </div>

              </section>

              {/* =================================================
                  CATEGORY
              ================================================= */}

              <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 sm:p-6">

                <SectionHeader
                  icon={
                    <Layers size={19} />
                  }
                  iconClass="bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400"
                  title="Product Category"
                  description="Select categories level by level until you reach the most specific category"
                />

                <div
                  ref={
                    categoryDropdownRef
                  }
                  className="relative"
                >

                  <label
                    className={
                      labelClass
                    }
                  >
                    Category
                    <Required />
                  </label>

                  {/* =================================================
                      CATEGORY PATH
                  ================================================= */}

                  {selectedCategoryPath.length >
                    0 && (
                    <div className="mb-4 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/30 p-3">

                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <FolderTree
                          size={14}
                        />

                        <span>
                          Category path
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-2">

                        {selectedCategoryPath.map(
                          (
                            item,
                            index
                          ) => {
                            const isFinal =
                              index ===
                              selectedCategoryPath.length -
                                1;

                            return (
                              <div
                                key={
                                  item.id
                                }
                                className="flex items-center gap-2"
                              >

                                {index >
                                  0 && (
                                  <span className="text-gray-400">
                                    /
                                  </span>
                                )}

                                <span
                                  className={`inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium ${
                                    isFinal &&
                                    hasFinalCategory
                                      ? "bg-blue-600 text-white"
                                      : "bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-900 text-gray-700 dark:text-gray-300"
                                  }`}
                                >
                                  {
                                    item.name
                                  }
                                </span>

                              </div>
                            );
                          }
                        )}

                      </div>

                      {/* FINAL CATEGORY STATUS */}

                      {hasFinalCategory && (
                        <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50 px-3 py-2">

                          <CheckCircle
                            size={15}
                            className="text-green-600 dark:text-green-400"
                          />

                          <p className="text-xs font-medium text-green-700 dark:text-green-300">
                            Product category:
                            {" "}
                            <strong>
                              {
                                finalCategory?.name
                              }
                            </strong>
                          </p>

                        </div>
                      )}

                    </div>
                  )}

                  {/* =================================================
                      SELECT BUTTON
                  ================================================= */}

                  <button
                    type="button"
                    disabled={
                      createLoading
                    }
                    onClick={
                      handleCategoryDropdownOpen
                    }
                    className="w-full min-h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition flex items-center justify-between gap-3 text-left hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-950/40 disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:cursor-not-allowed"
                  >

                    <div className="min-w-0">

                      {categoryLoading &&
                      selectedCategoryPath.length ===
                        0 ? (
                        <div className="flex items-center gap-2 text-gray-400">
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />

                          <span>
                            Loading categories...
                          </span>
                        </div>
                      ) : hasFinalCategory ? (
                        <div>

                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {
                              finalCategory?.name
                            }
                          </p>

                          <p className="text-xs text-gray-400 mt-0.5 truncate">
                            {
                              selectedCategoryPath
                                .map(
                                  (
                                    item
                                  ) =>
                                    item.name
                                )
                                .join(
                                  " / "
                                )
                            }
                          </p>

                        </div>
                      ) : selectedCategoryPath.length >
                        0 ? (
                        <div>

                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {
                              currentCategory?.name
                            }
                          </p>

                          <p className="text-xs text-gray-400 mt-0.5">
                            Select the next category level
                          </p>

                        </div>
                      ) : (
                        <span className="text-gray-400">
                          Select product category
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

                  {/* =================================================
                      DROPDOWN
                  ================================================= */}

                  {categoryOpen && (
                    <div className="absolute z-50 left-0 right-0 mt-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl overflow-hidden">

                      {/* =================================================
                          SEARCH
                      ================================================= */}

                      <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">

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
                              selectedCategoryPath.length >
                              0
                                ? `Search inside ${currentCategory?.name}...`
                                : "Search categories..."
                            }
                            className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-9 pr-3 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 dark:focus:ring-blue-950/40 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            autoFocus
                          />

                        </div>
                      </div>

                      {/* =================================================
                          LEVEL HEADER
                      ================================================= */}

                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-850/60">

                        <div className="flex items-center justify-between gap-3">

                          <div className="min-w-0">

                            <p className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                              Level{" "}
                              {
                                selectedCategoryPath.length +
                                  1
                              }
                            </p>

                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1 truncate">
                              {selectedCategoryPath.length ===
                              0
                                ? "Select a category"
                                : `Select a category inside ${currentCategory?.name}`}
                            </p>

                          </div>

                          {selectedCategoryPath.length >
                            0 && (
                            <button
                              type="button"
                              onClick={
                                handleCategoryBack
                              }
                              disabled={
                                categoryLoading
                              }
                              className="inline-flex items-center gap-1.5 shrink-0 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-50"
                            >
                              <ArrowLeft
                                size={
                                  14
                                }
                              />

                              Back
                            </button>
                          )}

                        </div>

                        {/* BREADCRUMB */}

                        {selectedCategoryPath.length >
                          0 && (
                          <div className="flex items-center gap-1.5 flex-wrap mt-3">

                            {selectedCategoryPath.map(
                              (
                                item,
                                index
                              ) => (
                                <div
                                  key={
                                    item.id
                                  }
                                  className="flex items-center gap-1.5"
                                >

                                  {index >
                                    0 && (
                                    <span className="text-gray-400 text-xs">
                                      /
                                    </span>
                                  )}

                                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                    {
                                      item.name
                                    }
                                  </span>

                                </div>
                              )
                            )}

                          </div>
                        )}

                      </div>

                      {/* =================================================
                          ERROR
                      ================================================= */}

                      {categoryError && (
                        <div className="mx-3 mt-3 rounded-lg border border-red-100 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 px-3 py-2">

                          <div className="flex items-start gap-2">

                            <AlertCircle
                              size={15}
                              className="text-red-500 shrink-0 mt-0.5"
                            />

                            <p className="text-xs text-red-600 dark:text-red-400">
                              {
                                categoryError
                              }
                            </p>

                          </div>

                        </div>
                      )}

                      {/* =================================================
                          CATEGORY LIST
                      ================================================= */}

                      <div className="max-h-72 overflow-y-auto overscroll-contain py-1">

                        {categoryLoading ? (
                          <div className="flex flex-col items-center justify-center py-10">

                            <Loader2
                              size={
                                25
                              }
                              className="text-blue-600 animate-spin"
                            />

                            <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                              Loading categories...
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              Checking available categories
                            </p>

                          </div>
                        ) : filteredCategoryOptions.length ===
                          0 ? (
                          <div className="px-4 py-8 text-center">

                            <Layers
                              size={
                                27
                              }
                              className="mx-auto text-gray-300 dark:text-gray-600"
                            />

                            <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                              {categorySearch
                                ? "No matching categories found"
                                : "No more subcategories found"}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              {categorySearch
                                ? "Try a different search term."
                                : "This category has no child categories."}
                            </p>

                            {selectedCategoryPath.length >
                              0 && (
                              <button
                                type="button"
                                onClick={
                                  handleCategoryBack
                                }
                                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                              >
                                <ArrowLeft
                                  size={
                                    14
                                  }
                                />

                                Go Back
                              </button>
                            )}

                          </div>
                        ) : (
                          filteredCategoryOptions.map(
                            (
                              category
                            ) => {
                              const id =
                                getId(
                                  category
                                );

                              return (
                                <button
                                  key={
                                    id
                                  }
                                  type="button"
                                  onClick={() =>
                                    handleCategorySelect(
                                      category
                                    )
                                  }
                                  disabled={
                                    categoryLoading
                                  }
                                  className="w-full text-left px-4 py-3 transition text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700/60 disabled:opacity-60"
                                >

                                  <div className="flex items-center justify-between gap-3">

                                    <div className="flex items-center gap-3 min-w-0">

                                      <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300 shrink-0">
                                        <Layers
                                          size={
                                            17
                                          }
                                        />
                                      </div>

                                      <div className="min-w-0">

                                        <p className="text-sm font-semibold truncate">
                                          {
                                            getCategoryName(
                                              category
                                            )
                                          }
                                        </p>

                                        <p className="text-xs text-gray-400 mt-0.5">
                                          Select to continue
                                        </p>

                                      </div>

                                    </div>

                                    <ArrowRight
                                      size={
                                        17
                                      }
                                      className="text-gray-400 shrink-0"
                                    />

                                  </div>

                                </button>
                              );
                            }
                          )
                        )}

                      </div>

                      {/* =================================================
                          CHANGE CATEGORY
                      ================================================= */}

                      {selectedCategoryPath.length >
                        0 && (
                        <div className="border-t border-gray-100 dark:border-gray-700 p-3">

                          <button
                            type="button"
                            onClick={
                              handleChangeCategory
                            }
                            disabled={
                              categoryLoading
                            }
                            className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition disabled:opacity-50"
                          >
                            Start from root categories
                          </button>

                        </div>
                      )}

                    </div>
                  )}

                  <div className="mt-2 flex items-start gap-2">

                    <FolderTree
                      size={13}
                      className="text-gray-400 mt-0.5 shrink-0"
                    />

                    <p className="text-xs text-gray-400">
                      Keep selecting categories until a
                      category has no further subcategories.
                      The final category will be assigned to
                      the product.
                    </p>

                  </div>

                </div>

              </section>

              {/* =================================================
                  PRICING
              ================================================= */}

              <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 sm:p-6">

                <SectionHeader
                  icon={
                    <IndianRupee
                      size={19}
                    />
                  }
                  iconClass="bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400"
                  title="Pricing & Inventory"
                  description={
                    hasVariants
                      ? "Manage price, stock and configurations for each variant"
                      : "Set pricing and stock information"
                  }
                />

                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-4 mb-6">

                  <div className="flex items-center justify-between gap-4">

                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        This product has variants
                      </p>

                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Enable this for different sizes,
                        colors, RAM, storage, processors,
                        etc.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={
                        createLoading
                      }
                      onClick={() =>
                        toggleVariantMode(
                          !hasVariants
                        )
                      }
                      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${
                        hasVariants
                          ? "bg-blue-600"
                          : "bg-gray-300 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                          hasVariants
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>

                  </div>

                  {hasVariants && (
                    <div className="mt-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 px-3 py-2">
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Variant mode enabled. Product
                        price and stock are calculated
                        automatically from the variants
                        below.
                      </p>
                    </div>
                  )}

                </div>

                {!hasVariants && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                    <div>
                      <label
                        className={
                          labelClass
                        }
                      >
                        Selling Price
                        <Required />
                      </label>

                      <div className="relative">

                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                          ₹
                        </span>

                        <input
                          type="number"
                          name="price"
                          value={
                            form.price
                          }
                          onChange={
                            handleChange
                          }
                          min="0"
                          step="0.01"
                          placeholder="99999"
                          className={
                            currencyInputClass
                          }
                          disabled={
                            createLoading
                          }
                        />

                      </div>
                    </div>

                    <div>
                      <label
                        className={
                          labelClass
                        }
                      >
                        MRP
                      </label>

                      <div className="relative">

                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                          ₹
                        </span>

                        <input
                          type="number"
                          name="mrp"
                          value={
                            form.mrp
                          }
                          onChange={
                            handleChange
                          }
                          min="0"
                          step="0.01"
                          placeholder="109999"
                          className={
                            currencyInputClass
                          }
                          disabled={
                            createLoading
                          }
                        />

                      </div>
                    </div>

                    <div>
                      <label
                        className={
                          labelClass
                        }
                      >
                        Stock
                        <Required />
                      </label>

                      <input
                        type="number"
                        name="stock"
                        value={
                          form.stock
                        }
                        onChange={
                          handleChange
                        }
                        min="0"
                        step="1"
                        placeholder="50"
                        className={
                          inputClass
                        }
                        disabled={
                          createLoading
                        }
                      />
                    </div>

                    <div>
                      <label
                        className={
                          labelClass
                        }
                      >
                        SKU
                      </label>

                      <input
                        type="text"
                        name="sku"
                        value={
                          form.sku
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="IPH17PRO-256"
                        className={
                          inputClass
                        }
                        disabled={
                          createLoading
                        }
                      />
                    </div>

                  </div>
                )}

                {hasVariants && (
                  <div className="space-y-5">

                    {variants.map(
                      (
                        variant,
                        variantIndex
                      ) => (
                        <div
                          key={
                            variantIndex
                          }
                          className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 shadow-sm"
                        >

                          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-2xl">

                            <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">
                                Variant{" "}
                                {variantIndex +
                                  1}
                              </p>

                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Configure price,
                                stock and
                                attributes
                              </p>
                            </div>

                            {variants.length >
                              1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  removeVariant(
                                    variantIndex
                                  )
                                }
                                disabled={
                                  createLoading
                                }
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600"
                              >
                                <X
                                  size={
                                    15
                                  }
                                />
                                Remove
                              </button>
                            )}

                          </div>

                          <div className="p-4 space-y-5">

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                              <div>
                                <label
                                  className={
                                    labelClass
                                  }
                                >
                                  Selling Price
                                  <Required />
                                </label>

                                <div className="relative">

                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                                    ₹
                                  </span>

                                  <input
                                    type="number"
                                    value={
                                      variant.price
                                    }
                                    onChange={(
                                      e
                                    ) =>
                                      updateVariant(
                                        variantIndex,
                                        "price",
                                        e
                                          .target
                                          .value
                                      )
                                    }
                                    min="0"
                                    step="0.01"
                                    placeholder="49999"
                                    className={
                                      currencyInputClass
                                    }
                                    disabled={
                                      createLoading
                                    }
                                  />

                                </div>
                              </div>

                              <div>
                                <label
                                  className={
                                    labelClass
                                  }
                                >
                                  MRP
                                </label>

                                <div className="relative">

                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                                    ₹
                                  </span>

                                  <input
                                    type="number"
                                    value={
                                      variant.mrp
                                    }
                                    onChange={(
                                      e
                                    ) =>
                                      updateVariant(
                                        variantIndex,
                                        "mrp",
                                        e
                                          .target
                                          .value
                                      )
                                    }
                                    min="0"
                                    step="0.01"
                                    placeholder="54999"
                                    className={
                                      currencyInputClass
                                    }
                                    disabled={
                                      createLoading
                                    }
                                  />

                                </div>
                              </div>

                              <div>
                                <label
                                  className={
                                    labelClass
                                  }
                                >
                                  Stock
                                  <Required />
                                </label>

                                <input
                                  type="number"
                                  value={
                                    variant.stock
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    updateVariant(
                                      variantIndex,
                                      "stock",
                                      e
                                        .target
                                        .value
                                    )
                                  }
                                  min="0"
                                  step="1"
                                  placeholder="20"
                                  className={
                                    inputClass
                                  }
                                  disabled={
                                    createLoading
                                  }
                                />
                              </div>

                            </div>

                            <div>

                              <div className="flex items-center justify-between gap-3 mb-3">

                                <div>
                                  <label
                                    className={
                                      labelClass
                                    }
                                  >
                                    Variant Attributes
                                    <Required />
                                  </label>

                                  <p className="text-xs text-gray-400">
                                    Example: Size
                                    → M, Color
                                    → Black
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    addVariantAttribute(
                                      variantIndex
                                    )
                                  }
                                  disabled={
                                    createLoading
                                  }
                                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                >
                                  <Plus
                                    size={
                                      15
                                    }
                                  />

                                  Add Attribute
                                </button>

                              </div>

                              <div className="space-y-3">

                                {variant.attributes.map(
                                  (
                                    attribute,
                                    attributeIndex
                                  ) => (
                                    <div
                                      key={
                                        attributeIndex
                                      }
                                      className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3"
                                    >

                                      <input
                                        type="text"
                                        value={
                                          attribute.name
                                        }
                                        onChange={(
                                          e
                                        ) =>
                                          updateVariantAttribute(
                                            variantIndex,
                                            attributeIndex,
                                            "name",
                                            e
                                              .target
                                              .value
                                          )
                                        }
                                        placeholder="Attribute name e.g. Size"
                                        className={
                                          inputClass
                                        }
                                        disabled={
                                          createLoading
                                        }
                                      />

                                      <input
                                        type="text"
                                        value={
                                          attribute.value
                                        }
                                        onChange={(
                                          e
                                        ) =>
                                          updateVariantAttribute(
                                            variantIndex,
                                            attributeIndex,
                                            "value",
                                            e
                                              .target
                                              .value
                                          )
                                        }
                                        placeholder="Value e.g. M"
                                        className={
                                          inputClass
                                        }
                                        disabled={
                                          createLoading
                                        }
                                      />

                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeVariantAttribute(
                                            variantIndex,
                                            attributeIndex
                                          )
                                        }
                                        disabled={
                                          createLoading ||
                                          variant
                                            .attributes
                                            .length ===
                                            1
                                        }
                                        className="h-11 w-11 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 hover:border-red-200 dark:hover:border-red-500/50 hover:text-red-500 disabled:opacity-40 flex items-center justify-center"
                                      >
                                        <X
                                          size={
                                            17
                                          }
                                        />
                                      </button>

                                    </div>
                                  )
                                )}

                              </div>

                            </div>

                            <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 px-3 py-3">

                              <div className="flex items-center justify-between gap-3">

                                <div>
                                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    SKU
                                  </p>

                                  <p className="text-xs text-gray-400 mt-0.5">
                                    Generated
                                    automatically
                                    by backend
                                  </p>
                                </div>

                                <span className="text-xs font-medium text-gray-400">
                                  Auto generated
                                </span>

                              </div>

                            </div>

                          </div>

                        </div>
                      )
                    )}

                    <button
                      type="button"
                      onClick={
                        addVariant
                      }
                      disabled={
                        createLoading
                      }
                      className="w-full h-12 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Plus
                        size={18}
                      />

                      Add Another Variant
                    </button>

                    <div className="rounded-xl border border-blue-100 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/30 p-4">

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-blue-700 dark:text-blue-300">

                        <span>
                          <strong>
                            {
                              variants.length
                            }
                          </strong>{" "}
                          variant
                          {variants.length !==
                          1
                            ? "s"
                            : ""}
                        </span>

                        <span>
                          Total stock:{" "}
                          <strong>
                            {variants.reduce(
                              (
                                total,
                                variant
                              ) =>
                                total +
                                (Number(
                                  variant.stock
                                ) ||
                                  0),
                              0
                            )}
                          </strong>
                        </span>

                        <span>
                          Lowest price: ₹
                          <strong>
                            {variants.length
                              ? Math.min(
                                  ...variants.map(
                                    (
                                      variant
                                    ) =>
                                      Number(
                                        variant.price
                                      ) ||
                                      0
                                  )
                                )
                              : 0}
                          </strong>
                        </span>

                      </div>

                    </div>

                  </div>
                )}

              </section>

              {/* =================================================
                  IMAGES
              ================================================= */}

              <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 sm:p-6">

                <div className="flex items-center justify-between gap-4 mb-6">

                  <SectionHeader
                    icon={
                      <ImagePlus
                        size={19}
                      />
                    }
                    iconClass="bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400"
                    title="Product Images"
                    description="Upload up to 5 images"
                    noMargin
                  />

                  <span className="shrink-0 text-xs font-semibold text-gray-400">
                    {images.length}/
                    {MAX_IMAGES}
                  </span>

                </div>

                {images.length <
                  MAX_IMAGES && (
                  <label className="relative flex flex-col items-center justify-center min-h-44 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 cursor-pointer transition p-6 text-center">

                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                      <Upload
                        size={21}
                      />
                    </div>

                    <p className="mt-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Click to upload images
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      PNG, JPG or WEBP • Maximum
                      5MB each
                    </p>

                    <input
                      ref={
                        fileInputRef
                      }
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      multiple
                      onChange={
                        handleImageChange
                      }
                      className="hidden"
                      disabled={
                        createLoading
                      }
                    />

                  </label>
                )}

                {previews.length >
                  0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">

                    {previews.map(
                      (
                        preview,
                        index
                      ) => (
                        <div
                          key={`${preview}-${index}`}
                          className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white flex items-center justify-center"
                        >

                          <img
                            src={
                              preview
                            }
                            alt={`Product ${
                              index +
                              1
                            }`}
                            className="w-full h-full object-contain p-1"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removeImage(
                                index
                              )
                            }
                            disabled={
                              createLoading
                            }
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow flex items-center justify-center hover:bg-red-500 hover:text-white disabled:opacity-50 transition"
                          >
                            <X
                              size={
                                16
                              }
                            />
                          </button>

                          {index ===
                            0 && (
                            <span className="absolute bottom-2 left-2 rounded-md bg-blue-600 px-2 py-1 text-[10px] font-semibold text-white">
                              Main Image
                            </span>
                          )}

                        </div>
                      )
                    )}

                  </div>
                )}

              </section>

              {/* =================================================
                  ADDONS
              ================================================= */}

              <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 sm:p-6">

                <SectionHeader
                  icon={
                    <Plus size={19} />
                  }
                  iconClass="bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400"
                  title="Add-on Products"
                  description="Select products customers may want with this product"
                />

                {activeProducts.length ===
                0 ? (
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-4 text-sm text-gray-500 dark:text-gray-400">
                    No active products available for add-ons.
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto overscroll-contain space-y-2 pr-1">

                    {activeProducts.map(
                      (
                        addonProduct
                      ) => {
                        const selected =
                          selectedAccessories.includes(
                            addonProduct._id
                          );

                        return (
                          <label
                            key={
                              addonProduct._id
                            }
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                              selected
                                ? "border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/40"
                                : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                            }`}
                          >

                            <input
                              type="checkbox"
                              checked={
                                selected
                              }
                              onChange={() =>
                                toggleAccessory(
                                  addonProduct._id
                                )
                              }
                              disabled={
                                createLoading
                              }
                              className="w-4 h-4 accent-blue-600 shrink-0"
                            />

                            <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0 flex items-center justify-center">

                              {addonProduct
                                .images?.[0] ? (
                                <img
                                  src={getImageUrl(
                                    addonProduct
                                      .images?.[0]
                                  )}
                                  alt={
                                    addonProduct.name
                                  }
                                  className="w-full h-full object-contain p-0.5"
                                />
                              ) : (
                                <Package
                                  size={
                                    18
                                  }
                                  className="m-2.5 text-gray-400"
                                />
                              )}

                            </div>

                            <div className="min-w-0 flex-1">

                              <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                                {
                                  addonProduct.name
                                }
                              </p>

                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                ₹
                                {
                                  addonProduct.price
                                }
                              </p>

                            </div>

                          </label>
                        );
                      }
                    )}

                  </div>
                )}

                {selectedAccessories.length >
                  0 && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-3">
                    {
                      selectedAccessories.length
                    }{" "}
                    add-on
                    {selectedAccessories.length >
                    1
                      ? "s"
                      : ""}{" "}
                    selected
                  </p>
                )}

              </section>

            </div>

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside>

              <div className="lg:sticky lg:top-24 space-y-6">

                <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 sm:p-6">

                  <h2 className="font-bold text-gray-900 dark:text-white">
                    Publish Product
                  </h2>

                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-6">
                    {user?.role ===
                    "admin"
                      ? "As an admin, this product will become active immediately."
                      : "Vendor products are saved as drafts and can be activated later."}
                  </p>

                  <div
                    className={`mt-5 rounded-xl border p-4 ${
                      user?.role ===
                      "admin"
                        ? "bg-green-50 dark:bg-green-950/30 border-green-100 dark:border-green-900/50"
                        : "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-100 dark:border-yellow-900/50"
                    }`}
                  >

                    <div className="flex items-start gap-3">

                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          user?.role ===
                          "admin"
                            ? "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400"
                            : "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400"
                        }`}
                      >
                        <CheckCircle
                          size={
                            16
                          }
                        />
                      </div>

                      <div>

                        <p
                          className={`text-sm font-semibold ${
                            user?.role ===
                            "admin"
                              ? "text-green-800 dark:text-green-300"
                              : "text-yellow-800 dark:text-yellow-300"
                          }`}
                        >
                          {user?.role ===
                          "admin"
                            ? "Active"
                            : "Draft"}
                        </p>

                        <p
                          className={`text-xs mt-1 leading-5 ${
                            user?.role ===
                            "admin"
                              ? "text-green-700 dark:text-green-400"
                              : "text-yellow-700 dark:text-yellow-400"
                          }`}
                        >
                          {user?.role ===
                          "admin"
                            ? "Product will be available to customers."
                            : "Product will be saved as a draft."}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* CATEGORY STATUS */}

                  <div className="mt-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-3">

                    <div className="flex items-start gap-2">

                      <FolderTree
                        size={
                          15
                        }
                        className="text-purple-500 mt-0.5 shrink-0"
                      />

                      <div className="min-w-0">

                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Product Category
                        </p>

                        {hasFinalCategory ? (
                          <>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1 truncate">
                              {
                                finalCategory?.name
                              }
                            </p>

                            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 leading-4">
                              {
                                selectedCategoryPath
                                  .map(
                                    (
                                      item
                                    ) =>
                                      item.name
                                  )
                                  .join(
                                    " / "
                                  )
                              }
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-gray-400 mt-1">
                            Not selected
                          </p>
                        )}

                      </div>

                    </div>

                  </div>

                  <button
                    type="submit"
                    disabled={
                      createLoading
                    }
                    className="cursor-pointer w-full mt-5 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold flex items-center justify-center gap-2 transition shadow-sm"
                  >

                    {createLoading ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />

                        Creating...
                      </>
                    ) : (
                      <>
                        <Package
                          size={
                            18
                          }
                        />

                        Create Product
                      </>
                    )}

                  </button>

                  <button
                    type="button"
                    onClick={
                      handleReset
                    }
                    disabled={
                      createLoading
                    }
                    className="cursor-pointer w-full mt-3 h-11 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition"
                  >
                    Clear Form
                  </button>

                </section>

                <section className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/50 p-5">

                  <h3 className="font-semibold text-blue-900 dark:text-blue-300">
                    Product Guidelines
                  </h3>

                  <ul className="mt-3 space-y-2.5 text-sm text-blue-800 dark:text-blue-200/80">

                    <li className="flex gap-2">
                      <span>
                        •
                      </span>

                      Use a clear product
                      name.
                    </li>

                    <li className="flex gap-2">
                      <span>
                        •
                      </span>

                      Follow the category
                      hierarchy.
                    </li>

                    <li className="flex gap-2">
                      <span>
                        •
                      </span>

                      Select the most
                      specific available
                      category.
                    </li>

                    <li className="flex gap-2">
                      <span>
                        •
                      </span>

                      Upload high-quality
                      images.
                    </li>

                    <li className="flex gap-2">
                      <span>
                        •
                      </span>

                      Add an accurate
                      description.
                    </li>

                    <li className="flex gap-2">
                      <span>
                        •
                      </span>

                      Add relevant products
                      as add-ons.
                    </li>

                  </ul>

                </section>

              </div>

            </aside>

          </div>

        </form>

      </main>

    </div>
  );
}

// =====================================================
// REQUIRED
// =====================================================

function Required() {
  return (
    <span className="text-red-500 ml-1">
      *
    </span>
  );
}

// =====================================================
// SECTION HEADER
// =====================================================

function SectionHeader({
  icon,
  iconClass,
  title,
  description,
  noMargin = false,
}) {
  return (
    <div
      className={`flex items-center gap-3 ${
        noMargin ? "" : "mb-6"
      }`}
    >

      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}
      >
        {icon}
      </div>

      <div>

        <h2 className="font-bold text-gray-900 dark:text-white">
          {title}
        </h2>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {description}
        </p>

      </div>

    </div>
  );
}

// =====================================================
// STYLES
// =====================================================

const labelClass = `
  block
  text-sm
  font-semibold
  text-gray-700
  dark:text-gray-300
  mb-2
`;

const inputClass = `
  w-full
  h-12
  rounded-xl
  border
  border-gray-200
  dark:border-gray-700
  bg-white
  dark:bg-gray-800
  px-4
  text-sm
  text-gray-900
  dark:text-white
  outline-none
  transition
  placeholder:text-gray-400
  dark:placeholder:text-gray-500
  focus:border-blue-500
  focus:ring-4
  focus:ring-blue-50
  dark:focus:ring-blue-950/40
  disabled:bg-gray-50
  dark:disabled:bg-gray-900
  disabled:cursor-not-allowed
`;

const currencyInputClass = `
  w-full
  h-12
  rounded-xl
  border
  border-gray-200
  dark:border-gray-700
  bg-white
  dark:bg-gray-800
  pl-9
  pr-4
  text-sm
  text-gray-900
  dark:text-white
  outline-none
  transition
  placeholder:text-gray-400
  dark:placeholder:text-gray-500
  focus:border-blue-500
  focus:ring-4
  focus:ring-blue-50
  dark:focus:ring-blue-950/40
  disabled:bg-gray-50
  dark:disabled:bg-gray-900
  disabled:cursor-not-allowed
`;