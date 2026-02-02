import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as categoryService from '../../services/categoryService';

// ============ ASYNC THUNKS ============

// Product Types
export const fetchProductTypes = createAsyncThunk(
    'category/fetchProductTypes',
    async ({ page = 1, perPage = 10, sortField = 'name', sortOrder = 'asc', search = '' }, { rejectWithValue }) => {
        try {
            return await categoryService.getProductTypes({ page, perPage, sortField, sortOrder, search });
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch product types');
        }
    }
);

export const fetchAllProductTypes = createAsyncThunk(
    'category/fetchAllProductTypes',
    async (_, { rejectWithValue }) => {
        try {
            return await categoryService.getAllProductTypes();
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch product types');
        }
    }
);

export const fetchProductType = createAsyncThunk(
    'category/fetchProductType',
    async (id, { rejectWithValue }) => {
        try {
            return await categoryService.getProductType(id);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch product type');
        }
    }
);

export const createProductType = createAsyncThunk(
    'category/createProductType',
    async (data, { rejectWithValue }) => {
        try {
            return await categoryService.createProductType(data);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create product type');
        }
    }
);

export const updateProductType = createAsyncThunk(
    'category/updateProductType',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            return await categoryService.updateProductType(id, data);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update product type');
        }
    }
);

export const deleteProductType = createAsyncThunk(
    'category/deleteProductType',
    async (id, { rejectWithValue }) => {
        try {
            await categoryService.deleteProductType(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete product type');
        }
    }
);

// Attributes
export const fetchAttributes = createAsyncThunk(
    'category/fetchAttributes',
    async ({ page = 1, perPage = 10, sortField = 'name', sortOrder = 'asc', search = '' }, { rejectWithValue }) => {
        try {
            return await categoryService.getAttributes({ page, perPage, sortField, sortOrder, search });
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch attributes');
        }
    }
);

export const fetchAllAttributes = createAsyncThunk(
    'category/fetchAllAttributes',
    async (_, { rejectWithValue }) => {
        try {
            return await categoryService.getAllAttributes();
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch attributes');
        }
    }
);

export const createAttribute = createAsyncThunk(
    'category/createAttribute',
    async (data, { rejectWithValue }) => {
        try {
            return await categoryService.createAttribute(data);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create attribute');
        }
    }
);

export const updateAttribute = createAsyncThunk(
    'category/updateAttribute',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            return await categoryService.updateAttribute(id, data);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update attribute');
        }
    }
);

