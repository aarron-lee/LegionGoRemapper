import { useDispatch, useSelector } from 'react-redux';
import {
  controllerSlice,
  selectButtonRemapAction,
  selectControllerPerGameProfilesEnabled,
  selectControllerProfileDisplayName,
  selectTouchpadEnabled
} from '../redux-modules/controllerSlice';
import { RemapActions, RemappableButtons } from '../backend/constants';

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

export const useControllerProfileDisplayName = () => {
  return useSelector(selectControllerProfileDisplayName);
};
