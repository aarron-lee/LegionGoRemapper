import { FC } from 'react';
import { DropdownItem } from 'decky-frontend-lib';
import { RemapActions, RemappableButtons } from '../../backend/constants';
import { useRemapAction } from '../../hooks/controller';

type PropType = {
  label: string;
  btn: RemappableButtons;
  description?: string;
};

const RemapActionDropdown: FC<PropType> = ({ label, btn }) => {
  const { remapAction, setRemapAction } = useRemapAction(btn);
  const dropdownOptions = Object.values(RemapActions).map((action) => {
    return {
      data: action,
      label: `${action.split('_').join(' ')}`,
      value: action
    };
  });

  return (
    <div>
      <DropdownItem
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
            return o.data === remapAction;
          })?.data || RemapActions.DISABLED
        }
        onChange={(value: any) => {
          setRemapAction(value.data);
        }}
      />
    </div>
  );
};

export default RemapActionDropdown;
