import { FC } from 'react';
import { DropdownItem } from 'decky-frontend-lib';
import { ControllerType, RgbModes } from '../backend/constants';
import { useRgbMode } from '../hooks/rgb';

type PropType = {
  controller: ControllerType;
};

const RgbModeDropdown: FC<PropType> = ({ controller }) => {
  const [mode, setMode] = useRgbMode(controller);

  const dropdownOptions = Object.values(RgbModes).map((action) => {
    return {
      data: action,
      label: `${action}`,
      value: action
    };
  });

  return (
    <>
      <DropdownItem
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
      />
    </>
  );
};

export default RgbModeDropdown;
