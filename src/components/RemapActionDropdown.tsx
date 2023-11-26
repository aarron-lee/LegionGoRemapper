import { useState, FC } from 'react';
import { DropdownItem } from 'decky-frontend-lib';
import { RemapActions, RemappableButtons } from '../backend/constants';

type PropType = {
  label: string;
  btn: RemappableButtons;
  description?: string;
  onChange?: any;
  logInfo?: any;
};

const RemapActionDropdown: FC<PropType> = ({ label, btn, onChange }) => {
  const [selected, setSelected] = useState<RemapActions>(RemapActions.DISABLED);
  const dropdownOptions = Object.values(RemapActions).map((action) => {
    return {
      data: action,
      label: `${action}`,
      value: action
    };
  });

  return (
    <>
      <DropdownItem
        menuLabel={label}
        description={btn}
        rgOptions={dropdownOptions.map((o) => {
          return {
            data: o.data,
            label: o.label,
            value: o.value
          };
        })}
        selectedOption={dropdownOptions.find((o) => {
          return o.data === selected;
        })}
        onChange={(value: any) => {
          onChange && onChange(btn, value.data);
          setSelected(value.data);
        }}
      />
    </>
  );
};

export default RemapActionDropdown;
