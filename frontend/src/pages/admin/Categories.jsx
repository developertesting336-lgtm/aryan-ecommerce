import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import StatCard from "../../components/admin/StatCard";
import {
  getCategories,
  deleteCategory,
  clearCategoryError,
  clearCategoryMessage,
  getStatsData,
} from "../../redux/slices/categorySlice";

import {
  LayoutGrid,
  Layers,
  GitBranch,
  CircleCheck
} from "lucide-react";

const Categories = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
const stats = useSelector((state)=> state.category.stats)
console.log("stsats cat",stats)
  const {
    categories,
    pagination,
    loading,
    deleteLoading,
    error,
    message,
  } = useSelector((state) => state.category);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
console.log("catpro",categories)
  /* =========================================================
     FETCH CATEGORIES
  ========================================================= */

  useEffect(() => {
    dispatch(
      getCategories({
        page,
        limit: 10,
        ...(search && { search }),
        ...(status && { isActive: status }),
      })
    );
    dispatch(getStatsData())
  }, [dispatch, page, search, status]);

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
     DELETE
  ========================================================= */

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (!confirmed) return;

    dispatch(deleteCategory(category._id));
  };

  /* =========================================================
     SEARCH
  ========================================================= */

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  /* =========================================================
     STATUS FILTER
  ========================================================= */

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#f5faf7] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Categories
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your product categories and subcategories.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/create-category")}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            + Create Category
          </button>
        </div>

        {/* =====================================================
            SUCCESS MESSAGE
        ===================================================== */}

        {message && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {/* =====================================================
            ERROR MESSAGE
        ===================================================== */}

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

  {/* Stats */}
         <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            title="Total Categories"
            value={stats.totalCategories}
            icon={<LayoutGrid/>}
          />

          <StatCard
            title="Parent Categories"
            value={stats.parentCategories}
            icon={<Layers/>}
          />

          <StatCard
            title="Sub Categories"
            value={stats.subCategories}
            icon={<GitBranch/>}
          />

          <StatCard
            title="Active Categories"
            value={stats.activeCategories}
            icon={<CircleCheck/>}
          />

        </div> 

        {/* =====================================================
            FILTERS
        ===================================================== */}

        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            {/* SEARCH */}

            <div className="md:col-span-2">
              <label
                htmlFor="search"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Search
              </label>

              <input
                id="search"
                type="text"
                value={search}
                onChange={handleSearch}
                placeholder="Search categories..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* STATUS */}

            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Status
              </label>

              <select
                id="status"
                value={status}
                onChange={handleStatusChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All Categories</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* =====================================================
            CATEGORY TABLE
        ===================================================== */}

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-3 text-gray-600">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                Loading categories...
              </div>
            </div>
          ) : categories.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 text-5xl">
                📁
              </div>

              <h3 className="text-lg font-semibold text-gray-900">
                No categories found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Create your first category to get started.
              </p>

              <button
                type="button"
                onClick={() => navigate("/create-category")}
                className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Create Category
              </button>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200 text-left">
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Category
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Parent
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Level
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Order
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {categories.map((category) => (
                      <tr
                        key={category._id}
                        className="transition hover:bg-gray-50"
                      >
                        {/* CATEGORY */}

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">

                            {category.image?.url ? (
                              <img
                                src={category.image.url}
                                alt={category.name}
                                className="h-11 w-11 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-lg">
                                📁
                              </div>
                            )}

                            <div>
                              <p className="font-medium text-gray-900">
                                {"— ".repeat(category.level || 0)}
                                {category.name}
                              </p>

                              <p className="text-xs text-gray-500">
                                /{category.slug}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* PARENT */}

                        <td className="px-6 py-4">
                          {category.parent ? (
                            <span className="text-sm text-gray-700">
                              {category.parent.name}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">
                              Root Category
                            </span>
                          )}
                        </td>

                        {/* LEVEL */}

                        <td className="px-6 py-4">
                          <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                            Level {category.level || 0}
                          </span>
                        </td>

                        {/* SORT ORDER */}

                        <td className="px-6 py-4 text-sm text-gray-700">
                          {category.sortOrder || 0}
                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-4">
                          {category.isActive ? (
                            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                              Inactive
                            </span>
                          )}
                        </td>

                        {/* ACTIONS */}

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/categories/${category._id}`
                                )
                              }
                              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                            >
                              View
                            </button>

                            {/* <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/categories/${category._id}/edit`
                                )
                              }
                              className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                            >
                              Edit
                            </button> */}

                            <button
                              type="button"
                              disabled={deleteLoading}
                              onClick={() =>
                                handleDelete(category)
                              }
                              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS */}

              <div className="divide-y divide-gray-100 md:hidden">
                {categories.map((category) => (
                  <div
                    key={category._id}
                    className="p-4"
                  >
                    <div className="flex items-start gap-3">

                      {category.image?.url ? (
                        <img
                          src={category.image.url}
                          alt={category.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                          📁
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {category.name}
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          /{category.slug}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                            Level {category.level || 0}
                          </span>

                          {category.isActive ? (
                            <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs text-green-700">
                              Active
                            </span>
                          ) : (
                            <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs text-red-700">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/categories/${category._id}`
                          )
                        }
                        className="flex-1 rounded-lg border border-gray-300 py-2 text-xs font-medium text-gray-700"
                      >
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/categories/${category._id}/edit`
                          )
                        }
                        className="flex-1 rounded-lg bg-blue-50 py-2 text-xs font-medium text-blue-700"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={deleteLoading}
                        onClick={() =>
                          handleDelete(category)
                        }
                        className="flex-1 rounded-lg bg-red-50 py-2 text-xs font-medium text-red-700 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* =====================================================
            PAGINATION
        ===================================================== */}

        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm">

            <p className="text-sm text-gray-500">
              Page{" "}
              <span className="font-medium text-gray-900">
                {pagination.page}
              </span>{" "}
              of{" "}
              <span className="font-medium text-gray-900">
                {pagination.totalPages}
              </span>
            </p>

            <div className="flex gap-2">

              <button
                type="button"
                disabled={page <= 1}
                onClick={() =>
                  setPage((prev) => prev - 1)
                }
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={
                  page >= pagination.totalPages
                }
                onClick={() =>
                  setPage((prev) => prev + 1)
                }
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Categories;