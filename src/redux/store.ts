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
import { countriesSlice } from './services/countriesSlice';
import { statesSlice } from './services/statesSlice';
import { citiesSlice } from './services/citiesSlice';
import { areasSlice } from './services/areasSlice';
import { currenciesSlice } from './services/currenciesSlice';
import { qurbaniTypesSlice } from './services/qurbaniTypesSlice';
import { qurbaniAnimalTypesSlice } from './services/qurbaniAnimalTypesSlice';
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
    [countriesSlice.reducerPath]: countriesSlice.reducer,
    [statesSlice.reducerPath]: statesSlice.reducer,
    [citiesSlice.reducerPath]: citiesSlice.reducer,
    [areasSlice.reducerPath]: areasSlice.reducer,
    [currenciesSlice.reducerPath]: currenciesSlice.reducer,
    [qurbaniTypesSlice.reducerPath]: qurbaniTypesSlice.reducer,
    [qurbaniAnimalTypesSlice.reducerPath]: qurbaniAnimalTypesSlice.reducer,
    counter: counterReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }).concat(
            authSlice.middleware,
            productSlice.middleware,
            userSlice.middleware,
            categoriesSlice.middleware,
            ordersSlice.middleware,
            countriesSlice.middleware,
            statesSlice.middleware,
            citiesSlice.middleware,
            areasSlice.middleware,
            currenciesSlice.middleware,
            qurbaniTypesSlice.middleware,
            qurbaniAnimalTypesSlice.middleware
        ),
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
