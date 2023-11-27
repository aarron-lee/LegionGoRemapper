import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { get, merge } from 'lodash';
import type { RootState } from './store';
import { setCurrentGameId, setInitialState } from './extraActions';
import { extractCurrentGameId, getServerApi } from '../backend/utils';
import { ControllerType } from '../backend/constants';
import { Router } from 'decky-frontend-lib';

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

type RgbState = {
  rgbProfiles: RgbProfiles;
  perGameProfilesEnabled: boolean;
};

const initialState: RgbState = {
  rgbProfiles: {},
  perGameProfilesEnabled: false
};

const bootstrapRgbProfile = (state: RgbState, newGameId: string) => {
  if (!state.rgbProfiles) {
    // rgbProfiles don't exist yet, create it
    state.rgbProfiles = {};
  }
  if (
    // only initialize profile if perGameProfiles are enabled
    (!state.rgbProfiles[newGameId] && state.perGameProfilesEnabled) ||
    // always initialize default
    newGameId === 'default'
  ) {
    const defaultProfile = get(state, 'rgbProfiles.default', {}) as RgbProfile;
    const newRgbProfile = {
      LEFT: defaultProfile.LEFT || DEFAULT_RGB_LIGHT_VALUES,
      RIGHT: defaultProfile.RIGHT || DEFAULT_RGB_LIGHT_VALUES
    };

    state.rgbProfiles[newGameId] = newRgbProfile;
  }
};

export const rgbSlice = createSlice({
  name: 'rgb',
  initialState,
  reducers: {
    setPerGameProfilesEnabled: (state, action: PayloadAction<boolean>) => {
      const enabled = action.payload;
      state.perGameProfilesEnabled = enabled;
      if (enabled) {
        bootstrapRgbProfile(state, extractCurrentGameId());
      }
    },
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
      if (state.perGameProfilesEnabled) {
        state.rgbProfiles[currentGameId][controller][color] = value;
      } else {
        state.rgbProfiles['default'][controller][color] = value;
      }
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
      if (state.perGameProfilesEnabled) {
        state.rgbProfiles[currentGameId][controller]['enabled'] = enabled;
      } else {
        state.rgbProfiles['default'][controller]['enabled'] = enabled;
      }
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
      if (state.perGameProfilesEnabled) {
        state.rgbProfiles[currentGameId][controller]['brightness'] = brightness;
      } else {
        state.rgbProfiles['default'][controller]['brightness'] = brightness;
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(setInitialState, (state, action) => {
      const rgbProfiles = action.payload.rgb as RgbProfiles;
      const perGameProfilesEnabled = Boolean(
        action.payload.rgbPerGameProfilesEnabled
      );

      state.rgbProfiles = rgbProfiles;
      state.perGameProfilesEnabled = perGameProfilesEnabled;
    });
    builder.addCase(setCurrentGameId, (state, action) => {
      /*
        currentGameIdChanged, check if exists in redux store.
        if not exists, bootstrap it on frontend
      */
      const newGameId = action.payload as string;
      bootstrapRgbProfile(state, newGameId);
    });
  }
});

// -------------
// selectors
// -------------

export const selectRgbInfo =
  (controller: ControllerType) => (state: RootState) => {
    const currentGameId = extractCurrentGameId();
    let rgbInfo;
    if (state.rgb.perGameProfilesEnabled) {
      rgbInfo = state.rgb.rgbProfiles[currentGameId][controller];
    } else {
      rgbInfo = state.rgb.rgbProfiles['default'][controller];
    }

    return rgbInfo;
  };

export const selectPerGameProfilesEnabled = (state: RootState) => {
  return state.rgb.perGameProfilesEnabled;
};

export const selectRgbProfileDisplayName = (state: RootState) => {
  if (state.rgb.perGameProfilesEnabled) {
    return Router.MainRunningApp?.display_name || 'Default';
  } else {
    return 'Default';
  }
};

// -------------
// middleware
// -------------

const mutatingActionTypes = [
  rgbSlice.actions.updateRgbProfiles.type,
  rgbSlice.actions.setColor.type,
  rgbSlice.actions.setEnabled.type,
  rgbSlice.actions.setPerGameProfilesEnabled,
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
          const {
            rgb: { perGameProfilesEnabled }
          } = store.getState();

          const currentGameId = perGameProfilesEnabled
            ? extractCurrentGameId()
            : 'default';

          if (res.success) {
            // since RGB settings changed, update state of RBG lights
            serverApi.callPluginMethod('sync_rgb_settings', { currentGameId });
          }
        });
    }
    if (type === setInitialState.type || type === setCurrentGameId.type) {
      // tell backend to sync LEDs to current FE state
      const {
        rgb: { perGameProfilesEnabled }
      } = store.getState();
      const currentGameId = perGameProfilesEnabled
        ? extractCurrentGameId()
        : 'default';

      serverApi?.callPluginMethod('sync_rgb_settings', { currentGameId });
    }
    if (type === rgbSlice.actions.setPerGameProfilesEnabled.type) {
      serverApi?.callPluginMethod('save_rgb_per_game_profiles_enabled', {
        enabled: Boolean(action.payload)
      });
      if (action.payload) {
        serverApi?.callPluginMethod('sync_rgb_settings', {
          currentGameId: extractCurrentGameId()
        });
      } else {
        serverApi?.callPluginMethod('sync_rgb_settings', {
          currentGameId: 'default'
        });
      }
    }

    return result;
  };
