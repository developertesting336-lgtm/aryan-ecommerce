import React, {
  useState,
  useEffect,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  useNavigate,
} from "react-router-dom";

import {
  loginUser,
} from "../redux/slices/authSlice";

import {
  showSuccess,
  showError,
} from "../utils/toast";


export default function LoginPage() {

  const dispatch = useDispatch();

  const navigate = useNavigate();


  // ======================================
  // REDUX STATE
  // ======================================

  const {
    loading,
    error,
    user,
  } = useSelector(
    (state) => state.auth
  );


  console.log(
    "AUTH ERROR STATE:",
    error
  );

  console.log(
    "AUTH USER STATE:",
    user
  );


  // ======================================
  // FORM STATE
  // ======================================

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
    });


  // ======================================
  // INPUT CHANGE
  // ======================================

  const handleChange = (e) => {

    setFormData({
      ...formData,

      [e.target.name]:
        e.target.value,
    });
  };


  // ======================================
  // LOGIN SUBMIT
  // ======================================

  const handleSubmit = async (e) => {

    e.preventDefault();


    console.log(
      "Logging in with:",
      formData
    );


    try {

      const res = await dispatch(
        loginUser(formData)
      ).unwrap();


      console.log(
        "LOGIN SUCCESS:",
        res
      );


      showSuccess(
        res?.message ||
        "Login successful"
      );


    } catch (err) {

      console.log(
        "LOGIN FAILED:",
        err
      );


      // Backend:
      //
      // {
      //   success: false,
      //   message: "User not found"
      // }
      //
      // OR
      //
      // {
      //   success: false,
      //   message: "Validation failed",
      //   errors: [...]
      // }


      showError(
        err?.message ||
        "Login failed"
      );
    }
  };


  // ======================================
  // NAVIGATION AFTER LOGIN
  // ======================================

  useEffect(() => {

    if (!user) {
      return;
    }


    if (user.role === "user") {

      navigate("/");

    } else if (
      user.role === "admin"
    ) {

      navigate("/admin/dashboard");

    } else if (
      user.role === "vendor"
    ) {

      navigate("/vendor/dashboard");
    }

  }, [
    user,
    navigate,
  ]);


  // ======================================
  // RENDER
  // ======================================

  return (

    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">

      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">


        {/* =================================
            TITLE
        ================================= */}

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">

          Welcome Back

        </h2>


        {/* =================================
            FORM
        ================================= */}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >


          {/* ================================
              EMAIL
          ================================= */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">

              Email Address

            </label>


            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />

          </div>


          {/* ================================
              PASSWORD
          ================================= */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">

              Password

            </label>


            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />

          </div>


          {/* ================================
              ERROR MESSAGE
          ================================= */}

          {error && (

            <div className="rounded-lg bg-red-100 border border-red-400 text-red-700 px-4 py-3">


              {/* ============================
                  CASE 1:
                  errors is an array
                  
                  Example:
                  errors: [
                    {
                      field: "email",
                      message: "Please enter a valid email"
                    }
                  ]
              ============================ */}

              {Array.isArray(error?.errors) ? (

                error.errors.map(
                  (err, index) => (

                    <p
                      key={index}
                      className="text-sm mb-1"
                    >

                      {err?.field &&
                        err.field !== "general" && (
                          <strong>
                            {err.field}:{" "}
                          </strong>
                        )}

                      {err?.message ||
                        "Invalid input"}

                    </p>
                  )
                )

              ) : (

                /* =========================
                   CASE 2:
                   No errors array

                   Example:
                   message: "User not found"
                ========================= */

                <p className="text-sm">

                  {error?.message ||
                    "Login failed"}

                </p>

              )}

            </div>

          )}


          {/* ================================
              LOGIN BUTTON
          ================================= */}

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-medium py-2 rounded-lg transition duration-200 mt-2 ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >

            {loading
              ? "Signing In..."
              : "Sign In"}

          </button>


        </form>


        {/* =================================
            REGISTER LINK
        ================================= */}

        <div className="text-center mt-6">

          <p className="text-sm text-gray-600">

            Don't have an account?{" "}

            <a
              href="/register"
              className="text-blue-600 hover:underline font-medium"
            >

              Register

            </a>

          </p>

        </div>


      </div>

    </div>
  );
}
