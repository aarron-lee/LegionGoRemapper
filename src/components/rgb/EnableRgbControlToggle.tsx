import { FC } from 'react';
import { useEnableRgbControl } from '../../hooks/rgb';
import { ToggleField } from 'decky-frontend-lib';

export const EnableRgbControlToggle: FC = () => {
  const { rgbControlEnabled, setRgbControlEnabled } = useEnableRgbControl()

  return (
    <ToggleField
      label="Enable RGB Control"
      checked={rgbControlEnabled}
      onChange={setRgbControlEnabled}
    />
  );
};
