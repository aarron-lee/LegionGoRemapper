import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { get, merge } from 'lodash';
import type { RootState } from './store';
import { setCurrentGameId, setInitialState } from './extraActions';
import { extractCurrentGameId, getServerApi, logInfo } from '../backend/utils';
import { ControllerType } from '../backend/constants';

const DEFAULT_RGB_LIGHT_VALUES = {
  enabled: false,
  red: 255,
  green: 255,
  blue: 255,
  brightness: 50
};

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

type RgbProfile = { LEFT: RgbLight; RIGHT: RgbLight };

type RgbProfiles = {
  [gameId: string]: RgbProfile;
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
    builder.addCase(setCurrentGameId, (state, action) => {
      /*
        currentGameIdChanged, check if exists in redux store.
        if not exists, bootstrap it on frontend
      */
      const currentGameId = action.payload as string;
      if (!state.rgbProfiles) {
        // rgbProfiles don't exist yet, bootstrap it
        state.rgbProfiles = {};
      }
      if (!state.rgbProfiles[currentGameId]) {
        const defaultProfile = get(
          state,
          'rgbProfiles.default',
          {}
        ) as RgbProfile;
        const newRgbProfile = {
          LEFT: defaultProfile.LEFT || DEFAULT_RGB_LIGHT_VALUES,
          RIGHT: defaultProfile.RIGHT || DEFAULT_RGB_LIGHT_VALUES
        };

        state.rgbProfiles[currentGameId] = newRgbProfile;
      }
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

      serverApi
        ?.callPluginMethod('save_rgb_settings', { rgbProfiles })
        .then((res) => {
          const currentGameId = extractCurrentGameId();
          if (res.success) {
            // since RGB settings changed, update state of RBG lights
            serverApi.callPluginMethod('sync_rgb_settings', { currentGameId });
          }
        });
    }
    if (type === setInitialState.type || type === setCurrentGameId.type) {
      // tell backend to sync LEDs to current FE state
      const currentGameId = extractCurrentGameId();

      serverApi?.callPluginMethod('sync_rgb_settings', { currentGameId });
    }

    return result;
  };
