import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { merge } from 'lodash';
import type { RootState } from './store';
import { setInitialState } from './extraActions';
import { extractCurrentGameId, getServerApi, logInfo } from '../backend/utils';
import { ControllerType } from '../backend/constants';

enum Colors {
  RED = 'red',
  GREEN = 'green',
  BLUE = 'blue'
}

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
    },
    setBrightness: (
      state,
      action: PayloadAction<{
        controller: ControllerType;
        brightness: number;
      }>
    ) => {
      const { controller, brightness } = action.payload;
      const currentGameId = extractCurrentGameId();
      state.rgbProfiles[currentGameId][controller]['brightness'] = brightness;
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

const mutatingActionTypes = [
  rgbSlice.actions.updateRgbProfiles.type,
  rgbSlice.actions.setColor.type,
  rgbSlice.actions.setEnabled.type,
  rgbSlice.actions.setBrightness.type
];

export const saveRgbSettingsMiddleware =
  (store: any) => (next: any) => (action: any) => {
    const { type } = action;
    const serverApi = getServerApi();

    const result = next(action);

    if (mutatingActionTypes.includes(type)) {
      // get latest state from store
      const {
        rgb: { rgbProfiles }
      } = store.getState();

      serverApi?.callPluginMethod('save_rgb_settings', { rgbProfiles });
    }

    return result;
  };
