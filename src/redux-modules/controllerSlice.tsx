import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { get, merge } from 'lodash';
import type { RootState } from './store';
import { setCurrentGameId, setInitialState } from './extraActions';
import { extractCurrentGameId, getServerApi } from '../backend/utils';
import { RemapActions, RemappableButtons } from '../backend/constants';

const DEFAULT_CONTROLLER_VALUES = {
  enabled: false,
  Y1: RemapActions.DISABLED,
  Y2: RemapActions.DISABLED,
  Y3: RemapActions.DISABLED,
  M2: RemapActions.DISABLED,
  M3: RemapActions.DISABLED
};

type ControllerProfile = {
  enabled: boolean;
  Y1: RemapActions;
  Y2: RemapActions;
  Y3: RemapActions;
  M2: RemapActions;
  M3: RemapActions;
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

const bootstrapControllerProfile = (
  state: ControllerState,
  newGameId: string
) => {
  if (
    // only initialize profile if perGameProfiles are enabled
    (!state.controllerProfiles[newGameId] && state.perGameProfilesEnabled) ||
    // always initialize default
    newGameId === 'default'
  ) {
    const defaultProfile = get(
      state,
      'controllerProfiles.default',
      {}
    ) as ControllerProfile;
    const newControllerProfile = defaultProfile || DEFAULT_CONTROLLER_VALUES;

    state.controllerProfiles[newGameId] = newControllerProfile;
  }
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
    setEnabled: (
      state,
      action: PayloadAction<{
        enabled: boolean;
      }>
    ) => {
      const { enabled } = action.payload;

      setStateValue({
        sliceState: state,
        key: 'enabled',
        value: enabled
      });
    }
  },
  extraReducers: (builder) => {
    builder.addCase(setInitialState, (state, action) => {
      const controllerProfiles = (action.payload.controller ||
        {}) as ControllerProfiles;
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

export const selectPerGameProfilesEnabled = (state: RootState) => {
  return state.controller.perGameProfilesEnabled;
};

// -------------
// middleware
// -------------

const mutatingActionTypes = [
  controllerSlice.actions.setEnabled.type,
  controllerSlice.actions.setPerGameProfilesEnabled.type,
  controllerSlice.actions.remapButton.type,
  controllerSlice.actions.updateControllerProfiles.type
];

export const saveControllerSettingsMiddleware =
  (store: any) => (next: any) => (action: any) => {
    const { type } = action;
    const serverApi = getServerApi();

    const result = next(action);

    if (mutatingActionTypes.includes(type)) {
      // get latest state from store
      const {
        controller: { controllerProfiles, perGameProfilesEnabled }
      } = store.getState();
      const currentGameId = perGameProfilesEnabled
        ? extractCurrentGameId()
        : 'default';

      serverApi?.callPluginMethod('save_controller_settings', {
        controllerProfiles,
        currentGameId
      });
    }
    if (type === setInitialState.type || type === setCurrentGameId.type) {
      // tell backend to sync LEDs to current FE state
      const {
        controller: { perGameProfilesEnabled }
      } = store.getState();
      const currentGameId = perGameProfilesEnabled
        ? extractCurrentGameId()
        : 'default';

      serverApi?.callPluginMethod('sync_controller_settings', {
        currentGameId
      });
    }
    if (type === controllerSlice.actions.setPerGameProfilesEnabled.type) {
      serverApi?.callPluginMethod('save_controller_per_game_profiles_enabled', {
        enabled: Boolean(action.payload)
      });
      if (action.payload) {
        serverApi?.callPluginMethod('sync_controller_settings', {
          currentGameId: extractCurrentGameId()
        });
      } else {
        serverApi?.callPluginMethod('sync_controller_settings', {
          currentGameId: 'default'
        });
      }
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
    sliceState.controllerProfiles[currentGameId][key] = value;
  } else {
    sliceState.controllerProfiles['default'][key] = value;
  }
}
