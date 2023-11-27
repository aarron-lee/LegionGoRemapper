import { setCurrentGameId } from '../redux-modules/extraActions';
import { store } from '../redux-modules/store';
import { extractCurrentGameId } from './utils';

let intervalId: undefined | number;

export const currentGameIdListener = () => {
  extractCurrentGameId;
  intervalId = window.setInterval(() => {
    const currentGameId = extractCurrentGameId();
    store.dispatch(setCurrentGameId(currentGameId));
  }, 1000);

  return () => clearInterval(intervalId);
};
