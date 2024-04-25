import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { setCurrentGameId, setInitialState } from './extraActions';
import { RootState } from './store';
import {
  createServerApiHelpers,
  extractDisplayName,
  getServerApi
} from '../backend/utils';
import { clearAlsListener, enableAlsListener } from '../backend/alsListener';
// import type { RootState } from './store';

type UiStateType = {
  initialLoading: boolean;
  currentGameId: undefined | string;
  currentDisplayName: undefined | string;
  chargeLimitEnabled?: boolean;
  alsEnabled?: boolean;
  pluginVersionNum?: string;
};

// Define the initial state using that type
const initialState: UiStateType = {
  initialLoading: true,
  currentGameId: undefined,
  currentDisplayName: undefined,
  pluginVersionNum: ''
};

export const uiSlice = createSlice({
  name: 'ui',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setInitialLoading: (state, action: PayloadAction<boolean>) => {
      state.initialLoading = action.payload;
    },
    setChargeLimit(state, action: PayloadAction<boolean>) {
      state.chargeLimitEnabled = action.payload;
    },
    setAlsEnabled(state, action: PayloadAction<boolean>) {
      state.alsEnabled = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(setInitialState, (state, action) => {
      if (action) state.initialLoading = false;
      if (action.payload?.pluginVersionNum) {
        state.pluginVersionNum = `${action.payload.pluginVersionNum}`;
      }
      if (action.payload?.chargeLimitEnabled) {
        state.chargeLimitEnabled = Boolean(action.payload?.chargeLimitEnabled);
      }
      if (action.payload?.alsEnabled) {
        state.alsEnabled = Boolean(action.payload?.alsEnabled);
      }
    });
    builder.addCase(setCurrentGameId, (state, action) => {
      if (action?.payload) {
        state.currentGameId = action.payload;
        state.currentDisplayName = extractDisplayName();
      }
    });
  }
});

export const getPluginVersionNumSelector = (state: RootState) =>
  state.ui.pluginVersionNum;

export const getInitialLoading = (state: RootState) => state.ui.initialLoading;

export const selectCurrentGameId = (state: RootState) =>
  state.ui?.currentGameId || 'default';

export const selectCurrentGameDisplayName = (state: RootState) =>
  state.ui?.currentDisplayName || 'default';

export const selectChargeLimitEnabled = (state: RootState) =>
  Boolean(state.ui?.chargeLimitEnabled);

export const selectAlsEnabled = (state: RootState) =>
  Boolean(state.ui?.alsEnabled);

export const uiSliceMiddleware =
  (_store: any) => (next: any) => (action: any) => {
    const { type } = action;
    const serverApi = getServerApi();

    const result = next(action);

    if (serverApi) {
      const { setChargeLimit, setAlsEnabled } =
        createServerApiHelpers(serverApi);

      if (type === setInitialState.type) {
        if (action.payload?.alsEnabled) {
          enableAlsListener();
        }
      }

      if (type === uiSlice.actions.setChargeLimit.type && serverApi) {
        setChargeLimit(action.payload);
      }
      if (type === uiSlice.actions.setAlsEnabled.type && serverApi) {
        const enabled = action.payload;
        setAlsEnabled(enabled);
        if (enabled) {
          enableAlsListener();
        } else {
          clearAlsListener();
        }
      }
    }

    return result;
  };
