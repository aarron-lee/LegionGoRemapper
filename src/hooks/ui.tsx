import { useDispatch, useSelector } from 'react-redux';
import { selectChargeLimitEnabled, uiSlice } from '../redux-modules/uiSlice';

export const useChargeLimitEnabled = () => {
  const chargeLimitEnabled = useSelector(selectChargeLimitEnabled);
  const dispatch = useDispatch();

  const setChargeLimit = (enabled: boolean) => {
    return dispatch(uiSlice.actions.setChargeLimit(enabled));
  };

  return { chargeLimitEnabled, setChargeLimit };
};
