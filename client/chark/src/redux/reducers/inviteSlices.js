import {createSlice} from '@reduxjs/toolkit';
import {EAppReducers} from '../constants';

const initialState = [];

export const inviteSlice = createSlice({
  name: EAppReducers.UPDATE_INVITES_STATE,
  initialState: initialState,
  reducers: {
    saveInvites: (state, action) => {
      return action.payload;
    },
  },
});

export const inviteSliceReducer = inviteSlice.reducer;
