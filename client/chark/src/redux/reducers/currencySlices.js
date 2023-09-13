import {createSlice} from '@reduxjs/toolkit';
import {EAppReducers} from '../constants';

const initialState = {};

export const currencySlice = createSlice({
  name: EAppReducers.UPDATE_CURRENCY_STATE,
  initialState: initialState,
  reducers: {
    saveCurrency: (state, action) => {
      return action.payload;
    },
  },
});

export const currencySliceReducer = currencySlice.reducer;
