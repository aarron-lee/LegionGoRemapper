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
// import { createServerApiHelpers } from './backend/utils';

// interface AddMethodArgs {
//   left: number;
//   right: number;
// }

const Content: VFC<{ serverAPI: ServerAPI }> = ({ serverAPI }) => {
  return (
    <>
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
