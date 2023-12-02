import { FC } from 'react';
import { SliderField, NotchLabel } from 'decky-frontend-lib';
import { ControllerType } from '../../backend/constants';
import { useRgbMode } from '../../hooks/rgb';
import { capitalize } from 'lodash';

enum Mode {
  SOLID = 0,
  DYNAMIC = 1,
  PULSE = 2,
  SPIRAL = 3
}

type PropType = {
  controller: ControllerType;
};

const RgbModeSlider: FC<PropType> = ({ controller }) => {
  const [mode, setMode] = useRgbMode(controller);

  const handleSliderChange = (value: number) => {
    return setMode(Mode[value]);
  };

  const MODES: NotchLabel[] = Object.keys(Mode).filter(key => isNaN(Number(key))).map((mode, idx) => {
    return { notchIndex: idx, label: capitalize(mode), value: idx }
  })

  // known bug: typescript has incorrect type for reverse mapping from enums
  const sliderValue = Mode[mode] as any;

  return (
    <>
      <SliderField
        value={sliderValue}
        min={0}
        max={MODES.length-1}
        step={1}
        notchCount={MODES.length}
        notchLabels={MODES}
        notchTicksVisible={true}
        showValue={false}
        bottomSeparator={'none'}
        onChange={handleSliderChange}
      />
    </>
  );
};

export default RgbModeSlider;