export const deleteAttribute = createAsyncThunk(
    'category/deleteAttribute',
    async (id, { rejectWithValue }) => {
        try {
            await categoryService.deleteAttribute(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete attribute');
        }
    }
);

// ============ SLICE ============

const categorySlice = createSlice({
    name: 'category',
    initialState: {
        // Product Types
        productTypes: [],
        productTypesTotal: 0,
        productTypesLoading: false,
        productTypesError: null,

        currentProductType: null,
        currentProductTypeLoading: false,
        currentProductTypeError: null,

        // Attributes
        attributes: [],
        attributesTotal: 0,
        attributesLoading: false,
        attributesError: null,

        // All data (for dropdowns)
        allProductTypes: [],
        allAttributes: [],

        // Operation states
        createLoading: false,
        createError: null,
        updateLoading: false,
        updateError: null,
        deleteLoading: false,
        deleteError: null,
    },
    reducers: {
        clearCurrentProductType: (state) => {
            state.currentProductType = null;
            state.currentProductTypeError = null;
        },
        clearErrors: (state) => {
            state.productTypesError = null;
            state.currentProductTypeError = null;
            state.attributesError = null;
            state.createError = null;
            state.updateError = null;
            state.deleteError = null;
        },
    },
    extraReducers: (builder) => {
        // ============ PRODUCT TYPES ============
        builder
            .addCase(fetchProductTypes.pending, (state) => {
                state.productTypesLoading = true;
                state.productTypesError = null;
            })
            .addCase(fetchProductTypes.fulfilled, (state, action) => {
                state.productTypesLoading = false;
                state.productTypes = action.payload.data;
                state.productTypesTotal = action.payload.total;
            })
            .addCase(fetchProductTypes.rejected, (state, action) => {
                state.productTypesLoading = false;
                state.productTypesError = action.payload;
            });

        builder
            .addCase(fetchAllProductTypes.fulfilled, (state, action) => {
                state.allProductTypes = action.payload.data;
            });

        builder
            .addCase(fetchProductType.pending, (state) => {
                state.currentProductTypeLoading = true;
                state.currentProductTypeError = null;
            })
            .addCase(fetchProductType.fulfilled, (state, action) => {
                state.currentProductTypeLoading = false;
                state.currentProductType = action.payload.data;
            })
            .addCase(fetchProductType.rejected, (state, action) => {
                state.currentProductTypeLoading = false;
                state.currentProductTypeError = action.payload;
            });

        builder
            .addCase(createProductType.pending, (state) => {
                state.createLoading = true;
                state.createError = null;
            })
            .addCase(createProductType.fulfilled, (state, action) => {
                state.createLoading = false;
                state.productTypes.unshift(action.payload.data);
                state.productTypesTotal += 1;
            })
            .addCase(createProductType.rejected, (state, action) => {
                state.createLoading = false;
                state.createError = action.payload;
            });

        builder
            .addCase(updateProductType.pending, (state) => {
                state.updateLoading = true;
                state.updateError = null;
            })
            .addCase(updateProductType.fulfilled, (state, action) => {
                state.updateLoading = false;
                const index = state.productTypes.findIndex(pt => pt._id === action.payload.data._id);
                if (index !== -1) {
                    state.productTypes[index] = action.payload.data;
                }
                state.currentProductType = action.payload.data;
            })
            .addCase(updateProductType.rejected, (state, action) => {
                state.updateLoading = false;
                state.updateError = action.payload;
            });

        builder
            .addCase(deleteProductType.pending, (state) => {
                state.deleteLoading = true;
                state.deleteError = null;
            })
            .addCase(deleteProductType.fulfilled, (state, action) => {
                state.deleteLoading = false;
                state.productTypes = state.productTypes.filter(pt => pt._id !== action.payload);
                state.productTypesTotal -= 1;
            })
            .addCase(deleteProductType.rejected, (state, action) => {
                state.deleteLoading = false;
                state.deleteError = action.payload;
            });

        // ============ ATTRIBUTES ============
        builder
            .addCase(fetchAttributes.pending, (state) => {
                state.attributesLoading = true;
                state.attributesError = null;
            })
            .addCase(fetchAttributes.fulfilled, (state, action) => {
                state.attributesLoading = false;
                state.attributes = action.payload.data;
                state.attributesTotal = action.payload.total;
            })
            .addCase(fetchAttributes.rejected, (state, action) => {
                state.attributesLoading = false;
                state.attributesError = action.payload;
            });

        builder
            .addCase(fetchAllAttributes.fulfilled, (state, action) => {
                state.allAttributes = action.payload.data;
            });

        builder
            .addCase(createAttribute.pending, (state) => {
                state.createLoading = true;
                state.createError = null;
            })
            .addCase(createAttribute.fulfilled, (state, action) => {
                state.createLoading = false;
                state.attributes.unshift(action.payload.data);
                state.attributesTotal += 1;
                state.allAttributes.unshift(action.payload.data);
            })
            .addCase(createAttribute.rejected, (state, action) => {
                state.createLoading = false;
                state.createError = action.payload;
            });

        builder
            .addCase(updateAttribute.pending, (state) => {
                state.updateLoading = true;
                state.updateError = null;
            })
            .addCase(updateAttribute.fulfilled, (state, action) => {
                state.updateLoading = false;
                const index = state.attributes.findIndex(attr => attr._id === action.payload.data._id);
                if (index !== -1) {
                    state.attributes[index] = action.payload.data;
                }
                const allIndex = state.allAttributes.findIndex(attr => attr._id === action.payload.data._id);
                if (allIndex !== -1) {
                    state.allAttributes[allIndex] = action.payload.data;
                }
            })
            .addCase(updateAttribute.rejected, (state, action) => {
                state.updateLoading = false;
                state.updateError = action.payload;
            });

        builder
            .addCase(deleteAttribute.pending, (state) => {
                state.deleteLoading = true;
                state.deleteError = null;
            })
            .addCase(deleteAttribute.fulfilled, (state, action) => {
                state.deleteLoading = false;
                state.attributes = state.attributes.filter(attr => attr._id !== action.payload);
                state.attributesTotal -= 1;
                state.allAttributes = state.allAttributes.filter(attr => attr._id !== action.payload);
            })
            .addCase(deleteAttribute.rejected, (state, action) => {
                state.deleteLoading = false;
                state.deleteError = action.payload;
            });
    },
});

export const {
    clearCurrentProductType,
    clearErrors,
} = categorySlice.actions;

export default categorySlice.reducer;