import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as orderService from '../../services/orderService';

// Async thunks
export const createOrder = createAsyncThunk(
    'order/createOrder',
    async (orderData, { rejectWithValue }) => {
        try {
            const response = await orderService.createOrder(orderData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tạo đơn hàng');
        }
    }
);

export const fetchMyOrders = createAsyncThunk(
    'order/fetchMyOrders',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await orderService.getMyOrders(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tải đơn hàng');
        }
    }
);

export const fetchOrderById = createAsyncThunk(
    'order/fetchOrderById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await orderService.getOrderById(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không tìm thấy đơn hàng');
        }
    }
);

export const cancelOrder = createAsyncThunk(
    'order/cancelOrder',
    async ({ orderId, reason }, { rejectWithValue }) => {
        try {
            const response = await orderService.cancelOrder(orderId, reason);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể hủy đơn hàng');
        }
    }
);

// Admin thunks
export const fetchAllOrders = createAsyncThunk(
    'order/fetchAllOrders',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await orderService.getAllOrders(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tải đơn hàng');
        }
    }
);

export const fetchOrderDetail = createAsyncThunk(
    'order/fetchOrderDetail',
    async (id, { rejectWithValue }) => {
        try {
            const response = await orderService.getOrderDetail(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không tìm thấy đơn hàng');
        }
    }
);

export const updateOrderStatus = createAsyncThunk(
    'order/updateOrderStatus',
    async ({ orderId, status, note }, { rejectWithValue }) => {
        try {
            const response = await orderService.updateOrderStatus(orderId, status, note);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật trạng thái');
        }
    }
);

const initialState = {
    // User orders
    myOrders: [],
    myOrdersTotal: 0,
    myOrdersPage: 1,
    myOrdersTotalPages: 0,

    // Admin orders
    allOrders: [],
    allOrdersTotal: 0,
    allOrdersPage: 1,
    allOrdersTotalPages: 0,
    orderStats: {},

    // Current order
    currentOrder: null,
    createdOrder: null,

    loading: false,
    error: null,
    success: null,
};

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        resetOrderState: () => initialState,
        clearOrderSuccess: (state) => {
            state.success = null;
            state.createdOrder = null;
        },
        clearOrderError: (state) => {
            state.error = null;
        },
        clearCreatedOrder: (state) => {
            state.createdOrder = null;
        },
        clearCurrentOrder: (state) => {
            state.currentOrder = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Create order
            .addCase(createOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.createdOrder = action.payload;
                state.success = 'Đặt hàng thành công!';
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch my orders
            .addCase(fetchMyOrders.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMyOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.myOrders = action.payload.data;
                state.myOrdersTotal = action.payload.total;
                state.myOrdersPage = action.payload.page;
                state.myOrdersTotalPages = action.payload.totalPages;
            })
            .addCase(fetchMyOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch order by ID
            .addCase(fetchOrderById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchOrderById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload;
            })
            .addCase(fetchOrderById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Cancel order
            .addCase(cancelOrder.pending, (state) => {
                state.loading = true;
            })
            .addCase(cancelOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload;
                state.success = 'Đã hủy đơn hàng';
                // Update in list
                const idx = state.myOrders.findIndex((o) => o._id === action.payload._id);
                if (idx >= 0) state.myOrders[idx] = action.payload;
            })
            .addCase(cancelOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Admin: Fetch all orders
            .addCase(fetchAllOrders.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAllOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.allOrders = action.payload.data;
                state.allOrdersTotal = action.payload.total;
                state.allOrdersPage = action.payload.page;
                state.allOrdersTotalPages = action.payload.totalPages;
                state.orderStats = action.payload.stats || {};
            })
            .addCase(fetchAllOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Admin: Fetch order detail
            .addCase(fetchOrderDetail.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchOrderDetail.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload;
            })
            .addCase(fetchOrderDetail.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Admin: Update order status
            .addCase(updateOrderStatus.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload;
                state.success = 'Cập nhật trạng thái thành công';
                // Update in list
                const idx = state.allOrders.findIndex((o) => o._id === action.payload._id);
                if (idx >= 0) state.allOrders[idx] = action.payload;
            })
            .addCase(updateOrderStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { resetOrderState, clearOrderSuccess, clearOrderError, clearCreatedOrder, clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
