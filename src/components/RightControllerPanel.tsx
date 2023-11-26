import { ButtonItem, PanelSection, ServerAPI } from 'decky-frontend-lib';
import { VFC } from 'react';
import { createServerApiHelpers } from '../backend/utils';

const CONTROLLER = 'RIGHT';

const RightControllerPanel: VFC<{ serverAPI: ServerAPI }> = ({ serverAPI }) => {
  const { rgbOn, rgbOff } = createServerApiHelpers(serverAPI);

  return (
    <PanelSection title="Right Controller RGB">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '.5rem',
          width: '100%'
        }}
      >
        <ButtonItem onClick={() => rgbOn(CONTROLLER)}>
          <span>On</span>
        </ButtonItem>
        <ButtonItem onClick={() => rgbOff(CONTROLLER)}>
          <span>Off</span>
        </ButtonItem>
      </div>
    </PanelSection>
  );
};

export default RightControllerPanel;
