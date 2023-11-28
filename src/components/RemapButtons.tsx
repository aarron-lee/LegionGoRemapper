import { FC } from 'react';
import { RemappableButtons } from '../backend/constants';
import RemapActionDropdown from './RemapActionDropdown';
import { PanelSection, PanelSectionRow, ToggleField } from 'decky-frontend-lib';
import { useControllerPerGameEnabled } from '../hooks/controller';

const RemapButtons: FC = () => {
  const btns = Object.values(RemappableButtons);
  const { controllerPerGameEnabled, setControllerPerGameEnabled } =
    useControllerPerGameEnabled();

  return (
    <PanelSection title="Remap Buttons">
      <PanelSectionRow>
        <ToggleField
          label="Enable Per Game Controller Remaps"
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
