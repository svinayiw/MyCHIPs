import {createSlice} from '@reduxjs/toolkit';
import {EAppReducers} from '../constants';

const initialState = {};

export const languageSlice = createSlice({
  name: EAppReducers.UPDATE_LANGUAGE_STATE,
  initialState: initialState,
  reducers: {
    saveLanguages: (state, action) => {
      return action.payload;
    },
  },
});

export const languageSliceReducer = languageSlice.reducer;
