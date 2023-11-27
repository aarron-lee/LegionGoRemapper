import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { setInitialState } from './extraActions';
import { RootState } from './store';
// import type { RootState } from './store';

// Define the initial state using that type
const initialState = {
  initialLoading: true
};

export const uiSlice = createSlice({
  name: 'ui',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setInitialLoading: (state, action: PayloadAction<boolean>) => {
      state.initialLoading = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(setInitialState, (state, action) => {
      if (action) state.initialLoading = false;
    });
  }
});

export const getInitialLoading = (state: RootState) => state.ui.initialLoading;

// export const { increment, decrement, incrementByAmount } = counterSlice.actions;

// Other code such as selectors can use the imported `RootState` type
// export const selectCount = (state: RootState) => state.counter.value;
