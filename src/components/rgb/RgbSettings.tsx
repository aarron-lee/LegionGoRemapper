import {
  ToggleField,
  SliderField,
  ButtonItem,
  gamepadSliderClasses
} from 'decky-frontend-lib';
import { FC, useState } from 'react';
import { useRgb, useRgbMode } from '../../hooks/rgb';
import RgbModeSlider from './RgbModeSlider';
import { RgbModes, ControllerType } from '../../backend/constants';
import { IoMdArrowDropdown, IoMdArrowDropup } from 'react-icons/io';

const labelMap = {
  RIGHT: 'Right',
  LEFT: 'Left'
};

const HIDE_COLOR_PICKER_MODES = [
  RgbModes.DYNAMIC,
  RgbModes.SPIRAL
]

export const RgbSettings: FC<{ controller: ControllerType }> = ({
  controller
}) => {
  const rgb = useRgb(controller);
  const { enabled, brightness, speed, hue } = rgb.rgbInfo;
  const [showOptions, setShowOptions] = useState(false);
  const [mode] = useRgbMode(controller);

  return (
    <>
      <ToggleField
        label={`${labelMap[controller]} Controller LED`}
        checked={enabled}
        onChange={rgb.setEnabled}
        bottomSeparator={enabled ? 'none' : 'thick'}
      />
      {enabled && (
        <>
          <ButtonItem
            layout={'below'}
            bottomSeparator={showOptions ? 'none' : 'thick'}
            style={{
              width: '100%',
              height: '20px',
              display: 'flex', // Set the display to flex
              justifyContent: 'center', // Center align horizontally
              alignItems: 'center' // Center align vertically
            }}
            onClick={() => setShowOptions(!showOptions)}
          >
            {showOptions ? <IoMdArrowDropup /> : <IoMdArrowDropdown />}
          </ButtonItem>
        </>
      )}
      {showOptions && enabled && (
        <>
          <RgbModeSlider controller={controller} />
          <SliderField
            label={`${controller[0]}-Stick Brightness`}
            valueSuffix="%"
            value={brightness}
            showValue={true}
            min={1}
            max={100}
            validValues="range"
            bottomSeparator={'none'}
            onChange={(value) => rgb.updateBrightness(value)}
          ></SliderField>
          {mode !== RgbModes.SOLID && (
            <SliderField
              label="Speed"
              valueSuffix="%"
              value={speed}
              showValue={true}
              min={1}
              max={100}
              validValues="range"
              onChange={(value) => rgb.setSpeed(value)}
            ></SliderField>
          )}
          {!HIDE_COLOR_PICKER_MODES.includes(mode) && (
            <>
              <div className="ColorPicker_HSlider">
                <SliderField
                  showValue
                  label="Hue"
                  value={hue}
                  min={0}
                  max={359}
                  validValues="range"
                  bottomSeparator="thick"
                  onChange={(value) => rgb.setHue(value)}
                />
              </div>
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
        </>
      )}
    </>
  );
};
