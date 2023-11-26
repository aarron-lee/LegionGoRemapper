import { ServerAPI } from 'decky-frontend-lib';
import { FC } from 'react';
import { RemappableButtons } from '../backend/constants';
import RemapActionDropdown from './RemapActionDropdown';
import { createServerApiHelpers } from '../backend/utils';

const RemapButtons: FC<{ serverAPI: ServerAPI }> = ({ serverAPI }) => {
  const { remapButton } = createServerApiHelpers(serverAPI);

  const btns = Object.values(RemappableButtons);

  return (
    <>
      {btns.map((btn, idx) => {
        return (
          <RemapActionDropdown
            label={`${btn}`}
            btn={btn}
            key={idx}
            onChange={remapButton}
          />
        );
      })}
    </>
  );
};

export default RemapButtons;
