import { configureStore } from '@reduxjs/toolkit';

import workingTalliesReducer from './workingTalliesSlice';
import profileReducer from './profileSlice';
import languageReducer from './languageSlice';
import currentUserReducer from './currentUserSlice';
import openTalliesReducer from './openTalliesSlice';
import avatarReducer from './avatarSlice';

export default configureStore({
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    immutableCheck: false,
    serializableCheck: false,
  }),
  reducer: {
    profile: profileReducer,
    workingTallies: workingTalliesReducer,
    language: languageReducer,
    currentUser: currentUserReducer,
    openTallies: openTalliesReducer,
    avatar: avatarReducer,
  }
})
