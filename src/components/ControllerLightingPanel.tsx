import {
  ToggleField,
  SliderField,
  PanelSection,
  ServerAPI,
  Dropdown,
  DropdownItem,
  TextField,
  ButtonItem,
  Button
} from 'decky-frontend-lib';
import { VFC } from 'react';
import { useState } from 'react';
const DEFAULT_STATE = {
  ledR_b: 50,
  ledL_b: 50,
  isRigthRgbOn: false,
  isLeftRgbOn: false,
  isTouchpad: true,

  red: 255,
  green: 255,
  blue: 255
};

const ControllerLightingPanel: VFC<{ serverAPI: ServerAPI }> = ({
  serverAPI
}) => {
  const [ledRightBrightness, setRightLedBrightness] = useState(
    DEFAULT_STATE.ledR_b
  );
  const [ledLeftBrightness, setLeftLedBrightness] = useState(
    DEFAULT_STATE.ledL_b
  );
  const [isLeftRgbOn, setIsLeftRgbOn] = useState(DEFAULT_STATE.isLeftRgbOn);
  const [isRightRgbOn, setIsRightRgbOn] = useState(DEFAULT_STATE.isRigthRgbOn);
  const [isTouchpad, setIsTouchpad] = useState(DEFAULT_STATE.isTouchpad);

  const [redR, setRedR] = useState(DEFAULT_STATE.red);
  const [greenR, setGreenR] = useState(DEFAULT_STATE.green);
  const [blueR, setBlueR] = useState(DEFAULT_STATE.blue);
  const [redL, setRedL] = useState(DEFAULT_STATE.red);
  const [greenL, setGreenL] = useState(DEFAULT_STATE.green);
  const [blueL, setBlueL] = useState(DEFAULT_STATE.blue);

  const [showRightOptions, setShowRightOptions] = useState(false);
  const [showLeftOptions, setShowLeftOptions] = useState(false);

  const handleSliderChange = (controller: string, newValue: number) => {
    let r = 100;
    let g = 100;
    let b = 100;
    if (controller === 'LEFT') {
      setLeftLedBrightness(newValue);
      r = redL;
      g = greenL;
      b = blueL;
    } else if (controller === 'RIGHT') {
      setRightLedBrightness(newValue);
      r = redR;
      g = greenR;
      b = blueR;
    }
    console.log(`New brightness: ${newValue}`);
    serverAPI!.callPluginMethod('rgb_brightness', {
      controller: controller,
      value_str: newValue,
      red: r,
      blue: b,
      green: g
    });
  };
  const handleToggleChange = (controller: string, value: boolean) => {
    if (controller === 'LEFT') {
      setIsLeftRgbOn(value);
    } else if (controller === 'RIGHT') {
      setIsRightRgbOn(value);
    }
    console.log(`Toggle value: ${value}`);
    const method = value ? 'rgb_on' : 'rgb_off';
    serverAPI!.callPluginMethod(method, { controller: controller });
  };
  const TPadToggleChange = (value: boolean) => {
    setIsTouchpad(value);
    console.log(`Toggle value: ${value}`);
    serverAPI!.callPluginMethod('set_touchpad', { enable: value });
  };

  const handleColorChange = (controller: string) => {
    let ledB = 100;
    let r = 100;
    let g = 100;
    let b = 100;
    if (controller === 'LEFT') {
      ledB = ledLeftBrightness;
      r = redL;
      g = greenL;
      b = blueL;
    } else if (controller === 'RIGHT') {
      ledB = ledRightBrightness;
      r = redR;
      g = greenR;
      b = blueR;
    }
    const rgbColor = `rgb(${r}, ${g}, ${b})`;
    console.log(rgbColor);
    serverAPI!.callPluginMethod('rgb_color', {
      controller: controller,
      red: r,
      blue: b,
      green: g,
      brightness: ledB
    });
  };
  return (
    <PanelSection title="Controller Lighting">
      <div>
        <ToggleField
          label="Right Controller LED"
          checked={isRightRgbOn}
          onChange={(value) => handleToggleChange('RIGHT', value)}
        ></ToggleField>
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
            <SliderField
              label="Right Stick Brightness"
              value={ledRightBrightness}
              showValue={true}
              min={0}
              max={100}
              validValues="range"
              onChange={(value) => handleSliderChange('RIGHT', value)}
            ></SliderField>
            <>
              <SliderField
                label="Red"
                value={redR}
                showValue={true}
                min={0}
                max={255}
                validValues="range"
                onChange={(value) => {
                  setRedR(value);
                  handleColorChange('RIGHT');
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
                  setGreenR(value);
                  handleColorChange('RIGHT');
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
                  setBlueR(value);
                  handleColorChange('RIGHT');
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
          </>
        )}

        <ToggleField
          label="Left Controller LED"
          checked={isLeftRgbOn}
          onChange={(value) => handleToggleChange('LEFT', value)}
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
            <SliderField
              label="Left Stick Brightness"
              value={ledLeftBrightness}
              showValue={true}
              min={0}
              max={100}
              validValues="range"
              onChange={(value) => handleSliderChange('LEFT', value)}
            ></SliderField>
            <>
              <SliderField
                label="Red"
                value={redL}
                showValue={true}
                min={0}
                max={255}
                validValues="range"
                onChange={(value) => {
                  setRedL(value);
                  handleColorChange('LEFT');
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
                  setGreenL(value);
                  handleColorChange('LEFT');
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
                  setBlueL(value);
                  handleColorChange('LEFT');
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
