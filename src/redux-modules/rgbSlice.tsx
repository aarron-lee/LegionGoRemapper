import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { merge } from 'lodash';
import type { RootState } from './store';

type RgbProfile = {
  enabled: boolean;
  red: number;
  green: number;
  blue: number;
  brightness: number;
};

type RgbProfiles = {
  [profileName: string]: { left: RgbProfile; right: RgbProfile };
};

// Define a type for the slice state
type RgbState = {
  initialLoading: boolean;
  rgbProfiles: RgbProfiles;
};

// Define the initial state using that type
const initialState: RgbState = {
  initialLoading: true,
  rgbProfiles: {}
};

export const rgbSlice = createSlice({
  name: 'rgb',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setInitialState: (state, action: PayloadAction<RgbProfiles>) => {
      merge(state.rgbProfiles, action.payload);
      state.initialLoading = false;
    }
    // increment: (state) => {
    //   state.value += 1;
    // },
    // decrement: (state) => {
    //   state.value -= 1;
    // },
    // // Use the PayloadAction type to declare the contents of `action.payload`
    // incrementByAmount: (state, action: PayloadAction<number>) => {
    //   state.value += action.payload;
    // }
  }
});

// export const { increment, decrement, incrementByAmount } = counterSlice.actions;

// Other code such as selectors can use the imported `RootState` type
// export const selectCount = (state: RootState) => state.counter.value;
