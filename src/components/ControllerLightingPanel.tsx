import {
  ToggleField,
  SliderField,
  PanelSection,
  ServerAPI,
  Button,
  gamepadSliderClasses
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
  isTouchpad: true,
};

const ControllerLightingPanel: VFC<{ serverAPI: ServerAPI }> = ({
  serverAPI
}) => {
  const [leftMode] = useRgbMode('LEFT');
  const [rightMode] = useRgbMode('RIGHT');
  // const [H, set_H] = useState<number>(DEFAULT_STATE.H);
    // const [S, setS] = useState<number>(defaultS);
    // const [L, setL] = useState<number>(defaultL);
    // const [A, setA] = useState<number>(defaultA);


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
      brightness: brightnessL,
      speed: speedL,
      hue: hueL
    },
    setIsLeftRgbOn,
    setLeftColor,
    setLeftLedBrightness,
    setLeftRgbColor,
    setLeftSpeed,
    setLeftHue
  ] = useRgb('LEFT');

  const [
    {
      enabled: isRightRgbOn,
      red: redR,
      green: greenR,
      blue: blueR,
      brightness: brightnessR,
      speed: speedR,
      hue: hueR
    },
    setIsRightRgbOn,
    setRightColor,
    setRightLedBrightness,
    setRightRgbColor,
    setRightSpeed,
    setRigthHue
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
            {rightMode !== RgbModes.SOLID && (
              <SliderField
                label="Speed"
                value={speedR}
                showValue={true}
                min={1}
                max={100}
                validValues="range"
                onChange={(value) => setRightSpeed(value)}
              ></SliderField>
            )}
            {rightMode !== RgbModes.DYNAMIC && (
              <>
                
                <div className="ColorPicker_HSlider">
                <SliderField
                  showValue
                  label="Hue"
                  value={hueR} 
                  min={0} 
                  max={359}
                  onChange={(value) => setRigthHue(value)}
                />
                </div>
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
            {leftMode !== RgbModes.SOLID && (
              <SliderField
                label="Speed"
                value={speedL}
                showValue={true}
                min={1}
                max={100}
                validValues="range"
                onChange={(value) => setLeftSpeed(value)}
              ></SliderField>
            )}
            {leftMode !== RgbModes.DYNAMIC && (
              <>
                <div className="ColorPicker_HSlider">
                <SliderField
                  showValue label="Hue"
                  value={hueL} min={0} max={359}
                  onChange={(value) => setLeftHue(value)}
                />
                </div>
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

        <style>
          {`
            .ColorPicker_HSlider .${gamepadSliderClasses.SliderTrack} {
              background: linear-gradient(
                to right,
                hsl(0, 100%, 50%),
                hsl(60, 100%, 50%),
                hsl(120, 100%, 50%),
                hsl(180, 100%, 50%),
                hsl(240, 100%, 50%),
                hsl(300, 100%, 50%),
                hsl(360, 100%, 50%)
              ) !important;
              --left-track-color: #0000 !important;
              --colored-toggles-main-color: #0000 !important;
            }
          `}
        </style>
        

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
