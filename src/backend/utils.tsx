import { ServerAPI } from 'decky-frontend-lib';

export enum ServerAPIMethods {
  RGB_ON = 'rgb_on',
}

export const createRgbOn =
  (serverAPI: ServerAPI) => async (controller: 'LEFT' | 'RIGHT') => {
    await serverAPI.callPluginMethod(ServerAPIMethods.RGB_ON, {
      controller,
    });
  };


export const createServerApiHelpers = (serverAPI: ServerAPI) => {
  return {
    rgbOn: createRgbOn(serverAPI),
  };
};
