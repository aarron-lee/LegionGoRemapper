import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { get, set, merge } from 'lodash';
import type { RootState } from './store';
import { setCurrentGameId, setInitialState } from './extraActions';
import { extractCurrentGameId, getServerApi, logInfo } from '../backend/utils';
import { RemapActions, RemappableButtons } from '../backend/constants';

const DEFAULT_CONTROLLER_VALUES = {
  Y1: RemapActions.DISABLED,
  Y2: RemapActions.DISABLED,
  Y3: RemapActions.DISABLED,
  M2: RemapActions.DISABLED,
  M3: RemapActions.DISABLED
};

type ControllerProfile = {
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

export const controllerSlice = createSlice({
  name: 'controller',
  initialState,
  reducers: {
    // setPerGameProfilesEnabled: (state, action: PayloadAction<boolean>) => {
    //   const enabled = action.payload;
    //   state.perGameProfilesEnabled = enabled;
    //   if (enabled) {
    //     bootstrapControllerProfile(state, extractCurrentGameId());
    //   }
    // },
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
    }
  }
  // extraReducers: (builder) => {
  //   builder.addCase(setInitialState, (state, action) => {
  //     const controllerProfiles = (action.payload.controller ||
  //       {}) as ControllerProfiles;
  //     const perGameProfilesEnabled = Boolean(
  //       action.payload.controllerPerGameProfilesEnabled
  //     );

  //     state.controllerProfiles = controllerProfiles;
  //     state.perGameProfilesEnabled = perGameProfilesEnabled;
  //   });
  //   builder.addCase(setCurrentGameId, (state, action) => {
  //     /*
  //       currentGameIdChanged, check if exists in redux store.
  //       if not exists, bootstrap it on frontend
  //     */
  //     const newGameId = action.payload as string;
  //     bootstrapControllerProfile(state, newGameId);
  //   });
  // }
});

// -------------
// selectors
// -------------

export const selectPerGameProfilesEnabled = (state: RootState) => {
  return state.controller.perGameProfilesEnabled;
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

// -------------
// middleware
// -------------

const mutatingActionTypes = [
  // controllerSlice.actions.setPerGameProfilesEnabled.type,
  controllerSlice.actions.remapButton.type,
  controllerSlice.actions.updateControllerProfiles.type
];

export const saveControllerSettingsMiddleware =
  (store: any) => (next: any) => (action: any) => {
    const { type } = action;

    if (mutatingActionTypes.includes(type)) {
      logInfo('before-------------');
      logInfo(type);
      logInfo(action.payload);
      logInfo(store.getState());
      logInfo('-------------');
    }

    const result = next(action);

    if (mutatingActionTypes.includes(type)) {
      logInfo('after-------------');
      logInfo(type);
      logInfo(action.payload);
      logInfo(store.getState());
      logInfo('-------------');
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
