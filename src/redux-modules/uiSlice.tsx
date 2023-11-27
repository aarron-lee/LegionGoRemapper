import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { setCurrentGameId, setInitialState } from './extraActions';
import { RootState } from './store';
// import type { RootState } from './store';

type UiStateType = {
  initialLoading: boolean;
  currentGameId: undefined | string;
};

// Define the initial state using that type
const initialState: UiStateType = {
  initialLoading: true,
  currentGameId: undefined
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
    builder.addCase(setCurrentGameId, (state, action) => {
      if (action?.payload) state.currentGameId = action.payload;
    });
  }
});

export const getInitialLoading = (state: RootState) => state.ui.initialLoading;

// export const { increment, decrement, incrementByAmount } = counterSlice.actions;

// Other code such as selectors can use the imported `RootState` type
// export const selectCount = (state: RootState) => state.counter.value;
