import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getUserOrdersForComplaintApi,
  createComplaintApi,
  getMyComplaintsApi,
  getComplaintByIdApi,
  addComplaintMessageApi,
  closeComplaintApi,
  getAdminComplaintsApi,
  getAdminComplaintByIdApi,
  adminUpdateComplaintStatusApi,
  adminUpdateComplaintPriorityApi,
  adminAddComplaintMessageApi,
  adminAddInternalNoteApi,
} from "../../api/complaintApi";

// ==========================================
// ASYNC THUNKS - CUSTOMER
// ==========================================

export const getUserOrdersForComplaint = createAsyncThunk(
  "complaint/getUserOrders",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getUserOrdersForComplaintApi();
      return res.data?.orders || [];
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to load your orders"
      );
    }
  }
);

export const createComplaint = createAsyncThunk(
  "complaint/create",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await createComplaintApi(formData);
      return res.data?.complaint || res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to submit complaint"
      );
    }
  }
);

export const getMyComplaints = createAsyncThunk(
  "complaint/getMyComplaints",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await getMyComplaintsApi(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch complaints"
      );
    }
  }
);

export const getComplaintById = createAsyncThunk(
  "complaint/getById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await getComplaintByIdApi(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to load complaint details"
      );
    }
  }
);

export const addComplaintMessage = createAsyncThunk(
  "complaint/addMessage",
  async ({ id, formData, isAdmin = false }, { rejectWithValue }) => {
    try {
      const res = isAdmin
        ? await adminAddComplaintMessageApi(id, formData)
        : await addComplaintMessageApi(id, formData);
      return res.data?.message || res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to send message"
      );
    }
  }
);

export const closeComplaint = createAsyncThunk(
  "complaint/close",
  async ({ id, note }, { rejectWithValue }) => {
    try {
      const res = await closeComplaintApi(id, { note });
      return res.data?.complaint || res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to close complaint"
      );
    }
  }
);

// ==========================================
// ASYNC THUNKS - ADMIN
// ==========================================

export const getAdminComplaints = createAsyncThunk(
  "complaint/getAdminComplaints",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await getAdminComplaintsApi(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch admin complaints"
      );
    }
  }
);

export const getAdminComplaintById = createAsyncThunk(
  "complaint/getAdminById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await getAdminComplaintByIdApi(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to load admin complaint details"
      );
    }
  }
);

export const adminUpdateComplaintStatus = createAsyncThunk(
  "complaint/adminUpdateStatus",
  async ({ id, status, note }, { rejectWithValue }) => {
    try {
      const res = await adminUpdateComplaintStatusApi(id, { status, note });
      return res.data?.complaint || res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to update complaint status"
      );
    }
  }
);

export const adminUpdateComplaintPriority = createAsyncThunk(
  "complaint/adminUpdatePriority",
  async ({ id, priority }, { rejectWithValue }) => {
    try {
      const res = await adminUpdateComplaintPriorityApi(id, { priority });
      return res.data?.complaint || res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to update complaint priority"
      );
    }
  }
);

export const adminAddInternalNote = createAsyncThunk(
  "complaint/adminAddInternalNote",
  async ({ id, note }, { rejectWithValue }) => {
    try {
      const res = await adminAddInternalNoteApi(id, { note });
      return res.data?.internalNotes || res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to add internal note"
      );
    }
  }
);

// ==========================================
// SLICE
// ==========================================

const initialState = {
  complaints: [],
  pagination: {
    totalComplaints: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
  currentComplaint: null,
  messages: [],
  userOrders: [],
  adminStats: {
    totalComplaints: 0,
    openCount: 0,
    inProgressCount: 0,
    resolvedCount: 0,
    closedCount: 0,
  },
  loading: false,
  actionLoading: false,
  error: null,
};

const complaintSlice = createSlice({
  name: "complaint",
  initialState,
  reducers: {
    clearComplaintError: (state) => {
      state.error = null;
    },
    clearCurrentComplaint: (state) => {
      state.currentComplaint = null;
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // User orders
      .addCase(getUserOrdersForComplaint.fulfilled, (state, action) => {
        state.userOrders = action.payload;
      })

      // Create complaint
      .addCase(createComplaint.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createComplaint.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.complaints.unshift(action.payload);
      })
      .addCase(createComplaint.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Get my complaints
      .addCase(getMyComplaints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyComplaints.fulfilled, (state, action) => {
        state.loading = false;
        state.complaints = action.payload?.complaints || [];
        state.pagination = action.payload?.pagination || state.pagination;
      })
      .addCase(getMyComplaints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get complaint by ID
      .addCase(getComplaintById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getComplaintById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentComplaint = action.payload?.complaint || null;
        state.messages = action.payload?.messages || [];
      })
      .addCase(getComplaintById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add message
      .addCase(addComplaintMessage.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(addComplaintMessage.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (action.payload) {
          state.messages.push(action.payload);
        }
      })
      .addCase(addComplaintMessage.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Close complaint
      .addCase(closeComplaint.fulfilled, (state, action) => {
        state.currentComplaint = action.payload;
        const idx = state.complaints.findIndex((c) => c._id === action.payload?._id);
        if (idx !== -1) {
          state.complaints[idx] = action.payload;
        }
      })

      // Admin get complaints
      .addCase(getAdminComplaints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdminComplaints.fulfilled, (state, action) => {
        state.loading = false;
        state.complaints = action.payload?.complaints || [];
        state.pagination = action.payload?.pagination || state.pagination;
        state.adminStats = action.payload?.stats || state.adminStats;
      })
      .addCase(getAdminComplaints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Admin get by ID
      .addCase(getAdminComplaintById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdminComplaintById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentComplaint = action.payload?.complaint || null;
        state.messages = action.payload?.messages || [];
      })
      .addCase(getAdminComplaintById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Admin update status
      .addCase(adminUpdateComplaintStatus.fulfilled, (state, action) => {
        state.currentComplaint = action.payload;
        const idx = state.complaints.findIndex((c) => c._id === action.payload?._id);
        if (idx !== -1) {
          state.complaints[idx] = action.payload;
        }
      })

      // Admin update priority
      .addCase(adminUpdateComplaintPriority.fulfilled, (state, action) => {
        state.currentComplaint = action.payload;
        const idx = state.complaints.findIndex((c) => c._id === action.payload?._id);
        if (idx !== -1) {
          state.complaints[idx] = action.payload;
        }
      })

      // Admin add internal note
      .addCase(adminAddInternalNote.fulfilled, (state, action) => {
        if (state.currentComplaint) {
          state.currentComplaint.internalNotes = action.payload;
        }
      });
  },
});

export const { clearComplaintError, clearCurrentComplaint } = complaintSlice.actions;
export default complaintSlice.reducer;
