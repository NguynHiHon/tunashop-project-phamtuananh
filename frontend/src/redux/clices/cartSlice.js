import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as cartService from '../../services/cartService';

// Async thunks
export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async (_, { rejectWithValue }) => {
        try {
            const response = await cartService.getCart();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tải giỏ hàng');
        }
    }
);

export const fetchCartCount = createAsyncThunk(
    'cart/fetchCartCount',
    async (_, { rejectWithValue }) => {
        try {
            const response = await cartService.getCartCount();
            return response.data.count;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi');
        }
    }
);

export const addToCart = createAsyncThunk(
    'cart/addToCart',
    async ({ productId, quantity = 1, variantId = null }, { rejectWithValue }) => {
        try {
            const response = await cartService.addToCart(productId, quantity, variantId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể thêm vào giỏ hàng');
        }
    }
);

export const updateCartItem = createAsyncThunk(
    'cart/updateCartItem',
    async ({ productId, quantity, variantId = null }, { rejectWithValue }) => {
        try {
            const response = await cartService.updateCartItem(productId, quantity, variantId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật giỏ hàng');
        }
    }
);

export const removeFromCart = createAsyncThunk(
    'cart/removeFromCart',
    async ({ productId, variantId = null }, { rejectWithValue }) => {
        try {
            const response = await cartService.removeFromCart(productId, variantId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể xóa khỏi giỏ hàng');
        }
    }
);

export const clearCart = createAsyncThunk(
    'cart/clearCart',
    async (_, { rejectWithValue }) => {
        try {
            const response = await cartService.clearCart();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể xóa giỏ hàng');
        }
    }
);

const initialState = {
    items: [],
    totalItems: 0,
    subtotal: 0,
    shippingFee: 0,
    total: 0,
    freeShippingThreshold: 500000,
    amountToFreeShipping: 0,
    loading: false,
    error: null,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        resetCart: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            // Fetch cart
            .addCase(fetchCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false;
                Object.assign(state, action.payload);
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch cart count
            .addCase(fetchCartCount.fulfilled, (state, action) => {
                state.totalItems = action.payload;
            })
            // Add to cart
            .addCase(addToCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addToCart.fulfilled, (state, action) => {
                state.loading = false;
                Object.assign(state, action.payload);
            })
            .addCase(addToCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update cart item
            .addCase(updateCartItem.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateCartItem.fulfilled, (state, action) => {
                state.loading = false;
                Object.assign(state, action.payload);
            })
            .addCase(updateCartItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Remove from cart
            .addCase(removeFromCart.pending, (state) => {
                state.loading = true;
            })
            .addCase(removeFromCart.fulfilled, (state, action) => {
                state.loading = false;
                Object.assign(state, action.payload);
            })
            .addCase(removeFromCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Clear cart
            .addCase(clearCart.fulfilled, (state) => {
                Object.assign(state, initialState);
            });
    },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;
