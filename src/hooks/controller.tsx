import { useDispatch, useSelector } from 'react-redux';
import {
  controllerSlice,
  selectButtonRemapAction,
  selectControllerPerGameProfilesEnabled,
  selectControllerProfileDisplayName,
  selectGyroRemapAction,
  selectTouchpadEnabled
} from '../redux-modules/controllerSlice';
import {
  Gyro,
  GyroRemapActions,
  RemapActions,
  RemappableButtons
} from '../backend/constants';

export const useTouchpadEnabled = () => {
  const touchpadEnabled = useSelector(selectTouchpadEnabled);
  const dispatch = useDispatch();

  const setTouchpad = (enabled: boolean) => {
    return dispatch(controllerSlice.actions.setTouchpad(enabled));
  };
  return { touchpadEnabled, setTouchpad };
};

export const useControllerPerGameEnabled = () => {
  const controllerPerGameEnabled = useSelector(
    selectControllerPerGameProfilesEnabled
  );
  const dispatch = useDispatch();

  const setControllerPerGameEnabled = (enabled: boolean) => {
    return dispatch(controllerSlice.actions.setPerGameProfilesEnabled(enabled));
  };

  return { controllerPerGameEnabled, setControllerPerGameEnabled };
};

export const useRemapAction = (btn: RemappableButtons) => {
  const remapAction = useSelector(selectButtonRemapAction(btn));
  const dispatch = useDispatch();

  const setRemapAction = (remapAction: RemapActions) => {
    return dispatch(
      controllerSlice.actions.remapButton({ button: btn, remapAction })
    );
  };

  return { remapAction, setRemapAction };
};

export const useGyroRemapAction = (gyro: Gyro) => {
  const gyroRemapAction = useSelector(selectGyroRemapAction(gyro));
  const dispatch = useDispatch();

  const setGyroRemapAction = (remapAction: GyroRemapActions) => {
    return dispatch(
      controllerSlice.actions.setGyro({ gyro, remapAction: remapAction })
    );
  };
  return { gyroRemapAction, setGyroRemapAction };
};

export const useControllerProfileDisplayName = () => {
  return useSelector(selectControllerProfileDisplayName);
};
