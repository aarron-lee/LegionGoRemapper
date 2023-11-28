import { PanelSection } from 'decky-frontend-lib';
import { VFC } from 'react';
// import { useState } from 'react';
import { useRgbProfileDisplayName } from '../../hooks/rgb';
import { RgbPerGameProfilesToggle } from './RgbPerGameProfilesToggle';
import { RgbSettings } from './RgbSettings';

const ControllerLightingPanel: VFC = () => {
  const displayName = useRgbProfileDisplayName();

  let title =
    displayName === 'Default'
      ? 'Controller Lighting - Default'
      : `Controller Lighting - ${displayName.substring(0, 10)}...`;

  return (
    <PanelSection title={title}>
      <div>
        <RgbPerGameProfilesToggle />
        <RgbSettings controller="RIGHT" />
        <RgbSettings controller="LEFT" />
      </div>
    </PanelSection>
  );
};

export default ControllerLightingPanel;
