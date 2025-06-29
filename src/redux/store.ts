import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { combineReducers } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { authSlice } from './services/authSlice';
import { productSlice } from './services/productSlice';
import { userSlice } from './services/userSlice';
import { categoriesSlice } from './services/categoriesSlice';
import { ordersSlice } from './services/ordersSlice';
import counterReducer from './slices/counterSlice';

const persistConfig = {
    key: 'myzabiha_admin',
    storage,
    whitelist: ['counter', 'userSlice'], // what to persist
};

const rootReducer = combineReducers({
    [authSlice.reducerPath]: authSlice.reducer,
    [productSlice.reducerPath]: productSlice.reducer,
    [userSlice.reducerPath]: userSlice.reducer,
    [categoriesSlice.reducerPath]: categoriesSlice.reducer,
    [ordersSlice.reducerPath]: ordersSlice.reducer,
    counter: counterReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }).concat(authSlice.middleware, productSlice.middleware, userSlice.middleware, categoriesSlice.middleware, ordersSlice.middleware),
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
