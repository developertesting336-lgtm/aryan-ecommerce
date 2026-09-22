
import React, { useState } from "react";

import {
  registerUser,
} from "../redux/slices/authSlice";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  useNavigate,
} from "react-router-dom";

import {
  showSuccess,
  showError,
} from "../utils/toast";


export default function RegisterPage() {

  const dispatch = useDispatch();

  const navigate = useNavigate();


  // ======================================
  // REDUX STATE
  // ======================================

  const {
    loading,
    error,
  } = useSelector(
    (state) => state.auth
  );


  console.log(
    "REGISTER ERROR STATE:",
    error
  );


  // ======================================
  // FORM STATE
  // ======================================

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "user",
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
  // SUBMIT
  // ======================================

  const handleSubmit = async (e) => {

    e.preventDefault();


    console.log(
      "Registering with:",
      formData
    );


    try {

      const response = await dispatch(
        registerUser(formData)
      ).unwrap();


      console.log(
        "REGISTER SUCCESS:",
        response
      );


      showSuccess(
        response?.message ||
        "Registration successful"
      );


      // Go to login after successful registration
      navigate("/login");


    } catch (err) {

      console.log(
        "REGISTER FAILED:",
        err
      );


      // err is the complete backend response
      //
      // Example:
      //
      // {
      //   success: false,
      //   message: "Validation failed",
      //   errors: [...]
      // }
      //
      // OR:
      //
      // {
      //   success: false,
      //   message: "Email already exists"
      // }


      showError(
        err?.message ||
        "Registration failed"
      );
    }
  };


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

          Create Account

        </h2>


        {/* =================================
            FORM
        ================================= */}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >


          {/* ================================
              FIRST NAME / LAST NAME
          ================================= */}

          <div className="grid grid-cols-2 gap-4">


            {/* FIRST NAME */}

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1">

                First Name

              </label>


              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John"
              />

            </div>


            {/* LAST NAME */}

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1">

                Last Name

              </label>


              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Doe"
              />

            </div>

          </div>


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
              ACCOUNT TYPE
          ================================= */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">

              Account Type

            </label>


            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            >

              <option value="user">
                User
              </option>

              <option value="vendor">
                Vendor
              </option>

            </select>

          </div>


          {/* ================================
              ERROR MESSAGE
          ================================= */}

          {error && (

            <div className="rounded-lg bg-red-100 border border-red-400 text-red-700 px-4 py-3">


              {/* ============================
                  VALIDATION ERRORS
                  
                  Example:
                  
                  {
                    message: "Validation failed",
                    errors: [
                      {
                        field: "email",
                        message: "Please enter a valid email"
                      }
                    ]
                  }
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
                   GENERAL ERROR

                   Example:

                   {
                     message: "Email already exists"
                   }
                ========================= */

                <p className="text-sm">

                  {error?.message ||
                    "Registration failed"}

                </p>

              )}

            </div>

          )}


          {/* ================================
              SUBMIT BUTTON
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
              ? "Creating Account..."
              : "Sign Up"}

          </button>


        </form>


        {/* =================================
            LOGIN LINK
        ================================= */}

        <div className="text-center mt-6">

          <p className="text-sm text-gray-600">

            Already have an account?{" "}

            <a
              href="/login"
              className="text-blue-600 hover:underline font-medium"
            >

              Login

            </a>

          </p>

        </div>


      </div>

    </div>
  );
}

