import { FC } from 'react';
import { DropdownItem } from 'decky-frontend-lib';
import { Gyro, GyroRemapActions } from '../../backend/constants';
import { useGyroRemapAction } from '../../hooks/controller';

type PropType = {
  gyro: Gyro;
};

const GyroRemapActionDropdown: FC<PropType> = ({ gyro }) => {
  const { gyroRemapAction, setGyroRemapAction } = useGyroRemapAction(gyro);

  const dropdownOptions = Object.values(GyroRemapActions).map((action) => {
    return {
      data: action,
      label: `${action.split('_').join(' ')}`,
      value: action
    };
  });

  return (
    <div>
      <DropdownItem
        label={gyro.split('_').join(' ')}
        bottomSeparator="none"
        rgOptions={dropdownOptions.map((o) => {
          return {
            data: o.data,
            label: o.label,
            value: o.value
          };
        })}
        selectedOption={
          dropdownOptions.find((o) => {
            return o.data === gyroRemapAction;
          })?.data || GyroRemapActions.DISABLED
        }
        onChange={(value: any) => {
          setGyroRemapAction(value.data);
        }}
      />
    </div>
  );
};

export default GyroRemapActionDropdown;
