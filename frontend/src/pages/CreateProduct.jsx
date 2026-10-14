// import { useEffect, useRef, useState } from "react";
// import {
//   ArrowLeft,
//   ImagePlus,
//   X,
//   Upload,
//   Package,
//   IndianRupee,
//   FileText,
//   CheckCircle,
//   AlertCircle,
//   Layers,
//   Star,
//   Plus,
//   Search,
//   ChevronDown,
//   FolderTree,
// } from "lucide-react";

// import { useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";

// import {
//   createProduct,
//   clearCreateProductStatus,
//   getProducts,
// } from "../redux/slices/productSlice";

// import api from "../api/axios";

// const MAX_IMAGES = 5;
// const MAX_FILE_SIZE = 5 * 1024 * 1024;

// // =====================================================
// // CATEGORY PAGINATION
// // =====================================================

// const CATEGORY_PAGE_SIZE = 20;


// // =====================================================
// // HELPERS
// // =====================================================

// const getId = (item) => {
//   if (!item) return "";

//   return String(item?._id || item?.id || "");
// };

// const getParentId = (category) => {
//   if (!category) return "";

//   if (category.parent?._id) {
//     return String(category.parent._id);
//   }

//   if (category.parent?.id) {
//     return String(category.parent.id);
//   }

//   if (category.parentCategory?._id) {
//     return String(category.parentCategory._id);
//   }

//   if (category.parentCategory?.id) {
//     return String(category.parentCategory.id);
//   }

//   if (
//     typeof category.parent === "string" ||
//     typeof category.parent === "number"
//   ) {
//     return String(category.parent);
//   }

//   if (
//     typeof category.parentCategory === "string" ||
//     typeof category.parentCategory === "number"
//   ) {
//     return String(category.parentCategory);
//   }

//   if (category.parentId) {
//     return String(category.parentId);
//   }

//   if (category.parent_id) {
//     return String(category.parent_id);
//   }

//   return "";
// };

// const getChildren = (category) => {
//   if (!category) return [];

//   const children =
//     category.subcategories ||
//     category.subCategories ||
//     category.children ||
//     category.categories ||
//     [];

//   return Array.isArray(children) ? children : [];
// };

// const getCategoryName = (category) => {
//   return category?.name || category?.title || "Unnamed Category";
// };

// const getCategoryData = (response) => {
//   const data =
//     response?.data?.data?.categories ||
//     response?.data?.data?.category ||
//     response?.data?.categories ||
//     response?.data?.category ||
//     response?.data?.data ||
//     response?.data ||
//     [];

//   return Array.isArray(data) ? data : [];
// };

// // =====================================================
// // PAGINATION HELPER
// // =====================================================

// const getCategoryPagination = (response, currentPage, currentCount) => {
//   const root = response?.data || {};

//   const data = root?.data || {};

//   const pagination =
//     root?.pagination ||
//     data?.pagination ||
//     root?.meta ||
//     data?.meta ||
//     {};

//   const total =
//     pagination?.total ??
//     root?.total ??
//     data?.total ??
//     null;

//   const totalPages =
//     pagination?.totalPages ??
//     pagination?.total_pages ??
//     root?.totalPages ??
//     data?.totalPages ??
//     null;

//   const current =
//     pagination?.page ??
//     pagination?.currentPage ??
//     pagination?.current_page ??
//     currentPage;

//   const limit =
//     pagination?.limit ??
//     pagination?.perPage ??
//     pagination?.per_page ??
//     CATEGORY_PAGE_SIZE;

//   const responseCount = getCategoryData(response).length;

//   // If backend provides total pages.
//   if (totalPages !== null) {
//     return {
//       hasMore: Number(current) < Number(totalPages),
//       page: Number(current),
//       limit: Number(limit),
//     };
//   }

//   // If backend provides total count.
//   if (total !== null) {
//     return {
//       hasMore:
//         Number(currentCount) + Number(responseCount) <
//         Number(total),
//       page: Number(current),
//       limit: Number(limit),
//     };
//   }

//   // If no pagination metadata exists,
//   // assume another page exists when the returned
//   // page contains the full page size.
//   return {
//     hasMore: responseCount >= CATEGORY_PAGE_SIZE,
//     page: currentPage,
//     limit: CATEGORY_PAGE_SIZE,
//   };
// };

// // =====================================================
// // COMPONENT
// // =====================================================

// export default function CreateProduct() {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const fileInputRef = useRef(null);
//   const categoryDropdownRef = useRef(null);

//   // =====================================================
//   // CATEGORY SCROLL REFS
//   // =====================================================

//   const categoryScrollRef = useRef(null);
//   const categoryLoadMoreRef = useRef(null);

//   const categoryRequestRef = useRef(false);

//   // =====================================================
//   // REDUX STATE
//   // =====================================================

//   const {
//     createLoading,
//     createError,
//     createSuccess,
//     product,
//   } = useSelector((state) => state.product);

//   const { user } = useSelector((state) => state.auth);
// const couponBasePath =
//   user?.role === "admin"
//     ? "/admin/"
//     : "/vendor/";
//   // =====================================================
//   // CATEGORY STATE
//   // =====================================================

//   const [categories, setCategories] = useState([]);

//   const [categoryLoading, setCategoryLoading] =
//     useState(false);

//   const [categoryLoadingMore, setCategoryLoadingMore] =
//     useState(false);

//   const [categoryPage, setCategoryPage] = useState(1);

//   const [categoryHasMore, setCategoryHasMore] =
//     useState(true);

//   const [categoryOpen, setCategoryOpen] =
//     useState(false);

//   const [parentCategoryId, setParentCategoryId] =
//     useState("");

//   const [subcategoryId, setSubcategoryId] =
//     useState("");

//   const [categorySearch, setCategorySearch] =
//     useState("");

//   // =====================================================
//   // FORM STATE
//   // =====================================================

//   const [form, setForm] = useState({
//     name: "",
//     description: "",
//     category: "",
//     price: "",
//     mrp: "",
//     stock: "",
//     sku: "",
//   });

//   // =====================================================
//   // IMAGE STATE
//   // =====================================================

//   const [images, setImages] = useState([]);
//   const [previews, setPreviews] = useState([]);
// const getImageUrl = (image) => {
//   if (!image) {
//     return "/1786052049893.webp";
//   }

//   // Already a complete URL
//   if (
//     image.startsWith("http://") ||
//     image.startsWith("https://") ||
//     image.startsWith("blob:")
//   ) {
//     return image;
//   }

//   // Already starts with /uploads/
//   if (image.startsWith("/uploads/")) {
//     return `http://localhost:3000${image}`;
//   }

//   // Starts with uploads/
//   if (image.startsWith("uploads/")) {
//     return `http://localhost:3000/${image}`;
//   }

//   // Normal filename
//   return `${BASE_URL}${image}`;
// };

//   // =====================================================
//   // ADDON PRODUCTS
//   // =====================================================

//   const [selectedAccessories, setSelectedAccessories] =
//     useState([]);

//   // =====================================================
//   // FETCH CATEGORIES
//   // =====================================================

//   const fetchCategories = async ({
//     page = 1,
//     append = false,
//   } = {}) => {
//     if (categoryRequestRef.current) {
//       return;
//     }

//     if (append && !categoryHasMore) {
//       return;
//     }

//     try {
//       categoryRequestRef.current = true;

