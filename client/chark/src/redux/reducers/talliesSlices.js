import {createSlice} from '@reduxjs/toolkit';
import {EAppReducers} from '../constants';
const initialState = [];

export const talliesSlice = createSlice({
  name: EAppReducers.UPDATE_TALLIES_STATE,
  initialState: initialState,
  reducers: {
    saveTallies: (state, action) => {
      return action.payload;
    },
  },
});

export const talliesSliceReducer = talliesSlice.reducer;
