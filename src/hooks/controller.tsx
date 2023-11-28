import { useDispatch, useSelector } from 'react-redux';
import {
  controllerSlice,
  selectButtonRemapAction
  // selectControllerMapping
} from '../redux-modules/controllerSlice';
import { RemapActions, RemappableButtons } from '../backend/constants';

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