//       if (append) {
//         setCategoryLoadingMore(true);
//       } else {
//         setCategoryLoading(true);
//       }

//       const response = await api.get("/categories/", {
//         params: {
//           page,
//           limit: CATEGORY_PAGE_SIZE,
//         },
//       });

//       console.log(
//         `Categories API page ${page}:`,
//         response
//       );

//       const newCategories =
//         getCategoryData(response);

//       // =================================================
//       // MERGE WITHOUT DUPLICATES
//       // =================================================

//       setCategories((prev) => {
//         if (!append) {
//           return newCategories;
//         }

//         const existingIds = new Set(
//           prev.map((item) => getId(item))
//         );

//         const uniqueNewCategories =
//           newCategories.filter((item) => {
//             const id = getId(item);

//             if (!id) {
//               return true;
//             }

//             return !existingIds.has(id);
//           });

//         return [
//           ...prev,
//           ...uniqueNewCategories,
//         ];
//       });

//       // =================================================
//       // PAGINATION
//       // =================================================

//       setCategoryPage(page);

//       const pagination =
//         getCategoryPagination(
//           response,
//           page,
//           categories.length
//         );

//       setCategoryHasMore(
//         pagination.hasMore
//       );
//     } catch (error) {
//       console.error(
//         "Failed to load categories:",
//         error
//       );

//       if (!append) {
//         setCategories([]);
//       }

//       setCategoryHasMore(false);
//     } finally {
//       categoryRequestRef.current = false;

//       setCategoryLoading(false);
//       setCategoryLoadingMore(false);
//     }
//   };

//   // =====================================================
//   // INITIAL CATEGORY API
//   // =====================================================

//   useEffect(() => {
//     fetchCategories({
//       page: 1,
//       append: false,
//     });
//   }, []);

//   // =====================================================
//   // AUTO LOAD MORE WHEN SCROLL REACHES BOTTOM
//   // =====================================================

//   useEffect(() => {
//     if (!categoryOpen) {
//       return;
//     }

//     const scrollContainer =
//       categoryScrollRef.current;

//     const loadMoreElement =
//       categoryLoadMoreRef.current;

//     if (
//       !scrollContainer ||
//       !loadMoreElement
//     ) {
//       return;
//     }

//     const observer =
//       new IntersectionObserver(
//         (entries) => {
//           const firstEntry = entries[0];

//           if (
//             firstEntry.isIntersecting &&
//             categoryHasMore &&
//             !categoryRequestRef.current
//           ) {
//             fetchCategories({
//               page: categoryPage + 1,
//               append: true,
//             });
//           }
//         },
//         {
//           root: scrollContainer,
//           rootMargin: "0px 0px 120px 0px",
//           threshold: 0,
//         }
//       );

//     observer.observe(loadMoreElement);

//     return () => {
//       observer.disconnect();
//     };
//   }, [
//     categoryOpen,
//     categoryPage,
//     categoryHasMore,
//   ]);

//   // =====================================================
//   // NORMALIZE CATEGORIES
//   // =====================================================

//   const normalizedCategories = (() => {
//     const parents = [];
//     const subcategories = [];

//     categories.forEach((category) => {
//       const children =
//         getChildren(category);

//       if (children.length > 0) {
//         parents.push(category);

//         children.forEach((child) => {
//           subcategories.push({
//             ...child,
//             __parentId: getId(category),
//           });
//         });

//         return;
//       }

//       const parentId =
//         getParentId(category);

//       if (!parentId) {
//         parents.push(category);
//       } else {
//         subcategories.push({
//           ...category,
//           __parentId: parentId,
//         });
//       }
//     });

//     return {
//       parents,
//       subcategories,
//     };
//   })();

//   const parentCategories =
//     normalizedCategories.parents;

//   // =====================================================
//   // SUBCATEGORIES
//   // =====================================================

//   const availableSubcategories =
//     parentCategoryId
//       ? normalizedCategories.subcategories.filter(
//           (subcategory) =>
//             String(
//               subcategory.__parentId
//             ) ===
//             String(parentCategoryId)
//         )
//       : [];

//   // =====================================================
//   // PRODUCTS
//   // =====================================================

//   useEffect(() => {
//     dispatch(getProducts());
//   }, [dispatch]);

//   // =====================================================
//   // CLOSE DROPDOWN
//   // =====================================================

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         categoryDropdownRef.current &&
//         !categoryDropdownRef.current.contains(
//           event.target
//         )
//       ) {
//         setCategoryOpen(false);
//       }
//     };

//     document.addEventListener(
//       "mousedown",
//       handleClickOutside
//     );

//     return () => {
//       document.removeEventListener(
//         "mousedown",
//         handleClickOutside
//       );
//     };
//   }, []);

//   // =====================================================
//   // ESCAPE
//   // =====================================================

//   useEffect(() => {
//     const handleEscape = (event) => {
//       if (event.key === "Escape") {
//         setCategoryOpen(false);
//       }
//     };

//     document.addEventListener(
//       "keydown",
//       handleEscape
//     );

//     return () => {
//       document.removeEventListener(
//         "keydown",
//         handleEscape
//       );
//     };
//   }, []);

//   // =====================================================
//   // SELECTED CATEGORIES
//   // =====================================================

//   const selectedParentCategory =
//     parentCategories.find(
//       (category) =>
//         getId(category) ===
//         String(parentCategoryId)
//     );

//   const selectedSubcategory =
//     availableSubcategories.find(
//       (subcategory) =>
//         getId(subcategory) ===
//         String(subcategoryId)
//     );

//   // =====================================================
//   // INPUT
//   // =====================================================

//   const handleChange = (e) => {
//     const {
//       name,
//       value,
//       type,
//       checked,
//     } = e.target;

//     setForm((prev) => ({
//       ...prev,
//       [name]:
//         type === "checkbox"
//           ? checked
//           : value,
//     }));

//     if (createError || createSuccess) {
//       dispatch(
//         clearCreateProductStatus()
//       );
//     }
//   };

//   // =====================================================
//   // PARENT SELECT
//   // =====================================================

//   const handleParentCategorySelect = (
//     categoryId
//   ) => {
//     const id = String(categoryId);

//     setParentCategoryId(id);
//     setSubcategoryId("");

//     setForm((prev) => ({
//       ...prev,
//       category: "",
//     }));

//     setCategorySearch("");

//     if (createError || createSuccess) {
//       dispatch(
//         clearCreateProductStatus()
//       );
//     }
//   };

//   // =====================================================
//   // SUBCATEGORY SELECT
//   // =====================================================

//   const handleSubcategorySelect = (
//     categoryId
//   ) => {
//     const id = String(categoryId);

//     setSubcategoryId(id);

//     setForm((prev) => ({
//       ...prev,
//       category: id,
//     }));

//     setCategoryOpen(false);
//     setCategorySearch("");

//     if (createError || createSuccess) {
//       dispatch(
//         clearCreateProductStatus()
//       );
//     }
//   };

//   // =====================================================
//   // SEARCH
//   // =====================================================

//   const searchText =
//     categorySearch
//       .toLowerCase()
//       .trim();

//   const filteredParentCategories =
//     parentCategories.filter(
//       (category) =>
//         getCategoryName(category)
//           .toLowerCase()
//           .includes(searchText)
//     );

