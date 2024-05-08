import {
  PanelSection,
  PanelSectionRow,
  SliderField,
  ToggleField
} from 'decky-frontend-lib';
import { useDispatch, useSelector } from 'react-redux';
import { selectAlsEnabled, uiSlice } from '../../redux-modules/uiSlice';
import { pollInfo, smoothTimeInfo } from '../../backend/alsListener';

// let currentBrightness = 40;

const useAlsEnabled = () => {
  const enabledAls = useSelector(selectAlsEnabled);
  const dispatch = useDispatch();

  const setAlsEnabled = (enabled: boolean) => {
    return dispatch(uiSlice.actions.setAlsEnabled(enabled));
  };

  return { enabledAls, setAlsEnabled };
};

export default function () {
  const { enabledAls, setAlsEnabled } = useAlsEnabled();

  const [minPollRate, maxPollRate] = pollInfo.range;
  const [minSmoothTime, maxSmoothTime] = smoothTimeInfo.range;

  return (
    <>
      <PanelSection title="Ambient Light Sensor">
        <PanelSectionRow>
          <ToggleField
            label={'Enable ALS'}
            checked={enabledAls}
            onChange={setAlsEnabled}
          />
        </PanelSectionRow>
        {enabledAls && (
          <>
            <PanelSectionRow>
              <SliderField
                label="Poll Rate (ms)"
                value={100}
                min={minPollRate}
                max={maxPollRate}
                step={pollInfo.step}
                notchTicksVisible
                showValue
              />
            </PanelSectionRow>
            <PanelSectionRow>
              <SliderField
                label="Smooth Time (ms)"
                value={100}
                min={minSmoothTime}
                max={maxSmoothTime}
                step={smoothTimeInfo.step}
                notchTicksVisible
                showValue
              />
            </PanelSectionRow>
          </>
        )}
      </PanelSection>
    </>
  );
}
