import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  registerApi,
  loginApi,
  getUserByIdApi,
} from "../../api/authApi";


// ========================================
// REGISTER USER
// ========================================

export const registerUser = createAsyncThunk(
  "auth/register",

  async (userData, { rejectWithValue }) => {
    try {
      const response = await registerApi(userData);

      return response.data;

    } catch (error) {
      console.log(
        "REGISTER API ERROR:",
        error.response?.data
      );

      return rejectWithValue(
        error.response?.data || {
          success: false,
          message: "Registration failed",
        }
      );
    }
  }
);


// ========================================
// LOGIN USER
// ========================================

export const loginUser = createAsyncThunk(
  "auth/login",

  async (userData, { rejectWithValue }) => {
    try {
      const response = await loginApi(userData);

      console.log(
        "LOGIN API RESPONSE:",
        response.data
      );


      // Save token
      if (response.data?.token) {
        localStorage.setItem(
          "token",
          response.data.token
        );
      }


      // Save user
      if (response.data?.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );
      }


      return response.data;

    } catch (error) {
      console.log(
        "LOGIN API ERROR:",
        error.response?.data
      );

      return rejectWithValue(
        error.response?.data || {
          success: false,
          message: "Login failed",
        }
      );
    }
  }
);


// ========================================
// GET USER BY ID
// ========================================

export const getUserById = createAsyncThunk(
  "auth/getUser",

  async (id, { rejectWithValue }) => {
    try {
      const response = await getUserByIdApi(id);

      return response.data;

    } catch (error) {
      console.log(
        "GET USER API ERROR:",
        error.response?.data
      );

      return rejectWithValue(
        error.response?.data || {
          success: false,
          message: "Failed to get user",
        }
      );
    }
  }
);


// ========================================
// LOCAL STORAGE
// ========================================

let savedUser = null;

try {
  savedUser = JSON.parse(
    localStorage.getItem("user")
  );
} catch (error) {
  savedUser = null;
}

const savedToken =
  localStorage.getItem("token");


// ========================================
// INITIAL STATE
// ========================================

const initialState = {
  user: savedUser || null,

  token: savedToken || null,

  loading: false,

  // IMPORTANT:
  // error is always an object or null
  error: null,

  authChecked: false,
};


// ========================================
// SLICE
// ========================================

const authSlice = createSlice({

  name: "auth",

  initialState,

  reducers: {

    // ====================================
    // LOGOUT
    // ====================================

    logout: (state) => {

      state.user = null;

      state.token = null;

      state.error = null;

      state.loading = false;

      localStorage.removeItem("token");

      localStorage.removeItem("user");
    },


    // ====================================
    // CLEAR ERROR
    // ====================================

    clearError: (state) => {

      state.error = null;
    },
  },


  // ======================================
  // EXTRA REDUCERS
  // ======================================

  extraReducers: (builder) => {

    builder


      // ==================================
      // REGISTER
      // ==================================

      .addCase(
        registerUser.pending,
        (state) => {

          state.loading = true;

          state.error = null;
        }
      )


      .addCase(
        registerUser.fulfilled,
        (state, action) => {

          state.loading = false;

          state.error = null;

          if (action.payload?.user) {

            state.user =
              action.payload.user;
          }

          if (action.payload?.token) {

            state.token =
              action.payload.token;
          }
        }
      )


      .addCase(
        registerUser.rejected,
        (state, action) => {

          state.loading = false;

          // Keep complete backend response
          state.error =
            action.payload || {
              success: false,
              message: "Registration failed",
            };
        }
      )


      // ==================================
      // LOGIN
      // ==================================

      .addCase(
        loginUser.pending,
        (state) => {

          state.loading = true;

          state.error = null;
        }
      )


      .addCase(
        loginUser.fulfilled,
        (state, action) => {

          state.loading = false;

          state.error = null;


          if (action.payload?.user) {

            state.user =
              action.payload.user;
          }


          if (action.payload?.token) {

            state.token =
              action.payload.token;
          }
        }
      )


      .addCase(
        loginUser.rejected,
        (state, action) => {

          state.loading = false;

          // IMPORTANT:
          // Store complete backend error
          state.error =
            action.payload || {
              success: false,
              message: "Login failed",
            };
        }
      )


      // ==================================
      // GET USER
      // ==================================

      .addCase(
        getUserById.pending,
        (state) => {

          state.loading = true;

          state.error = null;
        }
      )


      .addCase(
        getUserById.fulfilled,
        (state, action) => {

          state.loading = false;

          state.error = null;

          state.user = action.payload;
        }
      )


      .addCase(
        getUserById.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload || {
              success: false,
              message: "Failed to get user",
            };
        }
      );
  },
});


// ========================================
// ACTIONS
// ========================================

export const {
  logout,
  clearError,
} = authSlice.actions;


// ========================================
// REDUCER
// ========================================

export default authSlice.reducer;

