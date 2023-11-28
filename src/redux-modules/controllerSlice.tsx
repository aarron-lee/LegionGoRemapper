import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { get, set, merge } from 'lodash';
import type { RootState } from './store';
import { setCurrentGameId, setInitialState } from './extraActions';
import { extractCurrentGameId, getServerApi } from '../backend/utils';
import { RemapActions, RemappableButtons } from '../backend/constants';
import { Router } from 'decky-frontend-lib';

const DEFAULT_CONTROLLER_VALUES = {
  Y1: RemapActions.DISABLED,
  Y2: RemapActions.DISABLED,
  Y3: RemapActions.DISABLED,
  M2: RemapActions.DISABLED,
  M3: RemapActions.DISABLED,
  TOUCHPAD: true
};

type ControllerProfile = {
  Y1: RemapActions;
  Y2: RemapActions;
  Y3: RemapActions;
  M2: RemapActions;
  M3: RemapActions;
  TOUCHPAD: boolean;
};

type ControllerProfiles = {
  [gameId: string]: ControllerProfile;
};

type ControllerState = {
  controllerProfiles: ControllerProfiles;
  perGameProfilesEnabled: boolean;
};

const initialState: ControllerState = {
  controllerProfiles: {},
  perGameProfilesEnabled: false
};

export const controllerSlice = createSlice({
  name: 'controller',
  initialState,
  reducers: {
    setPerGameProfilesEnabled: (state, action: PayloadAction<boolean>) => {
      const enabled = action.payload;
      state.perGameProfilesEnabled = enabled;
      if (enabled) {
        bootstrapControllerProfile(state, extractCurrentGameId());
      }
    },
    remapButton: (
      state,
      action: PayloadAction<{
        button: RemappableButtons;
        remapAction: RemapActions;
      }>
    ) => {
      const { button, remapAction } = action.payload;
      setStateValue({
        sliceState: state,
        key: button,
        value: remapAction
      });
    },
    updateControllerProfiles: (
      state,
      action: PayloadAction<ControllerProfiles>
    ) => {
      merge(state.controllerProfiles, action.payload);
    },
    setTouchpad: (state, action: PayloadAction<boolean>) => {
      const touchpadEnabled = action.payload;
      setStateValue({
        sliceState: state,
        key: 'TOUCHPAD',
        value: touchpadEnabled
      });
    }
  },
  extraReducers: (builder) => {
    builder.addCase(setInitialState, (state, action) => {
      const controllerProfiles = action.payload
        .controller as ControllerProfiles;

      const perGameProfilesEnabled = Boolean(
        action.payload.controllerPerGameProfilesEnabled
      );

      state.controllerProfiles = controllerProfiles;
      state.perGameProfilesEnabled = perGameProfilesEnabled;
    });
    builder.addCase(setCurrentGameId, (state, action) => {
      /*
        currentGameIdChanged, check if exists in redux store.
        if not exists, bootstrap it on frontend
      */
      const newGameId = action.payload as string;
      bootstrapControllerProfile(state, newGameId);
    });
  }
});

// -------------
// selectors
// -------------

export const selectControllerPerGameProfilesEnabled = (state: RootState) => {
  return state.controller.perGameProfilesEnabled;
};

export const selectTouchpadEnabled = (state: RootState) => {
  if (state.controller.perGameProfilesEnabled) {
    return get(
      state,
      `controller.controllerProfiles.${extractCurrentGameId()}.TOUCHPAD`
    );
  } else {
    return get(state, `controller.controllerProfiles.default.TOUCHPAD`);
  }
};

export const selectButtonRemapAction =
  (button: RemappableButtons) => (state: RootState) => {
    if (state.controller.perGameProfilesEnabled) {
      return get(
        state,
        `controller.controllerProfiles.${extractCurrentGameId()}.${button}`
      );
    } else {
      return get(state, `controller.controllerProfiles.default.${button}`);
    }
  };

export const selectControllerProfileDisplayName = (state: RootState) => {
  if (state.controller.perGameProfilesEnabled) {
    return Router.MainRunningApp?.display_name || 'Default';
  } else {
    return 'Default';
  }
};

// -------------
// middleware
// -------------

const mutatingActionTypes = [
  controllerSlice.actions.setPerGameProfilesEnabled.type,
  controllerSlice.actions.remapButton.type,
  controllerSlice.actions.updateControllerProfiles.type,
  controllerSlice.actions.setTouchpad.type,
  setCurrentGameId.type
];

export const saveControllerSettingsMiddleware =
  (store: any) => (next: any) => (action: any) => {
    const { type } = action;
    const serverApi = getServerApi();

    const result = next(action);

    if (mutatingActionTypes.includes(type)) {
      // save changes to backend
      const {
        controller: { controllerProfiles, perGameProfilesEnabled }
      } = store.getState();
      let currentGameId;
      if (perGameProfilesEnabled) {
        currentGameId = extractCurrentGameId();
      } else {
        currentGameId = 'default';
      }

      const controller = { controllerProfiles, perGameProfilesEnabled };

      serverApi?.callPluginMethod('save_controller_settings', {
        controller,
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
  sliceState: ControllerState;
  key: string;
  value: any;
}) {
  if (sliceState.perGameProfilesEnabled) {
    const currentGameId = extractCurrentGameId();
    set(sliceState, `controllerProfiles.${currentGameId}.${key}`, value);
  } else {
    set(sliceState, `controllerProfiles.default.${key}`, value);
  }
}

function bootstrapControllerProfile(state: ControllerState, newGameId: string) {
  if (!state.controllerProfiles) {
    state.controllerProfiles = {};
  }
  if (
    // only initialize profile if perGameProfiles are enabled
    (!state.controllerProfiles[newGameId] && state.perGameProfilesEnabled) ||
    // always initialize default
    newGameId === 'default'
  ) {
    const defaultProfile = state.controllerProfiles?.default;
    const newControllerProfile = defaultProfile || DEFAULT_CONTROLLER_VALUES;

    state.controllerProfiles[newGameId] = newControllerProfile;
  }
}
