import { configureStore } from '@reduxjs/toolkit';
import { rgbSlice } from './rgbSlice';
import { uiSlice } from './uiSlice';

export const store = configureStore({
  reducer: {
    ui: uiSlice.reducer,
    rgb: rgbSlice.reducer
  }
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
