import { FC } from 'react';
import { NotchLabel, SliderField } from 'decky-frontend-lib';
import { Gyro, GyroRemapActions } from '../../backend/constants';
import { useGyroRemapAction } from '../../hooks/controller';

type PropType = {
  gyro: Gyro;
};

export enum GyroModes {
  DISABLED = 0,
  LEFT_JOYSTICK = 1,
  RIGHT_JOYSTICK = 2
}

const MODES: NotchLabel[] = [
  {
    notchIndex: GyroModes.DISABLED,
    label: 'Disabled',
    value: GyroModes.DISABLED
  },
  {
    notchIndex: GyroModes.LEFT_JOYSTICK,
    label: 'L-Joystick',
    value: GyroModes.LEFT_JOYSTICK
  },
  {
    notchIndex: GyroModes.RIGHT_JOYSTICK,
    label: 'R-Joystick',
    value: GyroModes.RIGHT_JOYSTICK
  }
];

const GyroRemapActionDropdown: FC<PropType> = ({ gyro }) => {
  const { gyroRemapAction, setGyroRemapAction } = useGyroRemapAction(gyro);

  const handleChange = (value: number) => {
    // known bug: typescript has wrong type for reverse mappings
    const newMode = GyroModes[value] as GyroRemapActions;
    return setGyroRemapAction(newMode);
  };

  return (
    <SliderField
      label={gyro.split('_').join(' ')}
      value={GyroModes[gyroRemapAction]}
      min={0}
      max={2}
      step={1}
      notchCount={3}
      notchLabels={MODES}
      notchTicksVisible
      showValue={false}
      bottomSeparator="none"
      onChange={handleChange}
    />
  );
};

export default GyroRemapActionDropdown;
