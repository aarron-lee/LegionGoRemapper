import { FC } from 'react';
import { SliderField, NotchLabel } from 'decky-frontend-lib';
import { ControllerType } from '../../backend/constants';
import { useRgbMode } from '../../hooks/rgb';

enum Mode {
  SOLID = 0,
  DYNAMIC = 1,
  PULSE = 2
}

type PropType = {
  controller: ControllerType;
};

const RgbModeSlider: FC<PropType> = ({ controller }) => {
  const [mode, setMode] = useRgbMode(controller);

  const handleSliderChange = (value: number) => {
    return setMode(Mode[value]);
  };

  const MODES: NotchLabel[] = [
    { notchIndex: 0, label: 'Solid', value: 0 },
    { notchIndex: 1, label: 'Dynamic', value: 1 },
    { notchIndex: 2, label: 'Pulse', value: 2 }
  ];

  // known bug: typescript has incorrect type for reverse mapping from enums
  const sliderValue = Mode[mode] as any;

  return (
    <>
      <SliderField
        value={sliderValue}
        min={0}
        max={2}
        step={1}
        notchCount={3}
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