//   const filteredSubcategories =
//     availableSubcategories.filter(
//       (subcategory) =>
//         getCategoryName(subcategory)
//           .toLowerCase()
//           .includes(searchText)
//     );

//   // =====================================================
//   // IMAGE SELECT
//   // =====================================================

//   const handleImageChange = (e) => {
//     const files = Array.from(
//       e.target.files || []
//     );

//     if (!files.length) return;

//     dispatch(
//       clearCreateProductStatus()
//     );

//     const remainingSlots =
//       MAX_IMAGES - images.length;

//     if (remainingSlots <= 0) {
//       alert(
//         `You can upload a maximum of ${MAX_IMAGES} images.`
//       );

//       e.target.value = "";
//       return;
//     }

//     const selectedFiles =
//       files.slice(0, remainingSlots);

//     const validFiles = [];

//     for (const file of selectedFiles) {
//       if (
//         !file.type.startsWith("image/")
//       ) {
//         alert(
//           `${file.name} is not a valid image.`
//         );
//         continue;
//       }

//       if (file.size > MAX_FILE_SIZE) {
//         alert(
//           `${file.name} is larger than 5MB.`
//         );
//         continue;
//       }

//       validFiles.push(file);
//     }

//     if (!validFiles.length) {
//       e.target.value = "";
//       return;
//     }

//     const newPreviews =
//       validFiles.map((file) =>
//         URL.createObjectURL(file)
//       );

//     setImages((prev) => [
//       ...prev,
//       ...validFiles,
//     ]);

//     setPreviews((prev) => [
//       ...prev,
//       ...newPreviews,
//     ]);

//     e.target.value = "";
//   };

//   // =====================================================
//   // REMOVE IMAGE
//   // =====================================================

//   const removeImage = (index) => {
//     const previewUrl =
//       previews[index];

//     if (previewUrl) {
//       URL.revokeObjectURL(
//         previewUrl
//       );
//     }

//     setImages((prev) =>
//       prev.filter(
//         (_, i) => i !== index
//       )
//     );

//     setPreviews((prev) =>
//       prev.filter(
//         (_, i) => i !== index
//       )
//     );
//   };

//   // =====================================================
//   // ACCESSORIES
//   // =====================================================

//   const toggleAccessory = (
//     productId
//   ) => {
//     setSelectedAccessories((prev) => {
//       if (
//         prev.includes(productId)
//       ) {
//         return prev.filter(
//           (id) => id !== productId
//         );
//       }

//       return [
//         ...prev,
//         productId,
//       ];
//     });
//   };

//   // =====================================================
//   // VALIDATION
//   // =====================================================

//   const validateForm = () => {
//     const name =
//       form.name.trim();

//     const description =
//       form.description.trim();

//     const price =
//       Number(form.price);

//     const mrp =
//       form.mrp !== ""
//         ? Number(form.mrp)
//         : null;

//     const stock =
//       Number(form.stock);

//     if (!name) {
//       return "Product name is required.";
//     }

//     if (name.length < 3) {
//       return "Product name must contain at least 3 characters.";
//     }

//     if (!description) {
//       return "Product description is required.";
//     }

//     if (description.length < 10) {
//       return "Product description must contain at least 10 characters.";
//     }

//     if (!parentCategoryId) {
//       return "Please select a parent category.";
//     }

//     if (!subcategoryId) {
//       return "Please select a subcategory.";
//     }

//     if (!form.category) {
//       return "Please select a product category.";
//     }

//     if (
//       !form.price ||
//       Number.isNaN(price) ||
//       price <= 0
//     ) {
//       return "Please enter a valid product price.";
//     }

//     if (
//       mrp !== null &&
//       (Number.isNaN(mrp) ||
//         mrp < price)
//     ) {
//       return "MRP should be greater than or equal to selling price.";
//     }

//     if (
//       form.stock === "" ||
//       Number.isNaN(stock) ||
//       stock < 0
//     ) {
//       return "Please enter a valid stock quantity.";
//     }

//     if (!images.length) {
//       return "Please upload at least one product image.";
//     }

//     return "";
//   };

//   // =====================================================
//   // SUBMIT
//   // =====================================================

//   const handleSubmit = async (e) => {
//   e.preventDefault();

//   if (createLoading) {
//     return;
//   }

//   dispatch(clearCreateProductStatus());

//   const validationError = validateForm();

//   if (validationError) {
//     alert(validationError);
//     return;
//   }

//   try {
//     const formData = new FormData();

//     formData.append("name", form.name.trim());

//     formData.append(
//       "description",
//       form.description.trim()
//     );

//     formData.append(
//       "category",
//       subcategoryId
//     );

//     formData.append(
//       "price",
//       String(form.price)
//     );

//     if (form.mrp !== "") {
//       formData.append(
//         "mrp",
//         String(form.mrp)
//       );
//     }

//     formData.append(
//       "stock",
//       String(form.stock)
//     );

//     if (form.sku.trim()) {
//       formData.append(
//         "sku",
//         form.sku.trim()
//       );
//     }

   

//     // =====================================================
//     // IMPORTANT: SEND EVERY IMAGE
//     // =====================================================

//     images.forEach((image) => {
//       formData.append(
//         "images",
//         image,
//         image.name
//       );
//     });

//     // =====================================================
//     // ADDONS
//     // =====================================================

//     if (selectedAccessories.length > 0) {
//       formData.append(
//         "accessories",
//         JSON.stringify(selectedAccessories)
//       );
//     }

//     // =====================================================
//     // DEBUG
//     // =====================================================

//     console.log("Images selected:", images.length);

//     for (const [key, value] of formData.entries()) {
//       if (key === "images") {
//         console.log(
//           "FormData image:",
//           value?.name,
//           value?.size,
//           value?.type
//         );
//       } else {
//         console.log(
//           "FormData:",
//           key,
//           value
//         );
//       }
//     }

//     // =====================================================
//     // CREATE
//     // =====================================================

//     await dispatch(
//       createProduct(formData)
//     ).unwrap();

//     // =====================================================
//     // RESET FORM
//     // =====================================================

//     setForm({
//       name: "",
//       description: "",
//       category: "",
//       price: "",
//       mrp: "",
//       stock: "",
//       sku: "",
//     });

//     setParentCategoryId("");
//     setSubcategoryId("");
//     setSelectedAccessories([]);

//     previews.forEach((url) => {
//       URL.revokeObjectURL(url);
//     });

//     setImages([]);
//     setPreviews([]);

//     setCategoryOpen(false);
//     setCategorySearch("");

//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//     // navigate("/")
//     navigate(`${couponBasePath}/products`)
//   } catch (error) {
//     console.error(
//       "Create product error:",
//       error
//     );
//   }
// };
//   // =====================================================
//   // RESET
//   // =====================================================

//   const handleReset = () => {
//     if (createLoading) {
//       return;
//     }

//     setForm({
//       name: "",
//       description: "",
//       category: "",
//       price: "",
//       mrp: "",
//       stock: "",
//       sku: "",
//     });

//     setParentCategoryId("");
//     setSubcategoryId("");
//     setSelectedAccessories([]);

//     previews.forEach((url) =>
//       URL.revokeObjectURL(url)
//     );

//     setImages([]);
//     setPreviews([]);

//     setCategoryOpen(false);
//     setCategorySearch("");

//     if (fileInputRef.current) {
//       fileInputRef.current.value =
//         "";
//     }

//     dispatch(
//       clearCreateProductStatus()
//     );
//   };

