import React from 'react';

import logger from 'redux-logger';
import {Provider} from 'react-redux';
import {persistStore, persistReducer} from 'redux-persist';
import {PersistGate} from 'redux-persist/integration/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {combineReducers, configureStore} from '@reduxjs/toolkit';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

import {inviteSliceReducer} from './reducers/inviteSlices';
import {talliesSliceReducer} from './reducers/talliesSlices';
import {profileSliceReducer} from './reducers/profileSlices';
import {languageSliceReducer} from './reducers/languageSlices';
import {currencySliceReducer} from './reducers/currencySlices';

export const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  stateReconciler: autoMergeLevel2,
};

const reducers = combineReducers({
  invite: inviteSliceReducer,
  profile: profileSliceReducer,
  tallies: talliesSliceReducer,
  language: languageSliceReducer,
  currency: currencySliceReducer,
});

export const preducers = persistReducer(persistConfig, reducers);

export const store = configureStore({
  reducer: preducers,
  devTools: process.env.NODE_ENV !== 'production',
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }).concat(logger),
});

export const persistor = persistStore(store);

export const ReduxProvider = Component => {
  return props => (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <Component {...props} />
      </PersistGate>
    </Provider>
  );
};

ReduxProvider.displayName = 'ReduxProvider';
