import {createSlice} from '@reduxjs/toolkit';
import {EAppReducers} from '../constants';

const initialState = {};

export const profileSlice = createSlice({
  name: EAppReducers.UPDATE_PROFILE_STATE,
  initialState: initialState,
  reducers: {
    saveProfile: (state, action) => {
      return action.payload;
    },
  },
});

export const profileSliceReducer = profileSlice.reducer;