//   // =====================================================
//   // CLEANUP
//   // =====================================================

//   useEffect(() => {
//     return () => {
//       previews.forEach((url) =>
//         URL.revokeObjectURL(url)
//       );
//     };
//   }, [previews]);

//   // =====================================================
//   // ACTIVE PRODUCTS
//   // =====================================================

//   const activeProducts =
//     Array.isArray(product)
//       ? product.filter(
//           (item) =>
//             item?.status === "active"
//         )
//       : [];
// console.log("actvpro",activeProducts)
//   // =====================================================
//   // UI
//   // =====================================================

//   return (
//     <div className="min-h-screen bg-gray-50">

//       {/* =================================================
//           HEADER
//       ================================================= */}

//       <header className="bg-white border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">

//           <button
//             type="button"
//             onClick={() => navigate(-1)}
//             className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition mb-5"
//           >
//             <ArrowLeft size={17} />
//             Back
//           </button>

//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

//             <div className="flex items-center gap-3">

//               <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
//                 <Package size={22} />
//               </div>

//               <div>
//                 <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
//                   Create Product
//                 </h1>

//                 <p className="text-sm text-gray-500 mt-1">
//                   Add a new product to your store
//                 </p>
//               </div>

//             </div>

//             <div className="inline-flex items-center gap-2 w-fit rounded-full bg-gray-100 border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600">
//               <span className="w-2 h-2 rounded-full bg-gray-500" />

//               {user?.role === "admin"
//                 ? "Active on Creation"
//                 : "Draft on Creation"}
//             </div>

//           </div>
//         </div>
//       </header>

//       {/* =================================================
//           CONTENT
//       ================================================= */}

//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

//         {createError && (
//           <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 flex items-start gap-3 text-red-700">
//             <AlertCircle
//               size={19}
//               className="shrink-0 mt-0.5"
//             />

//             <p className="text-sm font-medium">
//               {createError}
//             </p>
//           </div>
//         )}

//         {createSuccess && (
//           <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 flex items-start gap-3 text-green-700">
//             <CheckCircle
//               size={19}
//               className="shrink-0 mt-0.5"
//             />

//             <p className="text-sm font-medium">
//               Product created successfully.
//               {user?.role === "vendor"
//                 ? " It has been saved as a draft."
//                 : " It is now active."}
//             </p>
//           </div>
//         )}

//         <form onSubmit={handleSubmit}>

//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

//             {/* =================================================
//                 MAIN
//             ================================================= */}

//             <div className="lg:col-span-2 space-y-6">

//               {/* =================================================
//                   BASIC INFORMATION
//               ================================================= */}

//               <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">

//                 <SectionHeader
//                   icon={<FileText size={19} />}
//                   iconClass="bg-blue-50 text-blue-600"
//                   title="Basic Information"
//                   description="Enter the main product details"
//                 />

//                 <div>
//                   <label className={labelClass}>
//                     Product Name
//                     <Required />
//                   </label>

//                   <input
//                     type="text"
//                     name="name"
//                     value={form.name}
//                     onChange={handleChange}
//                     placeholder="e.g. iPhone 17 Pro"
//                     className={inputClass}
//                     disabled={createLoading}
//                   />
//                 </div>

//                 <div className="mt-5">
//                   <label className={labelClass}>
//                     Product Description
//                     <Required />
//                   </label>

//                   <textarea
//                     name="description"
//                     value={form.description}
//                     onChange={handleChange}
//                     rows={6}
//                     placeholder="Describe your product, features, materials, specifications..."
//                     className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none resize-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:bg-gray-50 disabled:cursor-not-allowed"
//                     disabled={createLoading}
//                   />

//                   <div className="flex justify-between mt-2">
//                     <span className="text-xs text-gray-400">
//                       Minimum 10 characters
//                     </span>

//                     <span className="text-xs text-gray-400">
//                       {form.description.length}
//                     </span>
//                   </div>
//                 </div>

//               </section>

//               {/* =================================================
//                   CATEGORY
//               ================================================= */}

//               <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">

//                 <SectionHeader
//                   icon={<Layers size={19} />}
//                   iconClass="bg-purple-50 text-purple-600"
//                   title="Product Category"
//                   description="Choose a parent category first, then select its subcategory"
//                 />

//                 <div
//                   ref={categoryDropdownRef}
//                   className="relative"
//                 >

//                   <label className={labelClass}>
//                     Category
//                     <Required />
//                   </label>

//                   {/* SELECTED SUMMARY */}

//                   {(selectedParentCategory ||
//                     selectedSubcategory) && (
//                     <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3">

//                       <div className="flex items-center gap-2 text-xs text-gray-500">
//                         <FolderTree size={14} />
//                         <span>
//                           Selected category
//                         </span>
//                       </div>

//                       <div className="flex flex-wrap items-center gap-2 mt-2">

//                         {selectedParentCategory && (
//                           <span className="inline-flex items-center rounded-lg bg-white border border-blue-100 px-3 py-1.5 text-sm font-medium text-gray-700">
//                             {getCategoryName(
//                               selectedParentCategory
//                             )}
//                           </span>
//                         )}

//                         {selectedSubcategory && (
//                           <>
//                             <span className="text-gray-400">
//                               /
//                             </span>

//                             <span className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white">
//                               {getCategoryName(
//                                 selectedSubcategory
//                               )}
//                             </span>
//                           </>
//                         )}

//                       </div>
//                     </div>
//                   )}

//                   {/* BUTTON */}

//                   <button
//                     type="button"
//                     disabled={
//                       createLoading ||
//                       categoryLoading
//                     }
//                     onClick={() =>
//                       setCategoryOpen(
//                         (prev) => !prev
//                       )
//                     }
//                     className="w-full min-h-12 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition flex items-center justify-between gap-3 text-left hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:bg-gray-50 disabled:cursor-not-allowed"
//                   >

//                     <div className="min-w-0">

//                       {categoryLoading ? (
//                         <span className="text-gray-400">
//                           Loading categories...
//                         </span>
//                       ) : selectedSubcategory ? (
//                         <div>

//                           <p className="text-sm font-semibold text-gray-900 truncate">
//                             {getCategoryName(
//                               selectedSubcategory
//                             )}
//                           </p>

//                           <p className="text-xs text-gray-400 mt-0.5">
//                             {getCategoryName(
//                               selectedParentCategory
//                             )}
//                           </p>

//                         </div>
//                       ) : (
//                         <span className="text-gray-400">
//                           Select parent category
//                         </span>
//                       )}

//                     </div>

//                     <ChevronDown
//                       size={18}
//                       className={`shrink-0 text-gray-400 transition-transform ${
//                         categoryOpen
//                           ? "rotate-180"
//                           : ""
//                       }`}
//                     />

//                   </button>

//                   {/* =================================================
//                       DROPDOWN
//                   ================================================= */}

//                   {categoryOpen && (
//                     <div className="absolute z-50 left-0 right-0 mt-2 rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">

//                       {/* SEARCH */}

//                       <div className="p-3 border-b border-gray-100 bg-white">

//                         <div className="relative">

//                           <Search
//                             size={17}
//                             className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//                           />

