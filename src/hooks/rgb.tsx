import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { ControllerType } from '../backend/constants';
import {
  rgbSlice,
  selectRgbInfo,
  selectRgbProfileDisplayName,
  selectPerGameProfilesEnabled
} from '../redux-modules/rgbSlice';

export enum Colors {
  RED = 'red',
  GREEN = 'green',
  BLUE = 'blue'
}

export const usePerGameRgbProfilesEnabled = () => {
  const isEnabled = useSelector(selectPerGameProfilesEnabled);
  const dispatch = useDispatch();

  const setEnabled = useCallback((enabled: boolean) => {
    return dispatch(rgbSlice.actions.setPerGameProfilesEnabled(enabled));
  }, []);

  return [isEnabled, setEnabled] as any;
};

export const useRgbProfileDisplayName = () =>
  useSelector(selectRgbProfileDisplayName);

export const useRgb = (controller: ControllerType) => {
  const rgbInfo = useSelector(selectRgbInfo(controller));
  const dispatch = useDispatch();

  // const { enabled, red, green, blue, brightness } = rgbInfo as RgbStateType;

  const updateColor = (color: Colors, value: number) => {
    return dispatch(rgbSlice.actions.setColor({ controller, color, value }));
  };

  const setEnabled = (enabled: boolean) => {
    return dispatch(rgbSlice.actions.setEnabled({ controller, enabled }));
  };

  const updateBrightness = (brightness: number) => {
    return dispatch(rgbSlice.actions.setBrightness({ controller, brightness }));
  };

  return [rgbInfo, setEnabled, updateColor, updateBrightness] as any;
};
