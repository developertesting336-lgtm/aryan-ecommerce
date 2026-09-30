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

import {
  motion,
} from "motion/react";

import {
  User,
  Mail,
  Lock,
  Store,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";


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


      showError(
        err?.message ||
        "Registration failed"
      );
    }
  };


  // ======================================
  // ANIMATION
  // ======================================

  const containerVariants = {
    hidden: {
      opacity: 0,
      y: 25,
    },

    visible: {
      opacity: 1,
      y: 0,

      transition: {
        duration: 0.55,
        ease: "easeOut",
        staggerChildren: 0.07,
      },
    },
  };


  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 12,
    },

    visible: {
      opacity: 1,
      y: 0,

      transition: {
        duration: 0.35,
        ease: "easeOut",
      },
    },
  };


  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8 relative overflow-hidden">


      {/* =================================
          BACKGROUND DECORATIONS
      ================================= */}

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.7,
        }}

        animate={{
          opacity: 0.5,
          scale: 1,
        }}

        transition={{
          duration: 1,
        }}

        className="absolute -top-24 -left-24 w-72 h-72 bg-blue-200/40 rounded-full blur-3xl pointer-events-none"
      />


      <motion.div
        initial={{
          opacity: 0,
          scale: 0.7,
        }}

        animate={{
          opacity: 0.45,
          scale: 1,
        }}

        transition={{
          duration: 1.2,
          delay: 0.2,
        }}

        className="absolute -bottom-28 -right-20 w-80 h-80 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none"
      />


      {/* =================================
          MAIN CARD
      ================================= */}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"

        className="relative z-10 w-full max-w-5xl bg-white rounded-3xl shadow-[0_20px_70px_rgba(15,23,42,0.12)] border border-gray-100 overflow-hidden"
      >

        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">


          {/* =================================
              LEFT BRAND PANEL
          ================================= */}

          <motion.div
            variants={itemVariants}
            className="hidden lg:flex relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-10 xl:p-12 text-white flex-col justify-between overflow-hidden"
          >

            {/* Decorative circles */}

            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/10" />

            <div className="absolute -bottom-28 -left-24 w-72 h-72 rounded-full bg-white/10" />


            {/* Brand */}

            <div className="relative z-10">

              <motion.div
                initial={{
                  opacity: 0,
                  x: -15,
                }}

                animate={{
                  opacity: 1,
                  x: 0,
                }}

                transition={{
                  delay: 0.25,
                  duration: 0.4,
                }}

                className="flex items-center gap-3 mb-10"
              >

                <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">

                  <ShoppingBag
                    size={23}
                    strokeWidth={2.2}
                  />

                </div>

                <span className="text-xl font-bold tracking-tight">
                  NovaCart
                </span>

              </motion.div>


              <h1 className="text-3xl xl:text-4xl font-bold leading-tight mb-5">

                Start your shopping
                <br />

                journey today.

              </h1>


              <p className="text-blue-100 text-sm xl:text-base leading-7 max-w-sm">

                Create your account and enjoy a faster,
                easier and more personalized shopping
                experience.

              </p>


              {/* Benefits */}

              <div className="mt-10 space-y-5">

                {[
                  "Personalized shopping experience",
                  "Track your orders easily",
                  "Save products to your wishlist",
                ].map((item, index) => (

                  <motion.div
                    key={item}

                    initial={{
                      opacity: 0,
                      x: -10,
                    }}

                    animate={{
                      opacity: 1,
                      x: 0,
                    }}

                    transition={{
                      delay:
                        0.4 + index * 0.1,
                    }}

                    className="flex items-center gap-3"
                  >

                    <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center shrink-0">

                      <CheckCircle2
                        size={16}
                      />

                    </div>

                    <span className="text-sm text-blue-50">
                      {item}
                    </span>

                  </motion.div>

                ))}

              </div>

            </div>


            {/* Security */}

            <div className="relative z-10 flex items-center gap-3 pt-8">

              <ShieldCheck
                size={20}
                className="text-blue-100"
              />

              <span className="text-xs text-blue-100">
                Your account information is protected
              </span>

            </div>

          </motion.div>


          {/* =================================
              RIGHT FORM PANEL
          ================================= */}

          <div className="p-6 sm:p-9 lg:p-10 xl:p-12">


            {/* Mobile Logo */}

            <motion.div
              variants={itemVariants}
              className="flex lg:hidden items-center justify-center gap-2 mb-7"
            >

              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">

                <ShoppingBag
                  size={21}
                />

              </div>

              <span className="text-xl font-bold text-gray-900">
                NovaCart
              </span>

            </motion.div>


            {/* Heading */}

            <motion.div
              variants={itemVariants}
              className="mb-7"
            >

              <p className="text-sm font-semibold text-blue-600 mb-2">
                CREATE ACCOUNT
              </p>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">

                Create your account

              </h2>

              <p className="text-sm text-gray-500 mt-2">
                Join us and start shopping with ease.
              </p>

            </motion.div>


            {/* =================================
                FORM
            ================================= */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >


              {/* FIRST + LAST NAME */}

              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >

                {/* FIRST NAME */}

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name
                  </label>

                  <div className="relative">

                    <User
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />

                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John"

                      className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50/60 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />

                  </div>

                </div>


                {/* LAST NAME */}

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name
                  </label>

                  <div className="relative">

                    <User
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />

                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"

                      className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50/60 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />

                  </div>

                </div>

              </motion.div>


              {/* EMAIL */}

              <motion.div
                variants={itemVariants}
              >

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>

                <div className="relative">

                  <Mail
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"

                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50/60 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />

                </div>

              </motion.div>


              {/* PASSWORD */}

              <motion.div
                variants={itemVariants}
              >

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>

                <div className="relative">

                  <Lock
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />

                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"

                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50/60 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />

                </div>

              </motion.div>


              {/* ACCOUNT TYPE */}

              <motion.div
                variants={itemVariants}
              >

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Account Type
                </label>

                <div className="relative">

                  <Store
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
                  />

                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}

                    className="appearance-none w-full h-12 pl-11 pr-11 rounded-xl border border-gray-200 bg-gray-50/60 text-sm text-gray-700 outline-none cursor-pointer transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  >

                    <option value="user">
                      User
                    </option>

                    <option value="vendor">
                      Vendor
                    </option>

                  </select>

                  <ChevronDown
                    size={18}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />

                </div>

              </motion.div>


              {/* =================================
                  ERROR MESSAGE
              ================================= */}

              {error && (

                <motion.div
                  initial={{
                    opacity: 0,
                    height: 0,
                    y: -5,
                  }}

                  animate={{
                    opacity: 1,
                    height: "auto",
                    y: 0,
                  }}

                  transition={{
                    duration: 0.25,
                  }}

                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-red-700"
                >

                  <div className="flex items-start gap-3">

                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">

                      <span className="text-xs font-bold">
                        !
                      </span>

                    </div>

                    <div className="min-w-0">

                      {Array.isArray(error?.errors) ? (

                        error.errors.map(
                          (err, index) => (

                            <p
                              key={index}
                              className="text-sm mb-1 last:mb-0 leading-5"
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

                        <p className="text-sm leading-5">
                          {error?.message ||
                            "Registration failed"}
                        </p>

                      )}

                    </div>

                  </div>

                </motion.div>

              )}


              {/* =================================
                  SUBMIT BUTTON
              ================================= */}

              <motion.div
                variants={itemVariants}
                className="pt-1"
              >

                <motion.button
                  type="submit"
                  disabled={loading}

                  whileHover={
                    !loading
                      ? {
                          y: -1,
                        }
                      : {}
                  }

                  whileTap={
                    !loading
                      ? {
                          scale: 0.985,
                        }
                      : {}
                  }

                  className={`group relative overflow-hidden w-full h-12 rounded-xl text-white font-semibold text-sm shadow-lg transition-all duration-200 ${
                    loading
                      ? "bg-blue-400 cursor-not-allowed shadow-blue-200"
                      : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 hover:shadow-blue-600/30"
                  }`}
                >

                  {!loading && (

                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                  )}


                  <span className="relative flex items-center justify-center gap-2">

                    {loading ? (

                      <>
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />

                        Creating Account...
                      </>

                    ) : (

                      <>
                        Create Account

                        <ArrowRight
                          size={17}
                          className="transition-transform duration-200 group-hover:translate-x-1"
                        />
                      </>

                    )}

                  </span>

                </motion.button>

              </motion.div>


            </form>


            {/* =================================
                LOGIN
            ================================= */}

            <motion.div
              variants={itemVariants}
              className="text-center mt-7"
            >

              <p className="text-sm text-gray-500">

                Already have an account?{" "}

                <button
                  type="button"
                  onClick={() => navigate("/login")}

                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >

                  Login

                </button>

              </p>

            </motion.div>


            {/* Bottom security text */}

            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center gap-2 mt-6 pt-5 border-t border-gray-100"
            >

              <ShieldCheck
                size={15}
                className="text-gray-400"
              />

              <span className="text-xs text-gray-400">
                Secure account creation
              </span>

            </motion.div>

          </div>

        </div>

      </motion.div>

    </div>
  );
}
