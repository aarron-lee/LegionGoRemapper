import { ToggleField, PanelSection, ServerAPI } from 'decky-frontend-lib';
import { VFC } from 'react';
import { useState } from 'react';
import { useRgbProfileDisplayName } from '../../hooks/rgb';
import { RgbPerGameProfilesToggle } from './RgbPerGameProfilesToggle';
import { RgbSettings } from './RgbSettings';

const DEFAULT_STATE = {
  isTouchpad: true
};

const ControllerLightingPanel: VFC<{ serverAPI: ServerAPI }> = ({
  serverAPI
}) => {
  const displayName = useRgbProfileDisplayName();
  const [isTouchpad, setIsTouchpad] = useState(DEFAULT_STATE.isTouchpad);

  const TPadToggleChange = (value: boolean) => {
    setIsTouchpad(value);
    console.log(`Toggle value: ${value}`);
    serverAPI!.callPluginMethod('set_touchpad', { enable: value });
  };

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

        <ToggleField
          label="Touchpad"
          checked={isTouchpad}
          onChange={(value) => TPadToggleChange(value)}
        ></ToggleField>
      </div>
    </PanelSection>
  );
};

export default ControllerLightingPanel;