//                           <input
//                             type="text"
//                             value={categorySearch}
//                             onChange={(e) =>
//                               setCategorySearch(
//                                 e.target.value
//                               )
//                             }
//                             placeholder={
//                               parentCategoryId
//                                 ? "Search subcategories..."
//                                 : "Search parent categories..."
//                             }
//                             className="w-full h-10 rounded-lg border border-gray-200 pl-9 pr-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
//                             autoFocus
//                           />

//                         </div>
//                       </div>

//                       {/* =================================================
//                           PARENT CATEGORIES
//                       ================================================= */}

//                       {!parentCategoryId ? (
//                         <div>

//                           <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">

//                             <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
//                               Step 1
//                             </p>

//                             <p className="text-sm font-semibold text-gray-800 mt-1">
//                               Select a parent category
//                             </p>

//                           </div>

//                           {/* IMPORTANT:
//                               This is the scroll container.
//                           */}

//                           <div
//                             ref={
//                               categoryScrollRef
//                             }
//                             className="max-h-64 overflow-y-auto overscroll-contain py-1"
//                           >

//                             {filteredParentCategories.length ===
//                             0 ? (
//                               <div className="px-4 py-6 text-sm text-gray-500 text-center">
//                                 {categoryLoading
//                                   ? "Loading categories..."
//                                   : "No parent categories found."}
//                               </div>
//                             ) : (
//                               filteredParentCategories.map(
//                                 (category) => {
//                                   const id =
//                                     getId(
//                                       category
//                                     );

//                                   const hasChildren =
//                                     getChildren(
//                                       category
//                                     ).length >
//                                       0 ||
//                                     normalizedCategories.subcategories.some(
//                                       (
//                                         item
//                                       ) =>
//                                         String(
//                                           item.__parentId
//                                         ) ===
//                                         String(
//                                           id
//                                         )
//                                     );

//                                   return (
//                                     <button
//                                       key={id}
//                                       type="button"
//                                       onClick={() =>
//                                         handleParentCategorySelect(
//                                           id
//                                         )
//                                       }
//                                       className="w-full text-left px-4 py-3 transition text-gray-700 hover:bg-blue-50"
//                                     >

//                                       <div className="flex items-center justify-between gap-3">

//                                         <div className="flex items-center gap-3 min-w-0">

//                                           <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
//                                             <Layers size={17} />
//                                           </div>

//                                           <div className="min-w-0">

//                                             <p className="text-sm font-semibold truncate">
//                                               {getCategoryName(
//                                                 category
//                                               )}
//                                             </p>

//                                             <p className="text-xs text-gray-400 mt-0.5">
//                                               {hasChildren
//                                                 ? "Has subcategories"
//                                                 : "No subcategories"}
//                                             </p>

//                                           </div>

//                                         </div>

//                                         <ChevronDown
//                                           size={17}
//                                           className="-rotate-90 text-gray-400 shrink-0"
//                                         />

//                                       </div>

//                                     </button>
//                                   );
//                                 }
//                               )
//                             )}

//                             {/* =================================================
//                                 INFINITE SCROLL SENTINEL
//                             ================================================= */}

//                             <div
//                               ref={
//                                 categoryLoadMoreRef
//                               }
//                               className="h-1"
//                             />

//                             {/* LOADING MORE */}

//                             {categoryLoadingMore && (
//                               <div className="flex items-center justify-center gap-2 py-4 text-xs text-gray-500">

//                                 <span className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />

//                                 Loading more categories...

//                               </div>
//                             )}

//                             {/* END */}

//                             {!categoryHasMore &&
//                               parentCategories.length >
//                                 0 && (
//                                 <div className="py-3 text-center text-xs text-gray-400">
//                                   No more categories
//                                 </div>
//                               )}

//                           </div>

//                         </div>
//                       ) : (

//                         /* =================================================
//                            SUBCATEGORIES
//                         ================================================= */

//                         <div>

//                           <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">

//                             <div className="flex items-center justify-between gap-3">

//                               <div>

//                                 <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
//                                   Step 2
//                                 </p>

//                                 <p className="text-sm font-semibold text-gray-800 mt-1">
//                                   Select a subcategory
//                                 </p>

//                               </div>

//                               <button
//                                 type="button"
//                                 onClick={() => {
//                                   setParentCategoryId("");
//                                   setSubcategoryId("");

//                                   setForm(
//                                     (prev) => ({
//                                       ...prev,
//                                       category:
//                                         "",
//                                     })
//                                   );

//                                   setCategorySearch("");
//                                 }}
//                                 className="text-xs font-semibold text-blue-600 hover:text-blue-700"
//                               >
//                                 Change
//                               </button>

//                             </div>

//                             <div className="inline-flex items-center gap-2 mt-2 rounded-lg bg-white border border-gray-200 px-3 py-1.5">

//                               <Layers
//                                 size={14}
//                                 className="text-purple-500"
//                               />

//                               <span className="text-xs font-medium text-gray-700">
//                                 {getCategoryName(
//                                   selectedParentCategory
//                                 )}
//                               </span>

//                             </div>

//                           </div>

//                           <div className="max-h-64 overflow-y-auto overscroll-contain py-1">

//                             {filteredSubcategories.length ===
//                             0 ? (
//                               <div className="px-4 py-6 text-center">

//                                 <Layers
//                                   size={25}
//                                   className="mx-auto text-gray-300"
//                                 />

//                                 <p className="mt-2 text-sm font-medium text-gray-600">
//                                   No subcategories found
//                                 </p>

//                                 <p className="mt-1 text-xs text-gray-400">
//                                   This parent category does not have any available subcategories.
//                                 </p>

//                                 <button
//                                   type="button"
//                                   onClick={() => {
//                                     setParentCategoryId("");
//                                     setSubcategoryId("");

//                                     setForm(
//                                       (prev) => ({
//                                         ...prev,
//                                         category:
//                                           "",
//                                       })
//                                     );

//                                     setCategorySearch("");
//                                   }}
//                                   className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700"
//                                 >
//                                   Choose another parent
//                                 </button>

//                               </div>
//                             ) : (
//                               filteredSubcategories.map(
//                                 (
//                                   subcategory
//                                 ) => {
//                                   const id =
//                                     getId(
//                                       subcategory
//                                     );

//                                   const selected =
//                                     String(
//                                       subcategoryId
//                                     ) ===
//                                     String(id);

//                                   return (
//                                     <button
//                                       key={id}
//                                       type="button"
//                                       onClick={() =>
//                                         handleSubcategorySelect(
//                                           id
//                                         )
//                                       }
//                                       className={`w-full text-left px-4 py-3 transition ${
//                                         selected
//                                           ? "bg-blue-50 text-blue-700"
//                                           : "text-gray-700 hover:bg-gray-50"
//                                       }`}
//                                     >

//                                       <div className="flex items-center justify-between gap-3">

//                                         <div className="flex items-center gap-3 min-w-0">

//                                           <div
//                                             className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
//                                               selected
//                                                 ? "bg-blue-100 text-blue-600"
//                                                 : "bg-gray-100 text-gray-400"
//                                             }`}
//                                           >
//                                             <FolderTree
//                                               size={16}
//                                             />
//                                           </div>

//                                           <span
//                                             className={`text-sm truncate ${
//                                               selected
//                                                 ? "font-semibold"
//                                                 : "font-medium"
//                                             }`}
//                                           >
//                                             {getCategoryName(
//                                               subcategory
//                                             )}
//                                           </span>

//                                         </div>

