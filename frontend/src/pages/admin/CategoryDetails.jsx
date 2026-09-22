import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
  getCategoryById,
  getCategoryChildren,
  getCategories,
  updateCategory,
  deleteCategory,
  clearCategoryError,
  clearCategoryMessage,
} from "../../redux/slices/categorySlice";

const CategoryDetails = () => {
  const { id } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    selectedCategory,
    children,
    categories,
    loading,
    updateLoading,
    deleteLoading,
    error,
    message,
  } = useSelector((state) => state.category);

  const [isEditing, setIsEditing] = useState(false);

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
     FETCH CATEGORY
  ========================================================= */

  useEffect(() => {
    if (!id) return;

    dispatch(getCategoryById(id));
    dispatch(getCategoryChildren(id));

    // Needed for parent category dropdown
    dispatch(
      getCategories({
        page: 1,
        limit: 100,
      })
    );
  }, [dispatch, id]);

  /* =========================================================
     LOAD CATEGORY INTO FORM
  ========================================================= */

  useEffect(() => {
    if (!selectedCategory) return;

    setFormData({
      name: selectedCategory.name || "",

      slug: selectedCategory.slug || "",

      description:
        selectedCategory.description || "",

      parent:
        selectedCategory.parent?._id ||
        selectedCategory.parent ||
        "",

      sortOrder:
        selectedCategory.sortOrder ?? 0,

      isActive:
        selectedCategory.isActive ?? true,

      image: {
        url:
          selectedCategory.image?.url || "",

        publicId:
          selectedCategory.image?.publicId || "",
      },
    });

    setSlugEdited(false);
  }, [selectedCategory]);

  /* =========================================================
     CHILDREN
  ========================================================= */

  const categoryChildren = children?.[id] || [];

  /* =========================================================
     AVAILABLE PARENTS
     
     Don't allow this category itself to become its own parent.
  ========================================================= */

  const availableParents = useMemo(() => {
    return categories.filter(
      (category) => category._id !== id
    );
  }, [categories, id]);

  /* =========================================================
     SELECTED PARENT
  ========================================================= */

  const selectedParent = useMemo(() => {
    if (!formData.parent) {
      return null;
    }

    return categories.find(
      (category) => category._id === formData.parent
    );
  }, [categories, formData.parent]);

  /* =========================================================
     LEVEL
  ========================================================= */

  const calculatedLevel = selectedParent
    ? (selectedParent.level || 0) + 1
    : 0;

  /* =========================================================
     ERROR / MESSAGE CLEANUP
  ========================================================= */

  useEffect(() => {
    return () => {
      dispatch(clearCategoryError());
      dispatch(clearCategoryMessage());
    };
  }, [dispatch]);

  /* =========================================================
     INPUT HANDLER
  ========================================================= */

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    const newValue =
      type === "checkbox"
        ? checked
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Auto generate slug
    if (
      name === "name" &&
      !slugEdited
    ) {
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
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,

      image: {
        ...prev.image,
        [name]: value,
      },
    }));
  };

  /* =========================================================
     SLUG
  ========================================================= */

  const generateSlug = (value) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  /* =========================================================
     EDIT MODE
  ========================================================= */

  const handleEdit = () => {
    if (!selectedCategory) return;

    dispatch(clearCategoryError());
    dispatch(clearCategoryMessage());

    setIsEditing(true);
  };

  /* =========================================================
     CANCEL EDIT
  ========================================================= */

  const handleCancelEdit = () => {
    if (!selectedCategory) return;

    setFormData({
      name: selectedCategory.name || "",

      slug: selectedCategory.slug || "",

      description:
        selectedCategory.description || "",

      parent:
        selectedCategory.parent?._id ||
        selectedCategory.parent ||
        "",

      sortOrder:
        selectedCategory.sortOrder ?? 0,

      isActive:
        selectedCategory.isActive ?? true,

      image: {
        url:
          selectedCategory.image?.url || "",

        publicId:
          selectedCategory.image?.publicId || "",
      },
    });

    setSlugEdited(false);

    dispatch(clearCategoryError());
    dispatch(clearCategoryMessage());

    setIsEditing(false);
  };

  /* =========================================================
     UPDATE CATEGORY
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    dispatch(clearCategoryError());
    dispatch(clearCategoryMessage());

    if (!formData.name.trim()) {
      return;
    }

    const payload = {
      name: formData.name.trim(),

      slug: formData.slug.trim(),

      description:
        formData.description.trim(),

      parent:
        formData.parent || null,

      sortOrder:
        Number(formData.sortOrder) || 0,

      isActive:
        formData.isActive,

      image: {
        url:
          formData.image.url.trim(),

        publicId:
          formData.image.publicId.trim(),
      },
    };

    const result = await dispatch(
      updateCategory({
        id,
        categoryData: payload,
      })
    );

    /*
      If your thunk uses createAsyncThunk,
      this checks whether the request succeeded.
    */

    if (
      updateCategory.fulfilled.match(result)
    ) {
      setIsEditing(false);

      // Refresh the category
      dispatch(getCategoryById(id));

      // Refresh children
      dispatch(getCategoryChildren(id));
    }
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete = async () => {
    if (!selectedCategory) return;

    if (categoryChildren.length > 0) {
      alert(
        "This category has child categories. Delete or move the child categories first."
      );

      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${selectedCategory.name}"?`
    );

    if (!confirmed) return;

    const result = await dispatch(
      deleteCategory(id)
    );

    if (
      deleteCategory.fulfilled.match(result)
    ) {
      navigate("/admin/categories");
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (
    loading &&
    !selectedCategory
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-gray-600">

          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />

          Loading category...

        </div>
      </div>
    );
  }

  /* =========================================================
     NOT FOUND
  ========================================================= */

  if (!selectedCategory) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">

        <div className="text-center">

          <div className="mb-4 text-5xl">
            📁
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Category not found
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            The category you're looking for does not exist.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/categories")
            }
            className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Back to Categories
          </button>

        </div>
      </div>
    );
  }

  /* =========================================================
     VIEW MODE
  ========================================================= */

  if (!isEditing) {
    return (
      <CategoryView
        category={selectedCategory}
        children={categoryChildren}
        error={error}
        message={message}
        deleteLoading={deleteLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBack={() =>
          navigate("/admin/categories")
        }
        onViewCategory={(categoryId) =>
          navigate(
            `/admin/categories/${categoryId}`
          )
        }
      />
    );
  }

  /* =========================================================
     EDIT MODE
  ========================================================= */

  return (
    <CategoryEditForm
      formData={formData}
      categories={availableParents}
      selectedParent={selectedParent}
      calculatedLevel={calculatedLevel}
      slugEdited={slugEdited}
      updateLoading={updateLoading}
      error={error}
      message={message}
      onChange={handleChange}
      onImageChange={handleImageChange}
      onSlugChange={(e) => {
        setSlugEdited(true);

        setFormData((prev) => ({
          ...prev,
          slug: e.target.value,
        }));
      }}
      onCancel={handleCancelEdit}
      onSubmit={handleSubmit}
    />
  );
};


