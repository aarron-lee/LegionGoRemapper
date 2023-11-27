import { useDispatch, useSelector } from 'react-redux';
import {
  rgbSlice,
  selectPerGameProfilesEnabled
} from '../redux-modules/rgbSlice';
import { useCallback } from 'react';

export const usePerGameRgbProfilesEnabled = () => {
  const isEnabled = useSelector(selectPerGameProfilesEnabled);
  const dispatch = useDispatch();

  const setEnabled = useCallback((enabled: boolean) => {
    return dispatch(rgbSlice.actions.setPerGameProfilesEnabled(enabled));
  }, []);

  return [isEnabled, setEnabled];
};
