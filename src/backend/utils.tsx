import { ServerAPI, Router } from 'decky-frontend-lib';
import { ControllerType, RemapActions, RemappableButtons } from './constants';

export enum ServerAPIMethods {
  RGB_ON = 'rgb_on',
  RGB_OFF = 'rgb_off',
  REMAP_BUTTON = 'remap_button',
  LOG_INFO = 'log_info',
  GET_SETTINGS = 'get_settings',
  SET_POWER_LED = 'set_power_led',
  SET_CHARGE_LIMIT = 'set_charge_limit'
}

const readAls =
  (serverApi: ServerAPI) => async () => {
    const { result } = await serverApi.callPluginMethod('read_als', {});
    return Number(result);
  };

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

const createSetPowerLed =
  (serverAPI: ServerAPI) => async (enabled: boolean) => {
    await serverAPI.callPluginMethod(ServerAPIMethods.SET_POWER_LED, {
      enabled
    });
  };

const createSetChargeLimit =
  (serverAPI: ServerAPI) => async (enabled: boolean) => {
    await serverAPI.callPluginMethod(ServerAPIMethods.SET_CHARGE_LIMIT, {
      enabled
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

export const extractDisplayName = () =>
  `${Router.MainRunningApp?.display_name || 'default'}`;

export const extractCurrentGameId = () =>
  `${Router.MainRunningApp?.appid || 'default'}`;

export const createServerApiHelpers = (serverAPI: ServerAPI) => {
  return {
    rgbOn: createRgbOn(serverAPI),
    rgbOff: createRgbOff(serverAPI),
    remapButton: createRemapButtons(serverAPI),
    logInfo: createLogInfo(serverAPI),
    getSettings: createGetSettings(serverAPI),
    setPowerLed: createSetPowerLed(serverAPI),
    setChargeLimit: createSetChargeLimit(serverAPI),
    readAls: readAls(serverAPI)
  };
};

export const logInfo = (info: any) => {
  const s = getServerApi();
  s &&
    s.callPluginMethod(ServerAPIMethods.LOG_INFO, {
      info: JSON.stringify(info)
    });
};

export const getLatestVersionNum = async (serverApi: ServerAPI) => {
  const { result } = await serverApi.fetchNoCors(
    'https://raw.githubusercontent.com/aarron-lee/LegionGoRemapper/main/package.json',
    { method: 'GET' }
  );

  //@ts-ignore
  const body = result.body as string;
  if (body && typeof body === 'string') {
    return JSON.parse(body)['version'];
  }
  return '';
};

export const otaUpdate = async (serverApi: ServerAPI) => {
  return serverApi.callPluginMethod('ota_update', {});
};
