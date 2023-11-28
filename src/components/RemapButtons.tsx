import { FC } from 'react';
import { RemappableButtons } from '../backend/constants';
import RemapActionDropdown from './RemapActionDropdown';

const RemapButtons: FC = () => {
  const btns = Object.values(RemappableButtons);

  return (
    <>
      {btns.map((btn, idx) => {
        return <RemapActionDropdown label={`${btn}`} btn={btn} key={idx} />;
      })}
    </>
  );
};

export default RemapButtons;
