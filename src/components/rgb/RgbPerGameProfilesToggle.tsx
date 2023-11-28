import { FC } from 'react';
import { usePerGameRgbProfilesEnabled } from '../../hooks/rgb';
import { ToggleField } from 'decky-frontend-lib';

export const RgbPerGameProfilesToggle: FC = () => {
  const [perGameProfilesEnabled, setPerGameProfilesEnabled] =
    usePerGameRgbProfilesEnabled();

  return (
    <ToggleField
      label="Enable Per Game Profiles"
      checked={perGameProfilesEnabled}
      onChange={setPerGameProfilesEnabled}
    />
  );
};
