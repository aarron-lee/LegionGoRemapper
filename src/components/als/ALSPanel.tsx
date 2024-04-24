import {
  ButtonItem,
  PanelSection,
  PanelSectionRow,
  ToggleField
} from 'decky-frontend-lib';

import { useState, useEffect } from 'react';
import { getServerApi, createServerApiHelpers, logInfo } from '../../backend/utils';

export default function () {
  const [enabledAls, setAlsEnabled] = useState(false);

  const previousAlsValues = [0, 0, 0, 0];
  const ALS_THRESHOLD = 50;
  let currentBrightness = 50;
  const serverApi = getServerApi();

  const brigtnessFunc = async () => {
    if (!enabledAls || !serverApi) {
      return;
    }

    const { readAls } = createServerApiHelpers(serverApi);
    const alsValue = await readAls();

    // Keep track of the last 4 values
    previousAlsValues.push(alsValue);
    previousAlsValues.shift();

    const alsDeltas = [];
    for (let i = 0; i < previousAlsValues.length - 1; i++) {
      alsDeltas.push(previousAlsValues[i + 1] - previousAlsValues[i]);
    }

    const delta = alsDeltas.reduce((acc, val) => acc + val, 0) / alsDeltas.length;

    logInfo(`ALS delta: ${delta}`);

    if (delta > ALS_THRESHOLD) {
      logInfo(`Increasing brightness to ${currentBrightness/100 + 0.1}`);
      window.SteamClient.System.Display.SetBrightness(currentBrightness/100 + 0.1);
    } else if (delta < -ALS_THRESHOLD) {
      logInfo(`Decreasing brightness to ${currentBrightness/100 - 0.1}`);
      window.SteamClient.System.Display.SetBrightness(currentBrightness/100 - 0.1);
    } else {
      logInfo(`Keeping brightness at ${currentBrightness/100}`);
    }
  };
z
  logInfo('Setting up ALS');

  useEffect(() => {
    const registration = window.SteamClient.System.Display.RegisterForBrightnessChanges(
      async (data: { flBrightness: number }) => {
        currentBrightness = data.flBrightness * 100;

        logInfo(`Brightness changed to ${currentBrightness}`);
      }
    );

    return () => {
      registration.unregister();
    };
  }, []);

  // Set the brightness of the display to 50%
  //window.SteamClient.System.Display.SetBrightness(currentBrightness/100);

  useEffect(() => {
    const brightnessHandler = setInterval(brigtnessFunc, 100);
    return () => clearInterval(brightnessHandler);
  });

  const handleAlsEnabled = (enabled: boolean) => {
    setAlsEnabled(enabled);

  }

  return (
    <>
      <PanelSection title='Ambient Light Sensor'>
        <PanelSectionRow>
          <ToggleField
            label={'Enable ALS'}
            checked={enabledAls}
            onChange={handleAlsEnabled}
          />
        </PanelSectionRow>
      </PanelSection>
    </>
  );
};
