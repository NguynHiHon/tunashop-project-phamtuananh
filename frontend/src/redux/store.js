import { configureStore } from '@reduxjs/toolkit';
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './clices/authSlice';
import tokenReducer from './clices/tokenSlice';
import userReducer from './clices/userSlice';
import chatReducer from './clices/chatSlice';
import categoryReducer from './clices/categorySlice';
import productReducer from './clices/productSlice';
import googleAuthReducer from './clices/googleAuthSlice';
import cartReducer from './clices/cartSlice';
import orderReducer from './clices/orderSlice';

// Cấu hình persist - CHỈ PERSIST AUTH (user info + login status)
const authPersistConfig = {
    key: 'auth',
    version: 1,
    storage,
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

export const store = configureStore({
    reducer: {
        auth: persistedAuthReducer,  // Persist - lưu thông tin user
        token: tokenReducer,          // Không persist - token sẽ mất khi reload
        user: userReducer,            // Không persist - profile sẽ fetch lại khi cần
        chat: chatReducer,            // Không persist - chat sẽ fetch lại khi cần
        category: categoryReducer,    // Không persist - category sẽ fetch lại khi cần
        product: productReducer,
        googleAuth: googleAuthReducer, // Không persist - state Google OAuth
        cart: cartReducer,            // Không persist - cart sẽ fetch lại khi cần
        order: orderReducer,          // Không persist - order sẽ fetch lại khi cần
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);
