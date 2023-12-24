import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { set, merge } from 'lodash';
import { setCurrentGameId, setInitialState } from './extraActions';
import { extractCurrentGameId, getServerApi } from '../backend/utils';
import { RootState } from './store';


// Temperature 10°C: Fan Speed 5%
// Temperature 20°C: Fan Speed 5%
// Temperature 30°C: Fan Speed 5%
// Temperature 40°C: Fan Speed 10%
// Temperature 50°C: Fan Speed 15%
// Temperature 60°C: Fan Speed 35%
// Temperature 70°C: Fan Speed 70%
// Temperature 80°C: Fan Speed 80%
// Temperature 90°C: Fan Speed 95%
// Temperature 100°C: Fan Speed 100%

const DEFAULT_FAN_VALUES: FanProfile = {
  10: 5,
  20: 5,
  30: 5,
  40: 10,
  50: 15,
  60: 35,
  70: 70,
  80: 80,
  90: 95,
  100: 100
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
  supportsCustomFanCurves: boolean;
};

const initialState: FanState = {
  fanProfiles: {},
  fanPerGameProfilesEnabled: false,
  customFanCurvesEnabled: false,
  supportsCustomFanCurves: false
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
        .fan as FanProfiles;

      const customFanCurvesEnabled = Boolean(
        action.payload.customFanCurvesEnabled
      );
      const fanPerGameProfilesEnabled = Boolean(
        action.payload.fanPerGameProfilesEnabled
      )

      state.supportsCustomFanCurves = Boolean(action.payload.supportsCustomFanCurves)

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

export const selectSupportsCustomFanCurves = (state: RootState) => {
  return Boolean(state.fan.supportsCustomFanCurves)
}

export const selectCustomFanCurvesEnabled = (state: RootState) => {
  return Boolean(state.fan.customFanCurvesEnabled)
}

export const selectFanPerGameProfilesEnabled = (state: RootState) => {
  return Boolean(state.fan.fanPerGameProfilesEnabled)
}

export const selectActiveFanCurve = (state: RootState) => {
  const perGameProfilesEnabled = selectFanPerGameProfilesEnabled(state);

  if (perGameProfilesEnabled) {
    const { ui: { currentGameId = "default" } } = state;
    return state.fan.fanProfiles[currentGameId]
  } else {
    return state.fan.fanProfiles.default;
  }
}

// -------------
// middleware
// -------------

const mutatingActionTypes = [
  fanSlice.actions.setCustomFanCurvesEnabled.type,
  fanSlice.actions.setFanPerGameProfilesEnabled.type,
  fanSlice.actions.updateFanCurve.type,
  fanSlice.actions.updateFanProfiles.type,
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
          fanPerGameProfilesEnabled,
          customFanCurvesEnabled
        },
        ui: { currentGameId: currentId }
      } = store.getState();
      let currentGameId;
      if (fanPerGameProfilesEnabled && currentId) {
        currentGameId = currentId;
      } else {
        currentGameId = 'default';
      }

      const fanInfo = {
        fanProfiles,
        fanPerGameProfilesEnabled,
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
