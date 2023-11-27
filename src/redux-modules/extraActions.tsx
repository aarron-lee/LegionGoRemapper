import { createAction } from '@reduxjs/toolkit';

export const setInitialState = createAction<any>('setInitialState');
export const setCurrentGameId = createAction<any>('setCurrentGameId');
