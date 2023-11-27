import { ServerAPI } from 'decky-frontend-lib';
import { useReducer, useEffect } from 'react';
import { ControllerType } from '../backend/constants';
import { extractCurrentGameId } from '../backend/utils';

type StateType = {
  enabled: boolean;
  red: number;
  green: number;
  blue: number;
  brightness: number;
};

enum Actions {
  SET_COLOR,
  SET_BRIGHTNESS,
  TOGGLE_ENABLED,
  SET_ENABLED
}

type ActionType = {
  type: Actions;
  payload?: any;
};

export enum Colors {
  RED = 'red',
  GREEN = 'green',
  BLUE = 'blue'
}

const rgbReducer = (state: any, action: ActionType) => {
  if (action.type === Actions.SET_COLOR && action.payload) {
    let newState = { ...state, [action.payload.color]: action.payload.value };
    return newState;
  }
  if (action.type === Actions.SET_BRIGHTNESS) {
    let newState = { ...state, brightness: action.payload };
    return newState;
  }
  if (action.type === Actions.TOGGLE_ENABLED) {
    let newState = { ...state, enabled: !state.enabled };
    return newState;
  }
  if (action.type === Actions.SET_ENABLED) {
    let newState = { ...state, enabled: Boolean(action.payload) };
    return newState;
  }
  return state;
};

const initialState = {
  enabled: false,
  red: 255,
  green: 255,
  blue: 255,
  brightness: 50
};

const useRgb = (
  //   initialState: StateType,
  controller: ControllerType,
  serverAPI: ServerAPI
) => {
  const [state, dispatch] = useReducer(rgbReducer, initialState);

  const { enabled, red, green, blue, brightness } = state as StateType;

  useEffect(() => {
    const current_game_id = extractCurrentGameId();

    if (enabled) {
      serverAPI.callPluginMethod('rgb_on', { current_game_id, controller });
    } else {
      serverAPI.callPluginMethod('rgb_off', { current_game_id, controller });
    }
  }, [enabled]);

  useEffect(() => {
    const current_game_id = extractCurrentGameId();

    if (enabled) {
      serverAPI.callPluginMethod('rgb_color', {
        controller,
        red,
        green,
        blue,
        brightness,
        current_game_id
      });
    }
  }, [enabled, red, green, blue, brightness]);

  const updateColor = (color: Colors, value: number) => {
    return dispatch({
      type: Actions.SET_COLOR,
      payload: {
        color,
        value
      }
    });
  };

  //   const toggleEnabled = () => {
  //     return dispatch({
  //       type: Actions.TOGGLE_ENABLED
  //     });
  //   };

  const setEnabled = (enabled: boolean) => {
    return dispatch({
      type: Actions.SET_ENABLED,
      payload: enabled
    });
  };

  const updateBrightness = (brightness: number) => {
    return dispatch({
      type: Actions.SET_BRIGHTNESS,
      payload: brightness
    });
  };

  return [state, setEnabled, updateColor, updateBrightness];
};

export default useRgb;
