import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { ControllerType, RgbModes } from '../backend/constants';
import {
  rgbSlice,
  selectRgbInfo,
  selectRgbProfileDisplayName,
  selectPerGameProfilesEnabled,
  selectRgbMode
} from '../redux-modules/rgbSlice';

export enum Colors {
  RED = 'red',
  GREEN = 'green',
  BLUE = 'blue'
}

export const useRgbMode = (controller: ControllerType) => {
  const mode = useSelector(selectRgbMode(controller));
  const dispatch = useDispatch();

  const setMode = useCallback(
    (mode: RgbModes) => {
      return dispatch(rgbSlice.actions.setRgbMode({ controller, mode }));
    },
    [controller]
  );

  return [mode, setMode] as any;
};

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

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;

  let c = (1 - Math.abs(2 * l - 1)) * s,
      x = c * (1 - Math.abs((h / 60) % 2 - 1)),
      m = l - c / 2,
      r = 0,
      g = 0,
      b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return [r, g, b];
}

export const useRgb = (controller: ControllerType) => {
  const rgbInfo = useSelector(selectRgbInfo(controller));
  const dispatch = useDispatch();

  //const { enabled, red, green, blue, brightness } = rgbInfo as RgbStateType;

  const updateColor = (color: Colors, value: number) => {
    return dispatch(rgbSlice.actions.setColor({ controller, color, value }));
  };

  // usage: setRgbColor(255, 255, 255)
  const setRgbColor = (red: number, green: number, blue: number) => {
    return dispatch(
      rgbSlice.actions.setRgbColor({ controller, red, green, blue })
    );
  };

  const setEnabled = (enabled: boolean) => {
    return dispatch(rgbSlice.actions.setEnabled({ controller, enabled }));
  };

  const updateBrightness = (brightness: number) => {
    return dispatch(rgbSlice.actions.setBrightness({ controller, brightness }));
  };

  const setSpeed = (speed: number) => {
    return dispatch(rgbSlice.actions.setSpeed({ controller, speed }));
  };
  const setHue = (hue: number) => {
    //Convert hue to RGB
    const [r, g, b] = hslToRgb(hue, 100, 50);
    // Dispatch action to update RGB values
    dispatch(
      rgbSlice.actions.setRgbColor({ controller, red: r, green: g, blue: b })
    );
  }
  

  return [
    rgbInfo,
    setEnabled,
    updateColor,
    updateBrightness,
    setRgbColor,
    setSpeed,
    setHue
  ] as any;
};
