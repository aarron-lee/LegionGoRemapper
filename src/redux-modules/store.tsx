import { configureStore } from '@reduxjs/toolkit';
import { rgbSlice, saveRgbSettingsMiddleware } from './rgbSlice';
import { uiSlice } from './uiSlice';
import {
  controllerSlice,
  saveControllerSettingsMiddleware
} from './controllerSlice';
import { logger } from './logger';

export const store = configureStore({
  reducer: {
    ui: uiSlice.reducer,
    rgb: rgbSlice.reducer,
    controller: controllerSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      saveRgbSettingsMiddleware,
      saveControllerSettingsMiddleware,
      logger
    ])
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
