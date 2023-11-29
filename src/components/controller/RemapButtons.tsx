import { FC } from 'react';
import { Gyro, RemappableButtons } from '../../backend/constants';
import RemapActionDropdown from './RemapActionDropdown';
import { PanelSection, PanelSectionRow, ToggleField } from 'decky-frontend-lib';
import {
  useControllerPerGameEnabled,
  useControllerProfileDisplayName,
  useTouchpadEnabled
} from '../../hooks/controller';
import { IconRow } from '../IconRow';
import GyroRemapActionDropdown from './gyroRemapActionDropdown';

const RemapButtons: FC = () => {
  const btns = Object.values(RemappableButtons);
  const gyros = Object.values(Gyro);
  const displayName = useControllerProfileDisplayName();
  const { controllerPerGameEnabled, setControllerPerGameEnabled } =
    useControllerPerGameEnabled();

  const { touchpadEnabled, setTouchpad } = useTouchpadEnabled();

  const title = controllerPerGameEnabled
    ? `Remap Buttons -\n${displayName.substring(0, 20)}${
        displayName.length > 20 ? '...' : ''
      }`
    : 'Remap Buttons';

  return (
    <PanelSection title={title}>
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
        return <GyroRemapActionDropdown gyro={gyro} key={idx} />;
      })}
    </PanelSection>
  );
};

export default RemapButtons;
