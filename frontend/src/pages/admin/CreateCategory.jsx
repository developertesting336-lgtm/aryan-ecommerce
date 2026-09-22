import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  createCategory,
  getCategories,
  clearCategoryError,
  clearCategoryMessage,
} from "../../redux/slices/categorySlice";

const CreateCategory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    categories,
    createLoading,
    error,
    message,
    pagination,
  } = useSelector((state) => state.category);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    parent: "",
    sortOrder: 0,
    isActive: true,

    image: {
      url: "",
      publicId: "",
    },
  });

  const [slugEdited, setSlugEdited] = useState(false);

  /* =========================================================
     FETCH CATEGORIES
  ========================================================= */

  useEffect(() => {
    dispatch(
      getCategories({
        page: 1,
        limit: 100,
      })
    );
  }, [dispatch]);

  /* =========================================================
     CLEANUP
  ========================================================= */

  useEffect(() => {
    return () => {
      dispatch(clearCategoryError());
      dispatch(clearCategoryMessage());
    };
  }, [dispatch]);

  /* =========================================================
     AUTO REDIRECT AFTER CREATE
  ========================================================= */

  useEffect(() => {
    if (message && message === "Category created successfully") {
      const timer = setTimeout(() => {
        navigate("/admin-categories");
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [message, navigate]);

  /* =========================================================
     SLUG GENERATOR
  ========================================================= */

  const generateSlug = (value) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  /* =========================================================
     INPUT HANDLER
  ========================================================= */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    const newValue =
      type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Auto generate slug from name
    if (name === "name" && !slugEdited) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(value),
      }));
    }
  };

  /* =========================================================
     IMAGE HANDLER
  ========================================================= */

  const handleImageChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,

      image: {
        ...prev.image,
        [name]: value,
      },
    }));
  };

  /* =========================================================
     PARENT CATEGORY
  ========================================================= */

  const handleParentChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      parent: e.target.value,
    }));
  };

  /* =========================================================
     CALCULATE LEVEL
  ========================================================= */

  const selectedParent = useMemo(() => {
    if (!formData.parent) {
      return null;
    }

    return categories.find(
      (category) => category._id === formData.parent
    );
  }, [categories, formData.parent]);

  const calculatedLevel = selectedParent
    ? (selectedParent.level || 0) + 1
    : 0;

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    dispatch(clearCategoryError());

    if (!formData.name.trim()) {
      return;
    }

    const payload = {
      name: formData.name.trim(),

      slug: formData.slug.trim(),

      description: formData.description.trim(),

      parent: formData.parent || null,

      level: calculatedLevel,

      sortOrder: Number(formData.sortOrder) || 0,

      isActive: formData.isActive,

      image: {
        url: formData.image.url.trim(),

        publicId: formData.image.publicId.trim(),
      },
    };

    dispatch(createCategory(payload));
  };

  /* =========================================================
     RESET
  ========================================================= */

  const handleReset = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      parent: "",
      sortOrder: 0,
      isActive: true,

      image: {
        url: "",
        publicId: "",
      },
    });

    setSlugEdited(false);

    dispatch(clearCategoryError());
    dispatch(clearCategoryMessage());
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">

        {/* ================================================
            HEADER
        ================================================= */}

        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            className="mb-4 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← Back to Dashboard
          </button>

          <h1 className="text-3xl font-bold text-gray-900">
            Create Category
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Create a new product category and optionally
            place it under an existing category.
          </p>
        </div>

        {/* ================================================
            SUCCESS
        ================================================= */}

        {message && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {/* ================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => dispatch(clearCategoryError())}
              className="font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* ================================================
            FORM
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-gray-200 bg-white shadow-sm"
        >

          {/* ================================================
              BASIC INFORMATION
          ================================================= */}

          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Basic information about your category.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">

              {/* NAME */}

              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Category Name
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Electronics"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* SLUG */}

              <div>
                <label
                  htmlFor="slug"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Slug
                </label>

                <input
                  id="slug"
                  name="slug"
                  type="text"
                  value={formData.slug}
                  onChange={(e) => {
                    setSlugEdited(true);

                    setFormData((prev) => ({
                      ...prev,
                      slug: e.target.value,
                    }));
                  }}
                  placeholder="electronics"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Automatically generated from the category name.
                </p>
              </div>

              {/* DESCRIPTION */}

              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter category description..."
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* ================================================
              CATEGORY HIERARCHY
          ================================================= */}

          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Category Hierarchy
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Choose a parent category if this is a subcategory.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">

              {/* PARENT */}

              <div>
                <label
                  htmlFor="parent"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Parent Category
                </label>

                <select
                  id="parent"
                  name="parent"
                  value={formData.parent}
                  onChange={handleParentChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    No Parent (Root Category)
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category._id}
                      value={category._id}
                    >
                      {"— ".repeat(category.level || 0)}
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* LEVEL */}

              <div>
                <label
                  htmlFor="level"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Category Level
                </label>

                <input
                  id="level"
                  type="number"
                  value={calculatedLevel}
                  disabled
                  className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-4 py-2.5 text-gray-600"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Automatically calculated from the parent category.
                </p>
              </div>

              {/* SORT ORDER */}

              <div>
                <label
                  htmlFor="sortOrder"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Sort Order
                </label>

                <input
                  id="sortOrder"
                  name="sortOrder"
                  type="number"
                  min="0"
                  value={formData.sortOrder}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Lower numbers appear first.
                </p>
              </div>

              {/* STATUS */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Status
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-300 px-4 py-3">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />

                  <span className="text-sm text-gray-700">
                    Active Category
                  </span>
                </label>
              </div>
            </div>

            {/* LEVEL INFO */}

            <div className="mt-6 rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                {selectedParent ? (
                  <>
                    This category will be a child of{" "}
                    <strong>
                      {selectedParent.name}
                    </strong>{" "}
                    and will be created at level{" "}
                    <strong>{calculatedLevel}</strong>.
                  </>
                ) : (
                  <>
                    This category will be created as a{" "}
                    <strong>root category</strong> at level{" "}
                    <strong>0</strong>.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* ================================================
              IMAGE
          ================================================= */}

          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Category Image
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Add the image URL and Cloudinary public ID.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">

              <div>
                <label
                  htmlFor="imageUrl"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Image URL
                </label>

                <input
                  id="imageUrl"
                  name="url"
                  type="url"
                  value={formData.image.url}
                  onChange={handleImageChange}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="publicId"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Public ID
                </label>

                <input
                  id="publicId"
                  name="publicId"
                  type="text"
                  value={formData.image.publicId}
                  onChange={handleImageChange}
                  placeholder="category/electronics"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* IMAGE PREVIEW */}

            {formData.image.url && (
              <div className="mt-6">
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Preview
                </p>

                <img
                  src={formData.image.url}
                  alt="Category preview"
                  className="h-32 w-32 rounded-lg border border-gray-200 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {/* ================================================
              ACTIONS
          ================================================= */}

          <div className="flex flex-col-reverse gap-3 bg-gray-50 p-6 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={handleReset}
              disabled={createLoading}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reset
            </button>

            <button
              type="submit"
              disabled={createLoading}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating...
                </span>
              ) : (
                "Create Category"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCategory;