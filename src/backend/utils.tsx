import { ServerAPI, Router } from 'decky-frontend-lib';
import { ControllerType, RemapActions, RemappableButtons } from './constants';

export enum ServerAPIMethods {
  RGB_ON = 'rgb_on',
  RGB_OFF = 'rgb_off',
  REMAP_BUTTON = 'remap_button',
  LOG_INFO = 'log_info',
  GET_SETTINGS = 'get_settings'
}

const createRgbOn =
  (serverAPI: ServerAPI) => async (controller: ControllerType) => {
    await serverAPI.callPluginMethod(ServerAPIMethods.RGB_ON, {
      controller
    });
  };

const createRgbOff =
  (serverAPI: ServerAPI) => async (controller: ControllerType) => {
    await serverAPI.callPluginMethod(ServerAPIMethods.RGB_OFF, {
      controller
    });
  };

const createRemapButtons =
  (serverAPI: ServerAPI) =>
  async (button: RemappableButtons, action: RemapActions) => {
    await serverAPI.callPluginMethod(ServerAPIMethods.REMAP_BUTTON, {
      button,
      action
    });
  };

const createLogInfo = (serverAPI: ServerAPI) => async (info: any) => {
  await serverAPI.callPluginMethod(ServerAPIMethods.LOG_INFO, {
    info: JSON.stringify(info)
  });
};

const createGetSettings = (serverAPI: ServerAPI) => async () => {
  return await serverAPI.callPluginMethod(ServerAPIMethods.GET_SETTINGS, {});
};

let serverApi: undefined | ServerAPI;

export const saveServerApi = (s: ServerAPI) => {
  serverApi = s;
};

export const getServerApi = () => {
  return serverApi;
};

export const extractCurrentGameId = () =>
  `${Router.MainRunningApp?.appid || 'default'}`;

export const createServerApiHelpers = (serverAPI: ServerAPI) => {
  return {
    rgbOn: createRgbOn(serverAPI),
    rgbOff: createRgbOff(serverAPI),
    remapButton: createRemapButtons(serverAPI),
    logInfo: createLogInfo(serverAPI),
    getSettings: createGetSettings(serverAPI)
  };
};

export const logInfo = (info: any) => {
  const s = getServerApi();
  s &&
    s.callPluginMethod(ServerAPIMethods.LOG_INFO, {
      info: JSON.stringify(info)
    });
};
