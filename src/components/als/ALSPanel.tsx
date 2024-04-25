import { PanelSection, PanelSectionRow, ToggleField } from 'decky-frontend-lib';
import { useDispatch, useSelector } from 'react-redux';
import { selectAlsEnabled, uiSlice } from '../../redux-modules/uiSlice';

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
      </PanelSection>
    </>
  );
}
