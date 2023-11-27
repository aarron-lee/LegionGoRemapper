import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { merge } from 'lodash';
import type { RootState } from './store';
import { setInitialState } from './extraActions';
import { extractCurrentGameId } from '../backend/utils';
import { ControllerType } from '../backend/constants';

enum Colors {
  RED = 'red',
  GREEN = 'green',
  BLUE = 'blue'
}

enum Actions {
  SET_COLOR,
  SET_BRIGHTNESS,
  TOGGLE_ENABLED,
  SET_ENABLED
}

type ActionType = {
  type: Actions;
  payload?: any;
};

type RgbLight = {
  enabled: boolean;
  red: number;
  green: number;
  blue: number;
  brightness: number;
};

type RgbProfiles = {
  [gameId: string]: { LEFT: RgbLight; RIGHT: RgbLight };
};

// Define a type for the slice state
type RgbState = {
  rgbProfiles: RgbProfiles;
};

// Define the initial state using that type
const initialState: RgbState = {
  rgbProfiles: {}
};

export const rgbSlice = createSlice({
  name: 'rgb',
  initialState,
  reducers: {
    updateRgbProfiles: (state, action: PayloadAction<RgbProfiles>) => {
      merge(state.rgbProfiles, action.payload);
    },
    setColor: (
      state,
      action: PayloadAction<{
        controller: ControllerType;
        color: Colors;
        value: number;
      }>
    ) => {
      const { controller, color, value } = action.payload;
      const currentGameId = extractCurrentGameId();
      state.rgbProfiles[currentGameId][controller][color] = value;
    },
    setEnabled: (
      state,
      action: PayloadAction<{
        controller: ControllerType;
        enabled: boolean;
      }>
    ) => {
      const { controller, enabled } = action.payload;
      const currentGameId = extractCurrentGameId();
      state.rgbProfiles[currentGameId][controller]['enabled'] = enabled;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(setInitialState, (state, action) => {
      const rgbProfiles = action.payload.rgb as RgbProfiles;

      state.rgbProfiles = rgbProfiles;
    });
  }
});

export const selectRgbInfo =
  (controller: ControllerType) => (state: RootState) => {
    const currentGameId = extractCurrentGameId();

    const rgbInfo = state.rgb.rgbProfiles[currentGameId][controller];

    return rgbInfo;
  };

// export const { increment, decrement, incrementByAmount } = counterSlice.actions;

// Other code such as selectors can use the imported `RootState` type
// export const selectCount = (state: RootState) => state.counter.value;
