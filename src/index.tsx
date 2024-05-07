import {
  definePlugin,
  PanelSection,
  PanelSectionRow,
  ServerAPI,
  staticClasses,
  ToggleField
} from 'decky-frontend-lib';
import { memo, VFC } from 'react';

import RemapButtons from './components/controller/RemapButtons';
import ControllerLightingPanel from './components/rgb/ControllerLightingPanel';
import { createServerApiHelpers, saveServerApi } from './backend/utils';
import { store } from './redux-modules/store';
import { getInitialLoading } from './redux-modules/uiSlice';
import { setInitialState } from './redux-modules/extraActions';
import { Provider, useSelector } from 'react-redux';
import { currentGameIdListener } from './backend/currentGameIdListener';
import logo from '../assets/Icon.png';
import FanPanel from './components/fan/FanPanel';
import AlsPanel from './components/als/ALSPanel';
import ErrorBoundary from './components/ErrorBoundary';
import OtaUpdates from './components/OtaUpdates';
import { useChargeLimitEnabled } from './hooks/ui';

const Content: VFC<{ serverAPI?: ServerAPI }> = memo(() => {
  const loading = useSelector(getInitialLoading);
  const { chargeLimitEnabled, setChargeLimit } = useChargeLimitEnabled();
  if (loading) {
    return null;
  }
  return (
    <>
      <PanelSection>
        <PanelSectionRow>
          <ToggleField
            label="Enable Charge Limit (80%)"
            checked={chargeLimitEnabled}
            onChange={setChargeLimit}
          />
        </PanelSectionRow>
      </PanelSection>
      <ErrorBoundary title="Adaptive Brightness">
        <AlsPanel />
      </ErrorBoundary>
      <ErrorBoundary title={'Controller Lighting Panel'}>
        <ControllerLightingPanel />
      </ErrorBoundary>
      <ErrorBoundary title="Fan Panel">
        <FanPanel />
      </ErrorBoundary>
      <ErrorBoundary title="Remap Buttons">
        <RemapButtons />
      </ErrorBoundary>
      <ErrorBoundary>
        <OtaUpdates />
      </ErrorBoundary>
    </>
  );
});

const AppContainer: VFC<{ serverAPI: ServerAPI }> = ({ serverAPI }) => {
  return (
    <Provider store={store}>
      <Content serverAPI={serverAPI} />
    </Provider>
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  saveServerApi(serverApi);
  const { getSettings } = createServerApiHelpers(serverApi);

  getSettings().then((result) => {
    // logInfo(result);
    if (result.success) {
      const results = result.result || {};

      store.dispatch(setInitialState(results));
    }
  });

  const clearListener = currentGameIdListener();

  return {
    title: <div className={staticClasses.Title}>LegionGoRemapper</div>,
    content: <AppContainer serverAPI={serverApi} />,
    icon: (
      <img
        src={logo}
        style={{
          width: '1rem',
          filter:
            'invert(100%) sepia(0%) saturate(2%) hue-rotate(157deg) brightness(107%) contrast(101%)'
        }}
      />
    ),
    onDismount() {
      clearListener();
    }
  };
});
