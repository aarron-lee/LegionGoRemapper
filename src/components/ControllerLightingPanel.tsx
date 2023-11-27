import {
  ToggleField,
  SliderField,
  PanelSection,
  ServerAPI,
  Button
} from 'decky-frontend-lib';
import { VFC } from 'react';
import { useState } from 'react';
import {
  useRgb,
  usePerGameRgbProfilesEnabled,
  useRgbProfileDisplayName,
  useRgbMode
} from '../hooks/rgb';
import RgbModeDropdown from './RgbModeDropdown';
import { RgbModes } from '../backend/constants';
const DEFAULT_STATE = {
  isTouchpad: true
};

const ControllerLightingPanel: VFC<{ serverAPI: ServerAPI }> = ({
  serverAPI
}) => {
  const [leftMode] = useRgbMode('LEFT');
  const [rightMode] = useRgbMode('RIGHT');

  const [perGameProfilesEnabled, setPerGameProfilesEnabled] =
    usePerGameRgbProfilesEnabled();
  const displayName = useRgbProfileDisplayName();
  const [isTouchpad, setIsTouchpad] = useState(DEFAULT_STATE.isTouchpad);

  const [showRightOptions, setShowRightOptions] = useState(false);
  const [showLeftOptions, setShowLeftOptions] = useState(false);

  const [
    {
      enabled: isLeftRgbOn,
      red: redL,
      green: greenL,
      blue: blueL,
      brightness: brightnessL
    },
    setIsLeftRgbOn,
    setLeftColor,
    setLeftLedBrightness
    // _setLeftRgbColor
  ] = useRgb('LEFT');

  const [
    {
      enabled: isRightRgbOn,
      red: redR,
      green: greenR,
      blue: blueR,
      brightness: brightnessR
    },
    setIsRightRgbOn,
    setRightColor,
    setRightLedBrightness
    // _setLeftRgbColor
  ] = useRgb('RIGHT');

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
        <ToggleField
          label="Enable Per Game Profiles"
          checked={perGameProfilesEnabled}
          onChange={setPerGameProfilesEnabled}
        />
        <ToggleField
          label="Right Controller LED"
          checked={isRightRgbOn}
          onChange={setIsRightRgbOn}
        />
        {isRightRgbOn && (
          <>
            <Button
              style={{ width: '100%' }}
              onClick={() => setShowRightOptions(!showRightOptions)}
            >
              {showRightOptions ? 'Hide Options' : 'Show Options'}
            </Button>
          </>
        )}
        {showRightOptions && isRightRgbOn && (
          <>
            <RgbModeDropdown controller="RIGHT" />
            <SliderField
              label="Right Stick Brightness"
              value={brightnessR}
              showValue={true}
              min={0}
              max={100}
              validValues="range"
              onChange={(value) => setRightLedBrightness(value)}
            ></SliderField>
            {rightMode !== RgbModes.DYNAMIC && (
              <>
                <SliderField
                  label="Red"
                  value={redR}
                  showValue={true}
                  min={0}
                  max={255}
                  validValues="range"
                  onChange={(value) => {
                    setRightColor('red', value);
                  }}
                />
                <SliderField
                  label="Green"
                  value={greenR}
                  showValue={true}
                  min={0}
                  max={255}
                  validValues="range"
                  onChange={(value) => {
                    setRightColor('green', value);
                  }}
                />
                <SliderField
                  label="Blue"
                  value={blueR}
                  showValue={true}
                  min={0}
                  max={255}
                  validValues="range"
                  onChange={(value) => {
                    setRightColor('blue', value);
                  }}
                />
                <div
                  style={{
                    width: '100%',
                    height: '30px',
                    backgroundColor: `rgb(${redR}, ${greenR}, ${blueR})`,
                    border: '1px solid black',
                    borderRadius: '10px'
                  }}
                />
              </>
            )}
          </>
        )}

        <ToggleField
          label="Left Controller LED"
          checked={isLeftRgbOn}
          onChange={setIsLeftRgbOn}
        />
        {isLeftRgbOn && (
          <>
            <Button
              style={{ width: '100%' }}
              onClick={() => setShowLeftOptions(!showLeftOptions)}
            >
              {showLeftOptions ? 'Hide Options' : 'Show Options'}
            </Button>
          </>
        )}
        {showLeftOptions && isLeftRgbOn && (
          <>
            <RgbModeDropdown controller="LEFT" />
            <SliderField
              label="Left Stick Brightness"
              value={brightnessL}
              showValue={true}
              min={0}
              max={100}
              validValues="range"
              onChange={(value) => setLeftLedBrightness(value)}
            ></SliderField>
            {leftMode !== RgbModes.DYNAMIC && (
              <>
                <SliderField
                  label="Red"
                  value={redL}
                  showValue={true}
                  min={0}
                  max={255}
                  validValues="range"
                  onChange={(value) => {
                    setLeftColor('red', value);
                  }}
                />
                <SliderField
                  label="Green"
                  value={greenL}
                  showValue={true}
                  min={0}
                  max={255}
                  validValues="range"
                  onChange={(value) => {
                    setLeftColor('green', value);
                  }}
                />
                <SliderField
                  label="Blue"
                  value={blueL}
                  showValue={true}
                  min={0}
                  max={255}
                  validValues="range"
                  onChange={(value) => {
                    setLeftColor('blue', value);
                  }}
                />
                <div
                  style={{
                    width: '100%',
                    height: '30px',
                    backgroundColor: `rgb(${redL}, ${greenL}, ${blueL})`,
                    border: '1px solid black',
                    borderRadius: '10px'
                  }}
                />
              </>
            )}
          </>
        )}

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
