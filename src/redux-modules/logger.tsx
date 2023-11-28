import { logInfo } from '../backend/utils';

export const logger = (store: any) => (next: any) => (action: any) => {
  const { type } = action;
  logInfo('before-------------');
  logInfo(type);
  logInfo(action.payload);
  logInfo(store.getState());
  logInfo('-------------');

  const result = next(action);

  logInfo('after-------------');
  logInfo(type);
  logInfo(action.payload);
  logInfo(store.getState());
  logInfo('-------------');
  return result;
};
