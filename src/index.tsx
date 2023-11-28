import { definePlugin, ServerAPI, staticClasses } from 'decky-frontend-lib';
import { memo, VFC } from 'react';

// import { createServerApiHelpers } from './backend/utils';
import { FaShip } from 'react-icons/fa';
import RemapButtons from './components/controller/RemapButtons';
import ControllerLightingPanel from './components/rgb/ControllerLightingPanel';
import { createServerApiHelpers, saveServerApi } from './backend/utils';
import { store } from './redux-modules/store';
import { getInitialLoading } from './redux-modules/uiSlice';
import { setInitialState } from './redux-modules/extraActions';
import { Provider, useSelector } from 'react-redux';
import { currentGameIdListener } from './backend/currentGameIdListener';
import { Icon } from './svgs/Icon';

const Content: VFC<{ serverAPI: ServerAPI }> = memo(({ serverAPI }) => {
  const loading = useSelector(getInitialLoading);
  if (loading) {
    return null;
  }
  return (
    <>
      <ControllerLightingPanel />
      <RemapButtons />
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
      <span>
        <Icon />
      </span>
    ),
    onDismount() {
      clearListener();
    }
  };
});
