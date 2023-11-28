import { PanelSectionRow, Field, Focusable } from 'decky-frontend-lib';
import { FC, ReactNode } from 'react';
import { M1 } from '../svgs/M1';
import { M2 } from '../svgs/M2';
import { M3 } from '../svgs/M3';
import { Y1 } from '../svgs/Y1';
import { Y2 } from '../svgs/Y2';
import { Y3 } from '../svgs/Y3';

export const IconMap = {
  M1: M1,
  M2: M2,
  M3: M3,
  Y1: Y1,
  Y2: Y2,
  Y3: Y3
};

export const IconRow: FC<{
  btn: string;
}> = ({ btn, children }) => {
  const Component = IconMap[btn];
  return (
    <PanelSectionRow bottomSeparator="none">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          boxSizing: 'border-box',
          margin: '0',
          padding: '0'
        }}
      >
        <span
          style={{
            width: '2em',
            height: '1.5em',
            fontSize: '1.5em',
            boxSizing: 'border-box'
          }}
        >
          {Component && <Component />}
        </span>
        <Focusable style={{ display: 'flex', margin: '0', padding: '0' }}>
          <div
            style={{
              display: 'flex',
              fontSize: '1.5em',
              justifyContent: 'center',
              alignItems: 'center',
              margin: '0',
              padding: '0'
            }}
          >
            {children}
          </div>
        </Focusable>
      </div>
    </PanelSectionRow>
  );
};
