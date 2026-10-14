import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import {
  updateUserApi,
  uploadUserImageApi,
} from "../../api/userApi";

// ========================================
// UPDATE USER
// ========================================

export const updateUser = createAsyncThunk(
  "user/updateUser",

  async (userData, { rejectWithValue }) => {
    try {
      const response = await updateUserApi(userData);

      console.log(
        "UPDATE USER RESPONSE:",
        response
      );

      return response;

    } catch (error) {
      console.log(
        "UPDATE USER ERROR:",
        error.response?.data
      );

      return rejectWithValue(
        error.response?.data || {
          success: false,
          message: "Failed to update user",
        }
      );
    }
  }
);


// ========================================
// UPLOAD USER IMAGE
// ========================================

export const uploadUserImage = createAsyncThunk(
  "user/uploadImage",

  async (formData, { rejectWithValue }) => {
    try {
      const response =
        await uploadUserImageApi(formData);

      console.log(
        "UPLOAD IMAGE RESPONSE:",
        response
      );

      return response;

    } catch (error) {
      console.log(
        "UPLOAD IMAGE ERROR:",
        error.response?.data
      );

      return rejectWithValue(
        error.response?.data || {
          success: false,
          message: "Failed to upload image",
        }
      );
    }
  }
);


// ========================================
// INITIAL STATE
// ========================================

const initialState = {
  user: null,

  loading: false,

  imageLoading: false,

  error: null,

  successMessage: null,
};


// ========================================
// SLICE
// ========================================

const userSlice = createSlice({

  name: "user",

  initialState,

  reducers: {

    // ====================================
    // SET USER
    // ====================================

    setUser: (state, action) => {
      state.user = action.payload;
    },


    // ====================================
    // CLEAR ERROR
    // ====================================

    clearUserError: (state) => {
      state.error = null;
    },


    // ====================================
    // CLEAR SUCCESS
    // ====================================

    clearUserSuccess: (state) => {
      state.successMessage = null;
    },


    // ====================================
    // CLEAR USER
    // ====================================

    clearUser: (state) => {

      state.user = null;

      state.loading = false;

      state.imageLoading = false;

      state.error = null;

      state.successMessage = null;
    },
  },


  // ======================================
  // EXTRA REDUCERS
  // ======================================

  extraReducers: (builder) => {

    builder

      // ==================================
      // UPDATE USER
      // ==================================

      .addCase(
        updateUser.pending,
        (state) => {

          state.loading = true;

          state.error = null;

          state.successMessage = null;
        }
      )


      .addCase(
        updateUser.fulfilled,
        (state, action) => {

          state.loading = false;

          state.error = null;

          state.successMessage =
            action.payload?.message ||
            "User updated successfully";


          if (action.payload?.user) {

            state.user =
              action.payload.user;

            localStorage.setItem(
              "user",
              JSON.stringify(
                action.payload.user
              )
            );
          }
        }
      )


      .addCase(
        updateUser.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload || {
              success: false,
              message: "Failed to update user",
            };
        }
      )


      // ==================================
      // UPLOAD IMAGE
      // ==================================

      .addCase(
        uploadUserImage.pending,
        (state) => {

          state.imageLoading = true;

          state.error = null;

          state.successMessage = null;
        }
      )


      .addCase(
        uploadUserImage.fulfilled,
        (state, action) => {

          state.imageLoading = false;

          state.error = null;

          state.successMessage =
            action.payload?.message ||
            "Image uploaded successfully";


          if (action.payload?.user) {

            state.user =
              action.payload.user;

            localStorage.setItem(
              "user",
              JSON.stringify(
                action.payload.user
              )
            );
          }
        }
      )


      .addCase(
        uploadUserImage.rejected,
        (state, action) => {

          state.imageLoading = false;

          state.error =
            action.payload || {
              success: false,
              message: "Failed to upload image",
            };
        }
      );
  },
});


// ========================================
// ACTIONS
// ========================================

export const {
  setUser,
  clearUserError,
  clearUserSuccess,
  clearUser,
} = userSlice.actions;


// ========================================
// SELECTORS
// ========================================

export const selectUser =
  (state) => state.user.user;

export const selectUserLoading =
  (state) => state.user.loading;

export const selectImageLoading =
  (state) => state.user.imageLoading;

export const selectUserError =
  (state) => state.user.error;

export const selectUserSuccess =
  (state) => state.user.successMessage;


// ========================================
// REDUCER
// ========================================

export default userSlice.reducer;