//                                         {selected && (
//                                           <CheckCircle
//                                             size={17}
//                                             className="text-blue-600 shrink-0"
//                                           />
//                                         )}

//                                       </div>

//                                     </button>
//                                   );
//                                 }
//                               )
//                             )}

//                           </div>

//                         </div>
//                       )}

//                     </div>
//                   )}

//                   <p className="mt-2 text-xs text-gray-400">
//                     Choose the parent category first.
//                     More categories load automatically as
//                     you scroll.
//                   </p>

//                 </div>

//               </section>

//               {/* =================================================
//                   PRICING
//               ================================================= */}

//               <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">

//                 <SectionHeader
//                   icon={
//                     <IndianRupee size={19} />
//                   }
//                   iconClass="bg-green-50 text-green-600"
//                   title="Pricing & Inventory"
//                   description="Set pricing and stock information"
//                 />

//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

//                   <div>
//                     <label className={labelClass}>
//                       Selling Price
//                       <Required />
//                     </label>

//                     <div className="relative">

//                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
//                         ₹
//                       </span>

//                       <input
//                         type="number"
//                         name="price"
//                         value={form.price}
//                         onChange={handleChange}
//                         min="0"
//                         step="0.01"
//                         placeholder="99999"
//                         className={currencyInputClass}
//                         disabled={createLoading}
//                       />

//                     </div>
//                   </div>

//                   <div>
//                     <label className={labelClass}>
//                       MRP
//                     </label>

//                     <div className="relative">

//                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
//                         ₹
//                       </span>

//                       <input
//                         type="number"
//                         name="mrp"
//                         value={form.mrp}
//                         onChange={handleChange}
//                         min="0"
//                         step="0.01"
//                         placeholder="109999"
//                         className={currencyInputClass}
//                         disabled={createLoading}
//                       />

//                     </div>
//                   </div>

//                   <div>
//                     <label className={labelClass}>
//                       Stock
//                       <Required />
//                     </label>

//                     <input
//                       type="number"
//                       name="stock"
//                       value={form.stock}
//                       onChange={handleChange}
//                       min="0"
//                       step="1"
//                       placeholder="20"
//                       className={inputClass}
//                       disabled={createLoading}
//                     />
//                   </div>

//                   <div>
//                     <label className={labelClass}>
//                       SKU
//                     </label>

//                     <input
//                       type="text"
//                       name="sku"
//                       value={form.sku}
//                       onChange={handleChange}
//                       placeholder="IPH17PRO-256"
//                       className={inputClass}
//                       disabled={createLoading}
//                     />
//                   </div>

//                 </div>
//               </section>

//               {/* =================================================
//                   IMAGES
//               ================================================= */}

//               <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">

//                 <div className="flex items-center justify-between gap-4 mb-6">

//                   <SectionHeader
//                     icon={
//                       <ImagePlus size={19} />
//                     }
//                     iconClass="bg-purple-50 text-purple-600"
//                     title="Product Images"
//                     description="Upload up to 5 images"
//                     noMargin
//                   />

//                   <span className="shrink-0 text-xs font-semibold text-gray-400">
//                     {images.length}/{MAX_IMAGES}
//                   </span>

//                 </div>

//                 {images.length <
//                   MAX_IMAGES && (
//                   <label className="relative flex flex-col items-center justify-center min-h-44 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer transition p-6 text-center">

//                     <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-blue-600 shadow-sm">
//                       <Upload size={21} />
//                     </div>

//                     <p className="mt-3 text-sm font-semibold text-gray-700">
//                       Click to upload images
//                     </p>

//                     <p className="mt-1 text-xs text-gray-400">
//                       PNG, JPG or WEBP • Maximum 5MB each
//                     </p>

//                     <input
//                       ref={fileInputRef}
//                       type="file"
//                       accept="image/png,image/jpeg,image/webp"
//                       multiple
//                       onChange={handleImageChange}
//                       className="hidden"
//                       disabled={createLoading}
//                     />

//                   </label>
//                 )}

//                 {previews.length > 0 && (
//                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">

//                     {previews.map(
//                       (
//                         preview,
//                         index
//                       ) => (
//                         <div
//                           key={`${preview}-${index}`}
//                           className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50"
//                         >

//                           <img
//                             src={preview}
//                             alt={`Product ${index + 1}`}
//                             className="w-full h-full object-cover"
//                           />

//                           <button
//                             type="button"
//                             onClick={() =>
//                               removeImage(
//                                 index
//                               )
//                             }
//                             disabled={createLoading}
//                             className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white text-gray-600 shadow flex items-center justify-center hover:bg-red-500 hover:text-white disabled:opacity-50 transition"
//                           >
//                             <X size={16} />
//                           </button>

//                           {index === 0 && (
//                             <span className="absolute bottom-2 left-2 rounded-md bg-blue-600 px-2 py-1 text-[10px] font-semibold text-white">
//                               Main Image
//                             </span>
//                           )}

//                         </div>
//                       )
//                     )}

//                   </div>
//                 )}

//               </section>

//               {/* =================================================
//                   ADDONS
//               ================================================= */}

//               <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">

//                 <SectionHeader
//                   icon={<Plus size={19} />}
//                   iconClass="bg-orange-50 text-orange-600"
//                   title="Add-on Products"
//                   description="Select products customers may want with this product"
//                 />

//                 {activeProducts.length ===
//                 0 ? (
//                   <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-500">
//                     No active products available for add-ons.
//                   </div>
//                 ) : (
//                   <div className="max-h-72 overflow-y-auto overscroll-contain space-y-2 pr-1">

//                     {activeProducts.map(
//                       (
//                         addonProduct
//                       ) => {
//                         const selected =
//                           selectedAccessories.includes(
//                             addonProduct._id
//                           );

//                         return (
//                           <label
//                             key={
//                               addonProduct._id
//                             }
//                             className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
//                               selected
//                                 ? "border-blue-400 bg-blue-50"
//                                 : "border-gray-200 hover:bg-gray-50"
//                             }`}
//                           >

//                             <input
//                               type="checkbox"
//                               checked={selected}
//                               onChange={() =>
//                                 toggleAccessory(
//                                   addonProduct._id
//                                 )
//                               }
//                               disabled={createLoading}
//                               className="w-4 h-4 accent-blue-600 shrink-0"
//                             />

//                             <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">

//                               {addonProduct.images?.[0] ? (
//                                 <img
//                                   src={ getImageUrl(addonProduct.images?.[0])|| `http://localhost:3000/uploads/${addonProduct.images?.[0]}`}
//                                   alt={
//                                     addonProduct.name
//                                   }
//                                   className="w-full h-full object-cover"
//                                 />
//                               ) : (
//                                 <Package
//                                   size={18}
//                                   className="m-2.5 text-gray-400"
//                                 />
//                               )}

//                             </div>

//                             <div className="min-w-0 flex-1">

//                               <p className="text-sm font-semibold text-gray-800 truncate">
//                                 {
//                                   addonProduct.name
//                                 }
//                               </p>

//                               <p className="text-xs text-gray-500">
//                                 ₹
//                                 {
//                                   addonProduct.price
//                                 }
//                               </p>

//                             </div>

//                           </label>
//                         );
//                       }
//                     )}

//                   </div>
//                 )}

