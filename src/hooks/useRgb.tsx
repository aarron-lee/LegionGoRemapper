import { useDispatch, useSelector } from 'react-redux';
import { ControllerType } from '../backend/constants';
import { rgbSlice, selectRgbInfo } from '../redux-modules/rgbSlice';

type RgbStateType = {
  enabled: boolean;
  red: number;
  green: number;
  blue: number;
  brightness: number;
};

export enum Colors {
  RED = 'red',
  GREEN = 'green',
  BLUE = 'blue'
}

const useRgb = (controller: ControllerType) => {
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

export default useRgb;
