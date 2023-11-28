import {
  ToggleField,
  SliderField,
  PanelSection,
  ServerAPI,
  gamepadSliderClasses,
  ButtonItem
} from 'decky-frontend-lib';
import { VFC } from 'react';
import { useState } from 'react';
import {
  useRgb,
  usePerGameRgbProfilesEnabled,
  useRgbProfileDisplayName,
  useRgbMode
} from '../hooks/rgb';
import RgbModeSlider from './RgbModeSlider';
import { RgbModes } from '../backend/constants';
import { IoMdArrowDropdown, IoMdArrowDropup } from 'react-icons/io';

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

  const leftRgb = useRgb('LEFT');
  const {
    enabled: isLeftRgbOn,
    brightness: brightnessL,
    speed: speedL,
    hue: hueL
  } = leftRgb.rgbInfo;

  const rightRgb = useRgb('RIGHT');
  const {
    enabled: isRightRgbOn,
    brightness: brightnessR,
    speed: speedR,
    hue: hueR
  } = rightRgb.rgbInfo;

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
          onChange={rightRgb.setEnabled}
          bottomSeparator={isRightRgbOn ? 'none' : 'thick'}
        />
        {isRightRgbOn && (
          <>
            <ButtonItem
              layout={'below'}
              bottomSeparator={showRightOptions ? 'none' : 'thick'}
              style={{
                width: '100%',
                height: '20px',
                display: 'flex', // Set the display to flex
                justifyContent: 'center', // Center align horizontally
                alignItems: 'center' // Center align vertically
              }}
              onClick={() => setShowRightOptions(!showRightOptions)}
            >
              {showRightOptions ? <IoMdArrowDropup /> : <IoMdArrowDropdown />}
            </ButtonItem>
          </>
        )}
        {showRightOptions && isRightRgbOn && (
          <>
            <RgbModeSlider controller="RIGHT" />
            <SliderField
              label="R-Stick Brightness"
              valueSuffix="%"
              value={brightnessR}
              showValue={true}
              min={1}
              max={100}
              validValues="range"
              bottomSeparator={'none'}
              onChange={(value) => rightRgb.updateBrightness(value)}
            ></SliderField>
            {rightMode !== RgbModes.SOLID && (
              <SliderField
                label="Speed"
                valueSuffix="%"
                value={speedR}
                showValue={true}
                min={1}
                max={100}
                validValues="range"
                onChange={(value) => rightRgb.setSpeed(value)}
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
                    validValues="range"
                    bottomSeparator="thick"
                    onChange={(value) => rightRgb.setHue(value)}
                  />
                </div>
              </>
            )}
          </>
        )}

        <ToggleField
          label="Left Controller LED"
          checked={isLeftRgbOn}
          bottomSeparator={isLeftRgbOn ? 'none' : 'thick'}
          onChange={leftRgb.setEnabled}
        />
        {isLeftRgbOn && (
          <>
            <ButtonItem
              layout={'below'}
              bottomSeparator={'thick'}
              style={{
                width: '100%',
                height: '20px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
              onClick={() => setShowLeftOptions(!showLeftOptions)}
            >
              {showLeftOptions ? <IoMdArrowDropup /> : <IoMdArrowDropdown />}
            </ButtonItem>
          </>
        )}
        {showLeftOptions && isLeftRgbOn && (
          <>
            <RgbModeSlider controller="LEFT" />
            <SliderField
              label="L-Stick Brightness"
              valueSuffix="%"
              value={brightnessL}
              showValue={true}
              min={1}
              max={100}
              validValues="range"
              bottomSeparator={'none'}
              onChange={(value) => leftRgb.updateBrightness(value)}
            ></SliderField>
            {leftMode !== RgbModes.SOLID && (
              <SliderField
                label="Speed"
                valueSuffix="%"
                value={speedL}
                showValue={true}
                min={1}
                max={100}
                validValues="range"
                onChange={(value) => leftRgb.setSpeed(value)}
              ></SliderField>
            )}
            {leftMode !== RgbModes.DYNAMIC && (
              <>
                <div className="ColorPicker_HSlider">
                  <SliderField
                    showValue
                    label="Hue"
                    value={hueL}
                    min={0}
                    max={359}
                    validValues="range"
                    bottomSeparator="thick"
                    onChange={(value) => leftRgb.setHue(value)}
                  />
                </div>
                {/* <div
                  style={{
                    width: '100%',
                    height: '30px',
                    backgroundColor: `rgb(${redL}, ${greenL}, ${blueL})`,
                    border: '1px solid black',
                    borderRadius: '10px'
                  }}
                /> */}
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