//                 {selectedAccessories.length >
//                   0 && (
//                   <p className="text-xs text-blue-600 font-medium mt-3">
//                     {
//                       selectedAccessories.length
//                     }{" "}
//                     add-on
//                     {selectedAccessories.length >
//                     1
//                       ? "s"
//                       : ""}{" "}
//                     selected
//                   </p>
//                 )}

//               </section>

//             </div>

//             {/* =================================================
//                 SIDEBAR
//             ================================================= */}

//             <aside>

//               <div className="lg:sticky lg:top-24 space-y-6">

//                 <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">

//                   <h2 className="font-bold text-gray-900">
//                     Publish Product
//                   </h2>

//                   <p className="text-sm text-gray-500 mt-1 leading-6">
//                     {user?.role === "admin"
//                       ? "As an admin, this product will become active immediately."
//                       : "Vendor products are saved as drafts and can be activated later."}
//                   </p>

//                   <div
//                     className={`mt-5 rounded-xl border p-4 ${
//                       user?.role === "admin"
//                         ? "bg-green-50 border-green-100"
//                         : "bg-yellow-50 border-yellow-100"
//                     }`}
//                   >

//                     <div className="flex items-start gap-3">

//                       <div
//                         className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
//                           user?.role === "admin"
//                             ? "bg-green-100 text-green-600"
//                             : "bg-yellow-100 text-yellow-600"
//                         }`}
//                       >
//                         <CheckCircle size={16} />
//                       </div>

//                       <div>

//                         <p
//                           className={`text-sm font-semibold ${
//                             user?.role === "admin"
//                               ? "text-green-800"
//                               : "text-yellow-800"
//                           }`}
//                         >
//                           {user?.role === "admin"
//                             ? "Active"
//                             : "Draft"}
//                         </p>

//                         <p
//                           className={`text-xs mt-1 leading-5 ${
//                             user?.role === "admin"
//                               ? "text-green-700"
//                               : "text-yellow-700"
//                           }`}
//                         >
//                           {user?.role === "admin"
//                             ? "Product will be available to customers."
//                             : "Product will be saved as a draft."}
//                         </p>

//                       </div>

//                     </div>

//                   </div>

              

//                   <button
//                     type="submit"
//                     disabled={createLoading}
//                     className="w-full mt-5 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold flex items-center justify-center gap-2 transition shadow-sm"
//                   >

//                     {createLoading ? (
//                       <>
//                         <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                         Creating...
//                       </>
//                     ) : (
//                       <>
//                         <Package size={18} />
//                         Create Product
//                       </>
//                     )}

//                   </button>

//                   <button
//                     type="button"
//                     onClick={handleReset}
//                     disabled={createLoading}
//                     className="w-full mt-3 h-11 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 disabled:opacity-50 transition"
//                   >
//                     Clear Form
//                   </button>

//                 </section>

//                 <section className="bg-blue-50 rounded-2xl border border-blue-100 p-5">

//                   <h3 className="font-semibold text-blue-900">
//                     Product Guidelines
//                   </h3>

//                   <ul className="mt-3 space-y-2.5 text-sm text-blue-800">

//                     <li className="flex gap-2">
//                       <span>•</span>
//                       Use a clear product name.
//                     </li>

//                     <li className="flex gap-2">
//                       <span>•</span>
//                       Select the correct parent category.
//                     </li>

//                     <li className="flex gap-2">
//                       <span>•</span>
//                       Select the most specific subcategory.
//                     </li>

//                     <li className="flex gap-2">
//                       <span>•</span>
//                       Upload high-quality images.
//                     </li>

//                     <li className="flex gap-2">
//                       <span>•</span>
//                       Add an accurate description.
//                     </li>

//                     <li className="flex gap-2">
//                       <span>•</span>
//                       Add relevant products as add-ons.
//                     </li>

//                   </ul>

//                 </section>

//               </div>

//             </aside>

//           </div>
//         </form>

//       </main>
//     </div>
//   );
// }

// // =====================================================
// // REQUIRED
// // =====================================================

// function Required() {
//   return (
//     <span className="text-red-500 ml-1">
//       *
//     </span>
//   );
// }

// // =====================================================
// // SECTION HEADER
// // =====================================================

// function SectionHeader({
//   icon,
//   iconClass,
//   title,
//   description,
//   noMargin = false,
// }) {
//   return (
//     <div
//       className={`flex items-center gap-3 ${
//         noMargin ? "" : "mb-6"
//       }`}
//     >
//       <div
//         className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}
//       >
//         {icon}
//       </div>

//       <div>

//         <h2 className="font-bold text-gray-900">
//           {title}
//         </h2>

//         <p className="text-xs text-gray-500 mt-0.5">
//           {description}
//         </p>

//       </div>
//     </div>
//   );
// }

// // =====================================================
// // STYLES
// // =====================================================

// const labelClass = `
//   block
//   text-sm
//   font-semibold
//   text-gray-700
//   mb-2
// `;

// const inputClass = `
//   w-full
//   h-12
//   rounded-xl
//   border
//   border-gray-200
//   bg-white
//   px-4
//   text-sm
//   text-gray-900
//   outline-none
//   transition
//   placeholder:text-gray-400
//   focus:border-blue-500
//   focus:ring-4
//   focus:ring-blue-50
//   disabled:bg-gray-50
//   disabled:cursor-not-allowed
// `;

