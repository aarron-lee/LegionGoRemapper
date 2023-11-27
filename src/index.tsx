import {
  // ButtonItem,
  definePlugin,
  // DialogButton,
  // Menu,
  // MenuItem,
  // PanelSection,
  // PanelSectionRow,
  // Router,
  ServerAPI,
  // showContextMenu,
  staticClasses
} from 'decky-frontend-lib';
import { VFC } from 'react';
import { FaShip } from 'react-icons/fa';

// import logo from '../assets/logo.png';
// import RemapActionDropdown from './components/RemapActionDropdown';
// import { createServerApiHelpers } from './backend/utils';
import RemapButtons from './components/RemapButtons';
import ControllerLightingPanel from './components/ControllerLightingPanel';
import { createServerApiHelpers, saveServerApi } from './backend/utils';
import { store } from './redux-modules/store';
import { getInitialLoading, uiSlice } from './redux-modules/uiSlice';
import { setInitialState } from './redux-modules/extraActions';
import { Provider, useSelector } from 'react-redux';
// import { createServerApiHelpers } from './backend/utils';

// interface AddMethodArgs {
//   left: number;
//   right: number;
// }

const Content: VFC<{ serverAPI: ServerAPI }> = ({ serverAPI }) => {
  // const { remapButton, logInfo } = createServerApiHelpers(serverAPI);
  const loading = useSelector(getInitialLoading);
  if (loading) {
    return null;
  }
  return (
    <>
      <RemapButtons serverAPI={serverAPI} />
      <ControllerLightingPanel serverAPI={serverAPI} />
    </>
  );
};

const AppContainer: VFC<{ serverAPI: ServerAPI }> = ({ serverAPI }) => {
  return (
    <Provider store={store}>
      <Content serverAPI={serverAPI} />
    </Provider>
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  // serverApi.routerHook.addRoute("/decky-plugin-test", DeckyPluginRouterTest, {
  //   exact: true,
  // });
  saveServerApi(serverApi);
  const { getSettings, logInfo } = createServerApiHelpers(serverApi);

  getSettings().then((result) => {
    logInfo(result);
    if (result.success) {
      const results = result.result || {};

      logInfo(`initial load FE ${JSON.stringify(results)}`);

      store.dispatch(setInitialState(results));
    }
  });

  return {
    title: <div className={staticClasses.Title}>LegionGoRemapper</div>,
    content: <AppContainer serverAPI={serverApi} />,
    icon: <FaShip />
    // onDismount() {
    //   serverApi.routerHook.removeRoute("/decky-plugin-test");
    // },
  };
});
