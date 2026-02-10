import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as productService from '../../services/productService';

export const fetchProducts = createAsyncThunk('product/fetchProducts', async (_, { rejectWithValue }) => {
  try {
    return await productService.getProducts();
  } catch (err) {
    const payload = err.response?.data || (err.message ? { message: err.message } : { message: String(err) });
    return rejectWithValue(payload);
  }
});

export const fetchProduct = createAsyncThunk('product/fetchProduct', async (id, { rejectWithValue }) => {
  try {
    return await productService.getProduct(id);
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const createProduct = createAsyncThunk('product/createProduct', async (data, { rejectWithValue }) => {
  try {
    return await productService.createProduct(data);
  } catch (err) {
    const payload = err.response?.data || (err.details ? { message: err.message || 'Validation failed', details: err.details } : { message: err.message || err });
    return rejectWithValue(payload);
  }
});

export const updateProduct = createAsyncThunk('product/updateProduct', async ({ id, data }, { rejectWithValue }) => {
  try {
    return await productService.updateProduct(id, data);
  } catch (err) {
    const payload = err.response?.data || (err.details ? { message: err.message || 'Validation failed', details: err.details } : { message: err.message || err });
    return rejectWithValue(payload);
  }
});

export const updateProductSale = createAsyncThunk('product/updateProductSale', async ({ id, data }, { rejectWithValue }) => {
  try {
    return await productService.updateProductSale(id, data);
  } catch (err) {
    const payload = err.response?.data || (err.details ? { message: err.message || 'Validation failed', details: err.details } : { message: err.message || err });
    return rejectWithValue(payload);
  }
});

export const deleteProduct = createAsyncThunk('product/deleteProduct', async (id, { rejectWithValue }) => {
  try {
    return await productService.deleteProduct(id);
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

const productSlice = createSlice({
  name: 'product',
  initialState: {
    items: [],
    current: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrent(state) { state.current = null; },
    clearError(state) { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        if (Array.isArray(payload)) state.items = payload;
        else if (payload && Array.isArray(payload.data)) state.items = payload.data;
        else state.items = [];
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error; })

      .addCase(fetchProduct.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProduct.fulfilled, (state, action) => { state.loading = false; state.current = action.payload.data || action.payload; })
      .addCase(fetchProduct.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error; })

      .addCase(createProduct.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createProduct.fulfilled, (state, action) => { state.loading = false; const created = action.payload.data || action.payload; if (created) state.items.push(created); })
      .addCase(createProduct.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error; })

      .addCase(updateProduct.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateProduct.fulfilled, (state, action) => { state.loading = false; const updated = action.payload.data || action.payload; if (updated) state.items = state.items.map(i => i._id === updated._id ? updated : i); })
      .addCase(updateProduct.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error; })

      .addCase(updateProductSale.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateProductSale.fulfilled, (state, action) => { state.loading = false; const updated = action.payload.data || action.payload; if (updated) state.items = state.items.map(i => i._id === updated._id ? updated : i); })
      .addCase(updateProductSale.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error; })

      .addCase(deleteProduct.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteProduct.fulfilled, (state, action) => { state.loading = false; })
      .addCase(deleteProduct.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error; });
  }
});

export const { clearCurrent, clearError } = productSlice.actions;
export default productSlice.reducer;
