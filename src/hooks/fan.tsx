import { useDispatch, useSelector } from 'react-redux';
import {
  fanSlice,
  selectCustomFanCurvesEnabled,
  selectEnableFullFanSpeedMode,
  selectFanPerGameProfilesEnabled,
  selectSupportsCustomFanCurves
} from '../redux-modules/fanSlice';

export const useEnableFullFanSpeedMode = () => {
  const result = useSelector(selectEnableFullFanSpeedMode);
  const dispatch = useDispatch();

  const setter = (enabled: boolean) => {
    return dispatch(fanSlice.actions.setEnableFullFanSpeedMode(enabled));
  };
  return {
    enableFullFanSpeedMode: result,
    setEnableFullFanSpeedMode: setter
  };
};

export const useSupportsCustomFanCurves = () => {
  const result = useSelector(selectSupportsCustomFanCurves);
  return result;
};

export const useCustomFanCurvesEnabled = () => {
  const enabled = useSelector(selectCustomFanCurvesEnabled);
  const dispatch = useDispatch();

  const setter = (enabled: boolean) => {
    return dispatch(fanSlice.actions.setCustomFanCurvesEnabled(enabled));
  };

  return { customFanCurvesEnabled: enabled, setCustomFanCurvesEnabled: setter };
};

export const useFanPerGameProfilesEnabled = () => {
  const fanPerGameProfilesEnabled = useSelector(
    selectFanPerGameProfilesEnabled
  );
  const dispatch = useDispatch();

  const setter = (enabled: boolean) => {
    return dispatch(fanSlice.actions.setFanPerGameProfilesEnabled(enabled));
  };

  return { fanPerGameProfilesEnabled, setFanPerGameProfilesEnabled: setter };
};