/* =========================================================
   CATEGORY VIEW
========================================================= */

const CategoryView = ({
  category,
  children,
  error,
  message,
  deleteLoading,
  onEdit,
  onDelete,
  onBack,
  onViewCategory,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <button
            type="button"
            onClick={onBack}
            className="text-left text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← Back to Categories
          </button>

          <div className="flex gap-2">

            <button
              type="button"
              onClick={onEdit}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Edit Category
            </button>

            <button
              type="button"
              onClick={onDelete}
              disabled={
                deleteLoading ||
                children.length > 0
              }
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleteLoading
                ? "Deleting..."
                : "Delete"}
            </button>

          </div>
        </div>

        {/* SUCCESS */}

        {message && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* MAIN CARD */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-200 bg-linear-to-r from-blue-50 to-white p-6 sm:p-8">

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

              {/* IMAGE */}

              {category.image?.url ? (
                <img
                  src={category.image.url}
                  alt={category.name}
                  className="h-28 w-28 rounded-2xl border border-gray-200 object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-blue-100 text-5xl">
                  📁
                </div>
              )}

              {/* INFO */}

              <div className="flex-1">

                <div className="flex flex-wrap items-center gap-3">

                  <h1 className="text-3xl font-bold text-gray-900">
                    {category.name}
                  </h1>

                  {category.isActive ? (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      Active
                    </span>
                  ) : (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                      Inactive
                    </span>
                  )}

                </div>

                <p className="mt-2 text-sm text-gray-500">
                  /{category.slug}
                </p>

                {category.description && (
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-600">
                    {category.description}
                  </p>
                )}

              </div>
            </div>
          </div>

          {/* INFORMATION */}

          <div className="p-6 sm:p-8">

            <h2 className="text-lg font-semibold text-gray-900">
              Category Information
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <InfoCard
                label="Level"
                value={`Level ${category.level || 0}`}
              />

              <InfoCard
                label="Sort Order"
                value={category.sortOrder ?? 0}
              />

              <InfoCard
                label="Parent"
                value={
                  category.parent?.name ||
                  "Root Category"
                }
              />

              <InfoCard
                label="Child Categories"
                value={children.length}
              />

            </div>

            {/* IMAGE INFO */}

            {category.image?.url && (
              <div className="mt-8 border-t border-gray-200 pt-6">

                <h2 className="text-lg font-semibold text-gray-900">
                  Image
                </h2>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Image URL
                    </p>

                    <p className="mt-1 break-all text-sm text-gray-700">
                      {category.image.url}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Public ID
                    </p>

                    <p className="mt-1 break-all text-sm text-gray-700">
                      {category.image.publicId || "—"}
                    </p>
                  </div>

                </div>
              </div>
            )}

            {/* TIMESTAMPS */}

            <div className="mt-8 border-t border-gray-200 pt-6">

              <h2 className="text-lg font-semibold text-gray-900">
                Timestamps
              </h2>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Created
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    {category.createdAt
                      ? new Date(
                          category.createdAt
                        ).toLocaleString()
                      : "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Last Updated
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    {category.updatedAt
                      ? new Date(
                          category.updatedAt
                        ).toLocaleString()
                      : "—"}
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* PARENT */}

        {category.parent && (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-gray-900">
              Parent Category
            </h2>

            <div className="mt-5 flex items-center justify-between rounded-xl bg-gray-50 p-4">

              <div className="flex items-center gap-4">

                {category.parent.image?.url ? (
                  <img
                    src={category.parent.image.url}
                    alt={category.parent.name}
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-blue-100 text-xl">
                    📁
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-gray-900">
                    {category.parent.name}
                  </h3>

                  <p className="text-sm text-gray-500">
                    /{category.parent.slug}
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  onViewCategory(
                    category.parent._id
                  )
                }
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View →
              </button>

            </div>
          </div>
        )}

        {/* CHILDREN */}

        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-gray-200 p-6">

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Child Categories
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Categories under {category.name}.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                onViewCategory
              }
              className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
            >
              {children.length}{" "}
              {children.length === 1
                ? "Child"
                : "Children"}
            </button>

          </div>

          {children.length === 0 ? (
            <div className="p-10 text-center">

              <div className="mb-3 text-4xl">
                📂
              </div>

              <h3 className="font-semibold text-gray-900">
                No child categories
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                This category doesn't have any subcategories yet.
              </p>

            </div>
          ) : (
            <div className="divide-y divide-gray-100">

              {children.map((child) => (
                <div
                  key={child._id}
                  className="flex items-center justify-between p-5 transition hover:bg-gray-50"
                >

                  <div className="flex items-center gap-4">

                    {child.image?.url ? (
                      <img
                        src={child.image.url}
                        alt={child.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                        📁
                      </div>
                    )}

                    <div>
                      <h3 className="font-medium text-gray-900">
                        {child.name}
                      </h3>

                      <p className="text-xs text-gray-500">
                        /{child.slug}
                      </p>
                    </div>

                  </div>

                  <div className="flex items-center gap-4">

                    {child.isActive ? (
                      <span className="hidden rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 sm:inline-block">
                        Active
                      </span>
                    ) : (
                      <span className="hidden rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 sm:inline-block">
                        Inactive
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        onViewCategory(
                          child._id
                        )
                      }
                      className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      View
                    </button>

                  </div>
                </div>
              ))}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};


/* =========================================================
   EDIT FORM
========================================================= */

const CategoryEditForm = ({
  formData,
  categories,
  selectedParent,
  calculatedLevel,
  slugEdited,
  updateLoading,
  error,
  message,
  onChange,
  onImageChange,
  onSlugChange,
  onCancel,
  onSubmit,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-4xl">

        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <button
              type="button"
              onClick={onCancel}
              className="mb-3 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              ← Cancel Editing
            </button>

            <h1 className="text-3xl font-bold text-gray-900">
              Edit Category
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Update the category information below.
            </p>
          </div>

        </div>

        {/* SUCCESS */}

        {message && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* FORM */}

        <form
          onSubmit={onSubmit}
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
        >

          {/* BASIC INFO */}

          <div className="border-b border-gray-200 p-6">

            <h2 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">

              {/* NAME */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Category Name
                </label>

                <input
                  name="name"
                  value={formData.name}
                  onChange={onChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* SLUG */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Slug
                </label>

                <input
                  name="slug"
                  value={formData.slug}
                  onChange={onSlugChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-1 text-xs text-gray-500">
                  {slugEdited
                    ? "Custom slug"
                    : "Automatically generated"}
                </p>
              </div>

              {/* DESCRIPTION */}

              <div className="md:col-span-2">

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={onChange}
                  rows={5}
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

            </div>
          </div>

          {/* HIERARCHY */}

          <div className="border-b border-gray-200 p-6">

            <h2 className="text-lg font-semibold text-gray-900">
              Category Hierarchy
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">

              {/* PARENT */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Parent Category
                </label>

                <select
                  name="parent"
                  value={formData.parent}
                  onChange={onChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >

                  <option value="">
                    No Parent (Root Category)
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category._id}
                        value={category._id}
                      >
                        {"— ".repeat(
                          category.level || 0
                        )}
                        {category.name}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* LEVEL */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Category Level
                </label>

                <input
                  value={calculatedLevel}
                  disabled
                  className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-4 py-2.5 text-gray-600"
                />

              </div>

              {/* SORT */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Sort Order
                </label>

                <input
                  name="sortOrder"
                  type="number"
                  min="0"
                  value={formData.sortOrder}
                  onChange={onChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* STATUS */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Status
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-300 px-4 py-3">

                  <input
                    name="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={onChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                  />

                  <span className="text-sm text-gray-700">
                    Active Category
                  </span>

                </label>

              </div>

            </div>

            {selectedParent && (
              <div className="mt-5 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                This category will be under{" "}
                <strong>
                  {selectedParent.name}
                </strong>{" "}
                at level{" "}
                <strong>
                  {calculatedLevel}
                </strong>.
              </div>
            )}

          </div>

          {/* IMAGE */}

          <div className="border-b border-gray-200 p-6">

            <h2 className="text-lg font-semibold text-gray-900">
              Category Image
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Image URL
                </label>

                <input
                  name="url"
                  type="url"
                  value={formData.image.url}
                  onChange={onImageChange}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Public ID
                </label>

                <input
                  name="publicId"
                  value={formData.image.publicId}
                  onChange={onImageChange}
                  placeholder="category/electronics"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

            </div>

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
                    e.currentTarget.style.display =
                      "none";
                  }}
                />

              </div>
            )}

          </div>

          {/* ACTIONS */}

          <div className="flex flex-col-reverse gap-3 bg-gray-50 p-6 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={onCancel}
              disabled={updateLoading}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={updateLoading}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updateLoading ? (
                <span className="flex items-center gap-2">

                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />

                  Saving...

                </span>
              ) : (
                "Save Changes"
              )}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};


/* =========================================================
   INFO CARD
========================================================= */

const InfoCard = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-gray-900">
        {value}
      </p>

    </div>
  );
};

export default CategoryDetails;