// const currencyInputClass = `
//   w-full
//   h-12
//   rounded-xl
//   border
//   border-gray-200
//   bg-white
//   pl-9
//   pr-4
//   text-sm
//   text-gray-900
//   outline-none
//   transition
//   placeholder:text-gray-400
//   focus:border-blue-500
//   focus:ring-4
//   focus:ring-blue-50
//   disabled:bg-gray-50
//   disabled:cursor-not-allowed
// `;









































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
    <div className="min-h-screen bg-gray-50">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">

          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition mb-5"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Package size={22} />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Create Product
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                  Add a new product to your store
                </p>
              </div>

            </div>

            <div className="inline-flex items-center gap-2 w-fit rounded-full bg-gray-100 border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600">
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

              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">

                <SectionHeader
                  icon={<FileText size={19} />}
                  iconClass="bg-blue-50 text-blue-600"
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
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none resize-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:bg-gray-50 disabled:cursor-not-allowed"
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

              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">

                <SectionHeader
                  icon={
                    <Layers size={19} />
                  }
                  iconClass="bg-purple-50 text-purple-600"
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
                    <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3">

                      <div className="flex items-center gap-2 text-xs text-gray-500">
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
                                      : "bg-white border border-blue-100 text-gray-700"
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
                        <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 border border-green-100 px-3 py-2">

                          <CheckCircle
                            size={15}
                            className="text-green-600"
                          />

                          <p className="text-xs font-medium text-green-700">
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
                    className="w-full min-h-12 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition flex items-center justify-between gap-3 text-left hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:bg-gray-50 disabled:cursor-not-allowed"
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

                          <p className="text-sm font-semibold text-gray-900 truncate">
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

                          <p className="text-sm font-semibold text-gray-900 truncate">
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
                    <div className="absolute z-50 left-0 right-0 mt-2 rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">

                      {/* =================================================
                          SEARCH
                      ================================================= */}

                      <div className="p-3 border-b border-gray-100 bg-white">

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
                            className="w-full h-10 rounded-lg border border-gray-200 pl-9 pr-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                            autoFocus
                          />

                        </div>
                      </div>

                      {/* =================================================
                          LEVEL HEADER
                      ================================================= */}

                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">

                        <div className="flex items-center justify-between gap-3">

                          <div className="min-w-0">

                            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                              Level{" "}
                              {
                                selectedCategoryPath.length +
                                  1
                              }
                            </p>

                            <p className="text-sm font-semibold text-gray-800 mt-1 truncate">
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
                              className="inline-flex items-center gap-1.5 shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50"
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

                                  <span className="text-xs font-medium text-gray-600">
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
                        <div className="mx-3 mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2">

                          <div className="flex items-start gap-2">

                            <AlertCircle
                              size={15}
                              className="text-red-500 shrink-0 mt-0.5"
                            />

                            <p className="text-xs text-red-600">
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

                            <p className="mt-3 text-sm font-medium text-gray-600">
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
                              className="mx-auto text-gray-300"
                            />

                            <p className="mt-3 text-sm font-medium text-gray-600">
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
                                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
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
                                  className="w-full text-left px-4 py-3 transition text-gray-700 hover:bg-blue-50 disabled:opacity-60"
                                >

                                  <div className="flex items-center justify-between gap-3">

                                    <div className="flex items-center gap-3 min-w-0">

                                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
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
                        <div className="border-t border-gray-100 p-3">

                          <button
                            type="button"
                            onClick={
                              handleChangeCategory
                            }
                            disabled={
                              categoryLoading
                            }
                            className="w-full h-10 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
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

              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">

                <SectionHeader
                  icon={
                    <IndianRupee
                      size={19}
                    />
                  }
                  iconClass="bg-green-50 text-green-600"
                  title="Pricing & Inventory"
                  description={
                    hasVariants
                      ? "Manage price, stock and configurations for each variant"
                      : "Set pricing and stock information"
                  }
                />

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 mb-6">

                  <div className="flex items-center justify-between gap-4">

                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        This product has variants
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
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
                          : "bg-gray-300"
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
                    <div className="mt-3 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2">
                      <p className="text-xs text-blue-700">
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

                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
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

                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
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
                        placeholder="20"
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
                          className="rounded-2xl border border-gray-200 bg-white shadow-sm"
                        >

                          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-2xl">

                            <div>
                              <p className="text-sm font-bold text-gray-900">
                                Variant{" "}
                                {variantIndex +
                                  1}
                              </p>

                              <p className="text-xs text-gray-500 mt-0.5">
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

                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
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

                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
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
                                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
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
                                        className="h-11 w-11 rounded-xl border border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500 disabled:opacity-40 flex items-center justify-center"
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

                            <div className="rounded-xl bg-gray-50 border border-gray-200 px-3 py-3">

                              <div className="flex items-center justify-between gap-3">

                                <div>
                                  <p className="text-xs font-semibold text-gray-700">
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
                      className="w-full h-12 rounded-xl border-2 border-dashed border-gray-200 text-sm font-semibold text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Plus
                        size={18}
                      />

                      Add Another Variant
                    </button>

                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-blue-700">

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

              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">

                <div className="flex items-center justify-between gap-4 mb-6">

                  <SectionHeader
                    icon={
                      <ImagePlus
                        size={19}
                      />
                    }
                    iconClass="bg-purple-50 text-purple-600"
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
                  <label className="relative flex flex-col items-center justify-center min-h-44 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer transition p-6 text-center">

                    <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-blue-600 shadow-sm">
                      <Upload
                        size={21}
                      />
                    </div>

                    <p className="mt-3 text-sm font-semibold text-gray-700">
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
                          className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50"
                        >

                          <img
                            src={
                              preview
                            }
                            alt={`Product ${
                              index +
                              1
                            }`}
                            className="w-full h-full object-cover"
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
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white text-gray-600 shadow flex items-center justify-center hover:bg-red-500 hover:text-white disabled:opacity-50 transition"
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

              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">

                <SectionHeader
                  icon={
                    <Plus size={19} />
                  }
                  iconClass="bg-orange-50 text-orange-600"
                  title="Add-on Products"
                  description="Select products customers may want with this product"
                />

                {activeProducts.length ===
                0 ? (
                  <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-500">
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
                                ? "border-blue-400 bg-blue-50"
                                : "border-gray-200 hover:bg-gray-50"
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

                            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">

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
                                  className="w-full h-full object-cover"
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

                              <p className="text-sm font-semibold text-gray-800 truncate">
                                {
                                  addonProduct.name
                                }
                              </p>

                              <p className="text-xs text-gray-500">
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
                  <p className="text-xs text-blue-600 font-medium mt-3">
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

                <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">

                  <h2 className="font-bold text-gray-900">
                    Publish Product
                  </h2>

                  <p className="text-sm text-gray-500 mt-1 leading-6">
                    {user?.role ===
                    "admin"
                      ? "As an admin, this product will become active immediately."
                      : "Vendor products are saved as drafts and can be activated later."}
                  </p>

                  <div
                    className={`mt-5 rounded-xl border p-4 ${
                      user?.role ===
                      "admin"
                        ? "bg-green-50 border-green-100"
                        : "bg-yellow-50 border-yellow-100"
                    }`}
                  >

                    <div className="flex items-start gap-3">

                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          user?.role ===
                          "admin"
                            ? "bg-green-100 text-green-600"
                            : "bg-yellow-100 text-yellow-600"
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
                              ? "text-green-800"
                              : "text-yellow-800"
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
                              ? "text-green-700"
                              : "text-yellow-700"
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

                  <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3">

                    <div className="flex items-start gap-2">

                      <FolderTree
                        size={
                          15
                        }
                        className="text-purple-500 mt-0.5 shrink-0"
                      />

                      <div className="min-w-0">

                        <p className="text-xs font-semibold text-gray-700">
                          Product Category
                        </p>

                        {hasFinalCategory ? (
                          <>
                            <p className="text-sm font-semibold text-gray-900 mt-1 truncate">
                              {
                                finalCategory?.name
                              }
                            </p>

                            <p className="text-[11px] text-gray-400 mt-1 leading-4">
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
                    className="w-full mt-5 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold flex items-center justify-center gap-2 transition shadow-sm"
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
                    className="w-full mt-3 h-11 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 disabled:opacity-50 transition"
                  >
                    Clear Form
                  </button>

                </section>

                <section className="bg-blue-50 rounded-2xl border border-blue-100 p-5">

                  <h3 className="font-semibold text-blue-900">
                    Product Guidelines
                  </h3>

                  <ul className="mt-3 space-y-2.5 text-sm text-blue-800">

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

        <h2 className="font-bold text-gray-900">
          {title}
        </h2>

        <p className="text-xs text-gray-500 mt-0.5">
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
  mb-2
`;

const inputClass = `
  w-full
  h-12
  rounded-xl
  border
  border-gray-200
  bg-white
  px-4
  text-sm
  text-gray-900
  outline-none
  transition
  placeholder:text-gray-400
  focus:border-blue-500
  focus:ring-4
  focus:ring-blue-50
  disabled:bg-gray-50
  disabled:cursor-not-allowed
`;

const currencyInputClass = `
  w-full
  h-12
  rounded-xl
  border
  border-gray-200
  bg-white
  pl-9
  pr-4
  text-sm
  text-gray-900
  outline-none
  transition
  placeholder:text-gray-400
  focus:border-blue-500
  focus:ring-4
  focus:ring-blue-50
  disabled:bg-gray-50
  disabled:cursor-not-allowed
`;