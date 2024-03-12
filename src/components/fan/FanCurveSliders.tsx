import { useDispatch, useSelector } from 'react-redux';
import { fanSlice, selectActiveFanCurve } from '../../redux-modules/fanSlice';
import { PanelSection, PanelSectionRow, SliderField } from 'decky-frontend-lib';
import { VFC } from 'react';

const FanCurveSliders: VFC = () => {
  const activeFanCurve = useSelector(selectActiveFanCurve);
  const dispatch = useDispatch();

  const sliders = Object.entries(activeFanCurve).map(
    ([temp, fanSpeed], idx) => {
      const updateFanCurveValue = (temp: string, fanSpeed: number) => {
        if (idx >= 6 && fanSpeed < 70) {
          fanSpeed = 70;
        }
        return dispatch(fanSlice.actions.updateFanCurve({ temp, fanSpeed }));
      };
      return (
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
      );
    }
  );

  return (
    <PanelSection title={'Temp (\u2103) | Fan Speed (%)'}>
      {sliders}
    </PanelSection>
  );
};

export default FanCurveSliders;
