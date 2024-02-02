import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { setCurrentGameId, setInitialState } from './extraActions';
import { RootState } from './store';
import { extractDisplayName, logInfo } from '../backend/utils';
// import type { RootState } from './store';

type UiStateType = {
  initialLoading: boolean;
  currentGameId: undefined | string;
  currentDisplayName: undefined | string;
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
    }
  },
  extraReducers: (builder) => {
    builder.addCase(setInitialState, (state, action) => {
      if (action) state.initialLoading = false;
      if (action.payload?.pluginVersionNum) {
        state.pluginVersionNum = `${action.payload.pluginVersionNum}`;
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
