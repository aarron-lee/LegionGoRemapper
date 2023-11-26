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
import RightControllerPanel from './components/RightControllerPanel';
import LeftControllerPanel from './components/LeftControllerPanel';
// import RemapActionDropdown from './components/RemapActionDropdown';
// import { createServerApiHelpers } from './backend/utils';
import RemapButtons from './components/RemapButtons';
// import { createServerApiHelpers } from './backend/utils';

// interface AddMethodArgs {
//   left: number;
//   right: number;
// }

const Content: VFC<{ serverAPI: ServerAPI }> = ({ serverAPI }) => {
  // const { remapButton, logInfo } = createServerApiHelpers(serverAPI);
  return (
    <>
      <RemapButtons serverAPI={serverAPI} />
      {/* <RemapActionDropdown
        label="Remap Buttons"
        description="remap description"
        onChange={remapButton}
        logInfo={logInfo}
      /> */}
      <RightControllerPanel serverAPI={serverAPI} />
      <LeftControllerPanel serverAPI={serverAPI} />
    </>
  );
};

// const DeckyPluginRouterTest: VFC = () => {
//   return (
//     <div style={{ marginTop: "50px", color: "white" }}>
//       Hello World!
//       <DialogButton onClick={() => Router.NavigateToLibraryTab()}>
//         Go to Library
//       </DialogButton>
//     </div>
//   );
// };

export default definePlugin((serverApi: ServerAPI) => {
  // serverApi.routerHook.addRoute("/decky-plugin-test", DeckyPluginRouterTest, {
  //   exact: true,
  // });

  return {
    title: <div className={staticClasses.Title}>LegionGoRemapper</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <FaShip />
    // onDismount() {
    //   serverApi.routerHook.removeRoute("/decky-plugin-test");
    // },
  };
});
