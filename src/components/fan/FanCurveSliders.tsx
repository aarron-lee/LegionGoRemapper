import { useDispatch, useSelector } from 'react-redux';
import { fanSlice, selectActiveFanCurve } from '../../redux-modules/fanSlice';
import {
  PanelSection,
  PanelSectionRow,
  SliderField,
  ToggleField
} from 'decky-frontend-lib';
import { VFC, useState } from 'react';

const DISABLE_KEY = 'legion-go-remapper-disable-fan-curve-limit';

const useDisableLimit = () => {
  const [disableLimits, setDisableLimits] = useState(
    window.localStorage.getItem(DISABLE_KEY) === 'true' || false
  );

  const setLimit = (enable: boolean) => {
    setDisableLimits(enable);
    window.localStorage.setItem(DISABLE_KEY, `${enable}`);
  };

  return { disableLimits, setLimit };
};

const FanCurveSliders: VFC = () => {
  const activeFanCurve = useSelector(selectActiveFanCurve);

  const { disableLimits, setLimit } = useDisableLimit();

  const dispatch = useDispatch();

  const sliders = Object.entries(activeFanCurve).map(
    ([temp, fanSpeed], idx) => {
      const updateFanCurveValue = (temp: string, fanSpeed: number) => {
        if (!disableLimits && idx >= 6 && fanSpeed < 70) {
          fanSpeed = 70;
        }
        return dispatch(fanSlice.actions.updateFanCurve({ temp, fanSpeed }));
      };
      return (
        <>
          <PanelSectionRow>
            <SliderField
              label={`${temp} \u2103`}
              value={fanSpeed}
              showValue
              valueSuffix="%"
              step={5}
              min={5}
              max={115}
              validValues="range"
              bottomSeparator="none"
              key={idx}
              onChange={(newSpeed) => {
                return updateFanCurveValue(temp, newSpeed);
              }}
            />
          </PanelSectionRow>
        </>
      );
    }
  );

  return (
    <PanelSection title={'Temp (\u2103) | Fan Speed (%)'}>
      <PanelSectionRow>
        <ToggleField
          label="Disable Fan Curve Limits"
          checked={disableLimits}
          onChange={setLimit}
        />
      </PanelSectionRow>
      {sliders}
    </PanelSection>
  );
};

export default FanCurveSliders;
