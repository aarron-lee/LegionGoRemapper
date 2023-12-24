import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { get, set, merge } from 'lodash';
// import type { RootState } from './store';
import { setCurrentGameId, setInitialState } from './extraActions';
import { extractCurrentGameId, getServerApi } from '../backend/utils';
// import {
//   RemapActions,
//   RemappableButtons
// } from '../backend/constants';
// import { Router } from 'decky-frontend-lib';

const DEFAULT_FAN_VALUES: FanProfile = {

};

type FanProfile = {
  [key: string]: number
};

type FanProfiles = {
  [gameId: string]: FanProfile;
};

type FanState = {
  fanProfiles: FanProfiles;
  fanPerGameProfilesEnabled: boolean;
  customFanCurvesEnabled: boolean;
};

const initialState: FanState = {
  fanProfiles: {},
  fanPerGameProfilesEnabled: false,
  customFanCurvesEnabled: false
};

export const fanSlice = createSlice({
  name: 'fan',
  initialState,
  reducers: {
    setCustomFanCurvesEnabled: (state, action: PayloadAction<boolean>) => {
      const enabled = action.payload;
      state.customFanCurvesEnabled = enabled;
      if (enabled) {
        bootstrapFanProfile(state, extractCurrentGameId());
      }
    },
    setFanPerGameProfilesEnabled: (state, action: PayloadAction<boolean>) => {
      const enabled = action.payload;
      state.fanPerGameProfilesEnabled = enabled;
    },
    updateFanCurve: (
      state,
      action: PayloadAction<{
        temp: string;
        fanSpeed: number;
      }>
    ) => {
      const { temp, fanSpeed } = action.payload;
      setStateValue({
        sliceState: state,
        key: temp,
        value: fanSpeed
      });
    },
    updateFanProfiles: (
      state,
      action: PayloadAction<FanProfiles>
    ) => {
      merge(state.fanProfiles, action.payload);
    }
  },
  extraReducers: (builder) => {
    builder.addCase(setInitialState, (state, action) => {
      const fanProfiles = action.payload
        .fanProfiles as FanProfiles;

      const customFanCurvesEnabled = Boolean(
        action.payload.customFanCurvesEnabled
      );
      const fanPerGameProfilesEnabled = Boolean(
        action.payload.fanPerGameProfilesEnabled
      )

      state.customFanCurvesEnabled = customFanCurvesEnabled;
      state.fanProfiles = fanProfiles;
      state.fanPerGameProfilesEnabled = fanPerGameProfilesEnabled;
    });
    builder.addCase(setCurrentGameId, (state, action) => {
      /*
        currentGameIdChanged, check if exists in redux store.
        if not exists, bootstrap it on frontend
      */
      const newGameId = action.payload as string;
      bootstrapFanProfile(state, newGameId);
    });
  }
});

// -------------
// selectors
// -------------



// -------------
// middleware
// -------------

const mutatingActionTypes = [
  fanSlice.actions.setCustomFanCurvesEnabled.type,
  // controllerSlice.actions.setCustomFanCurvesEnabled.type,
  // controllerSlice.actions.remapButton.type,
  // controllerSlice.actions.updateControllerProfiles.type,
  // controllerSlice.actions.setTouchpad.type,
  // controllerSlice.actions.setGyro.type,
  // controllerSlice.actions.setControllerRemappingEnabled.type,
  setCurrentGameId.type
];

export const saveFanSettingsMiddleware =
  (store: any) => (next: any) => (action: any) => {
    const { type } = action;
    const serverApi = getServerApi();

    const result = next(action);

    if (mutatingActionTypes.includes(type)) {
      // save changes to backend
      const {
        fan: {
          fanProfiles,
          perGameProfilesEnabled,
          customFanCurvesEnabled
        },
        ui: { currentGameId: currentId }
      } = store.getState();
      let currentGameId;
      if (perGameProfilesEnabled && currentId) {
        currentGameId = currentId;
      } else {
        currentGameId = 'default';
      }

      const fanInfo = {
        fanProfiles,
        perGameProfilesEnabled,
        customFanCurvesEnabled
      };

      serverApi?.callPluginMethod('save_fan_settings', {
        fanInfo,
        currentGameId
      });
    }

    return result;
  };

// -------------
// Slice Util functions
// -------------

function setStateValue({
  sliceState,
  key,
  value
}: {
  sliceState: FanState;
  key: string;
  value: any;
}) {
  if (sliceState.fanPerGameProfilesEnabled) {
    const currentGameId = extractCurrentGameId();
    set(sliceState, `fanProfiles.${currentGameId}.${key}`, value);
  } else {
    set(sliceState, `fanProfiles.default.${key}`, value);
  }
}

function bootstrapFanProfile(state: FanState, newGameId: string) {
  if (!state.fanProfiles) {
    state.fanProfiles = {};
  }
  if (
    // only initialize profile if perGameProfiles are enabled
    (!state.fanProfiles[newGameId] && state.fanPerGameProfilesEnabled) ||
    // always initialize default
    newGameId === 'default'
  ) {
    const defaultProfile = state.fanProfiles?.default;
    const newFanProfile = defaultProfile || DEFAULT_FAN_VALUES;

    state.fanProfiles[newGameId] = newFanProfile;
  }
}
