import { PanelSection, ToggleField } from 'decky-frontend-lib';
import { VFC } from 'react';
import {
  useEnableRgbControl,
  usePowerLed,
  useRgbProfileDisplayName,
  useSeparateRgbManagementEnabled
} from '../../hooks/rgb';
import { RgbPerGameProfilesToggle } from './RgbPerGameProfilesToggle';
import { RgbSettings } from './RgbSettings';
import { EnableRgbControlToggle } from './EnableRgbControlToggle';

const ControllerLightingPanel: VFC = () => {
  const displayName = useRgbProfileDisplayName();
  const { rgbControlEnabled } = useEnableRgbControl();
  const { powerLedEnabled, setPowerLed } = usePowerLed();
  const separateRgbManagementEnabled = useSeparateRgbManagementEnabled();

  let title =
    displayName === 'Default'
      ? 'Controller Lighting'
      : `Controller Lighting - ${displayName.substring(0, 10)}...`;

  return (
    <PanelSection title={title}>
      <ToggleField
        label="Enable Power LED"
        checked={powerLedEnabled}
        onChange={setPowerLed}
      />
      <EnableRgbControlToggle />
      {rgbControlEnabled && (
        <>
          <RgbPerGameProfilesToggle />
          <RgbSettings controller="RIGHT" />
          {separateRgbManagementEnabled && <RgbSettings controller="LEFT" />}
        </>
      )}
    </PanelSection>
  );
};

export default ControllerLightingPanel;
