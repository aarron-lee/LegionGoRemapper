import { FC, useState } from 'react';
import { DropdownItem, SliderField, NotchLabel } from 'decky-frontend-lib';
import { ControllerType, RgbModes } from '../backend/constants';
import { useRgbMode } from '../hooks/rgb';
import { noConflict } from 'lodash';

type PropType = {
  controller: ControllerType;
};



const RgbModeDropdown: FC<PropType> = ({ controller }) => {
  const [mode, setMode] = useRgbMode(controller);

  const [sliderValue, setSliderValue] = useState(0); // 0 for Solid, 1 for Dynamic, 2 for Blinking

  const handleSliderChange = (value: number) => {
    setSliderValue(value);
    let mode = 'SOLID'
    switch(value){
    case 1: 
      mode = 'DYNAMIC'
      break;
    case 2: 
      mode = 'BLINKING'
      break;
    }
    setMode(mode);
    // Additional logic for when the slider value changes
  };

  const MODES: NotchLabel[] = [
    { notchIndex: 0, label: 'Solid', value: 0 },
    { notchIndex: 1, label: 'Dynamic', value: 1 },
    { notchIndex: 2, label: 'Blinking', value: 2 }
  ];


  const dropdownOptions = Object.values(RgbModes).map((action) => {
    return {
      data: action,
      label: `${action}`,
      value: action
    };
  });

  return (
    <>
      {/* <DropdownItem
        menuLabel={'Mode'}
        description={'RGB Mode'}
        rgOptions={dropdownOptions.map((o) => {
          return {
            data: o.data,
            label: o.label,
            value: o.value
          };
        })}
        selectedOption={
          dropdownOptions.find((o) => {
            return o.data === mode;
          })?.data
        }
        onChange={(value: any) => {
          setMode(value.data);
        }}
      /> */}


      <SliderField
        value={(sliderValue)}
        min={0}
        max={2}
        step={1}
        notchCount={3}
        notchLabels={MODES}
        notchTicksVisible={true}
        showValue={false}
        onChange={handleSliderChange}
      />
    </>
  );
};

export default RgbModeDropdown;
