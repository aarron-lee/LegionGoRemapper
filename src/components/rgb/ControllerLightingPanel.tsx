import { PanelSection } from 'decky-frontend-lib';
import { VFC } from 'react';
import {
  useEnableRgbControl,
  useRgbProfileDisplayName,
  useSeparateRgbManagementEnabled
} from '../../hooks/rgb';
import { RgbPerGameProfilesToggle } from './RgbPerGameProfilesToggle';
import { RgbSettings } from './RgbSettings';
import { EnableRgbControlToggle } from './EnableRgbControlToggle';

const ControllerLightingPanel: VFC = () => {
  const displayName = useRgbProfileDisplayName();
  const { rgbControlEnabled } = useEnableRgbControl();
  const separateRgbManagementEnabled = useSeparateRgbManagementEnabled();

  let title =
    displayName === 'Default'
      ? 'Controller Lighting'
      : `Controller Lighting - ${displayName.substring(0, 10)}...`;

  return (
    <PanelSection title={title}>
      <div>
        <EnableRgbControlToggle />
        {rgbControlEnabled && (
          <>
            <RgbPerGameProfilesToggle />
            <RgbSettings controller="RIGHT" />
            {separateRgbManagementEnabled && <RgbSettings controller="LEFT" />}
          </>
        )}
      </div>
    </PanelSection>
  );
};

export default ControllerLightingPanel;
