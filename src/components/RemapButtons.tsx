import { FC } from 'react';
import { RemappableButtons } from '../backend/constants';
import RemapActionDropdown from './RemapActionDropdown';
import { PanelSection, PanelSectionRow, ToggleField } from 'decky-frontend-lib';
import {
  useControllerPerGameEnabled,
  useControllerProfileDisplayName
} from '../hooks/controller';

const RemapButtons: FC = () => {
  const btns = Object.values(RemappableButtons);
  const displayName = useControllerProfileDisplayName();
  const { controllerPerGameEnabled, setControllerPerGameEnabled } =
    useControllerPerGameEnabled();

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
        {btns.map((btn, idx) => {
          return <RemapActionDropdown label={`${btn}`} btn={btn} key={idx} />;
        })}
      </PanelSectionRow>
    </PanelSection>
  );
};

export default RemapButtons;
