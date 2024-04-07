import { FC } from 'react';
import { Gyro, RemappableButtons } from '../../backend/constants';
import RemapActionDropdown from './RemapActionDropdown';
import {
  Field,
  PanelSection,
  PanelSectionRow,
  ToggleField
} from 'decky-frontend-lib';
import {
  useControllerPerGameEnabled,
  useControllerProfileDisplayName,
  useControllerRemappingEnabled,
  useTouchpadEnabled
} from '../../hooks/controller';
import { IconRow } from '../IconRow';
import GyroRemapSlider from './GyroRemapSlider';

const RemapButtons: FC = () => {
  const btns = Object.values(RemappableButtons);
  const gyros = Object.values(Gyro);
  const displayName = useControllerProfileDisplayName();
  const { controllerPerGameEnabled, setControllerPerGameEnabled } =
    useControllerPerGameEnabled();
  const { controllerRemappingEnabled, setControllerRemappingEnabled } =
    useControllerRemappingEnabled();

  const { touchpadEnabled, setTouchpad } = useTouchpadEnabled();

  const title = controllerPerGameEnabled
    ? `Remap Buttons -\n${displayName.substring(0, 20)}${
        displayName.length > 20 ? '...' : ''
      }`
    : 'Remap Buttons';

  return (
    <>
      <PanelSection title={title}>
        <PanelSectionRow>
          <ToggleField
            label={'Enable controller remaps'}
            checked={controllerRemappingEnabled}
            onChange={setControllerRemappingEnabled}
          />
        </PanelSectionRow>
        {controllerRemappingEnabled && (
          <>
            <PanelSectionRow>
              <Field disabled>
                ⚠️ WARNING ⚠️ - Don't use these remapping features with
                Controller Emulators. If you are using Handheld Daemon (hhd),
                use the Dualsense Edge controller + remap back buttons with
                Steam Input
              </Field>
            </PanelSectionRow>
            <PanelSectionRow>
              <ToggleField
                label={'Enable Per Game Remaps'}
                checked={controllerPerGameEnabled}
                onChange={setControllerPerGameEnabled}
              />
            </PanelSectionRow>
            <ToggleField
              label="Touchpad"
              checked={touchpadEnabled}
              onChange={(value) => setTouchpad(value)}
            ></ToggleField>
            {btns.map((btn, idx) => {
              return (
                <IconRow btn={btn} key={idx}>
                  <RemapActionDropdown btn={btn} />
                </IconRow>
              );
            })}
            {gyros.map((gyro, idx) => {
              return <GyroRemapSlider gyro={gyro} key={idx} />;
            })}
          </>
        )}
      </PanelSection>
    </>
  );
};

export default RemapButtons;
