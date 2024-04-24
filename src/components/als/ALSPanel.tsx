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
  let currentBrightness = 50;
  const serverApi = getServerApi();


  // Brightness steps
  // [ALS delta, brightness add in %]
  const BRIGHTNESS_STEPS = [
    [0, 0],
    [25, 5],
    [50, 20],
    [75, 30],
  ];
  const smoothTime = 1000;
  const stepCount = 10;

  let settingBrightness = false;

  const brigtnessFunc = async () => {
    if (!enabledAls || !serverApi) {
      return;
    }

    const { readAls } = createServerApiHelpers(serverApi);
    const alsValue = await readAls();

    // Keep track of the last 4 values
    previousAlsValues.push(alsValue);
    previousAlsValues.shift();

    if (settingBrightness) {
      return;
    }

    const alsDeltas = [];
    for (let i = 0; i < previousAlsValues.length - 1; i++) {
      alsDeltas.push(previousAlsValues[i + 1] - previousAlsValues[i]);
    }

    const delta = Math.round(alsDeltas.reduce((acc, val) => acc + val, 0) / alsDeltas.length);
    const absDelta = Math.abs(delta);

    // Ignore small changes
    if (absDelta < 5) {
      return;
    }

    logInfo(`ALS delta: ${delta}`);

    // More sophisticated implementation
    const negativeDelta = delta < 0;
    let brightnessAdd = 0;
    for (let i = 0; i < BRIGHTNESS_STEPS.length; i++) {
      if (absDelta <= BRIGHTNESS_STEPS[i][0]) {
        brightnessAdd = BRIGHTNESS_STEPS[i][1];
        break;
      }
    }

    // Clamp brightness
    if (negativeDelta) {
      brightnessAdd = -brightnessAdd;
    }
    let targetBrightness = currentBrightness + brightnessAdd;
    targetBrightness = Math.min(100, Math.max(0, targetBrightness));

    logInfo(`Brightness add: ${brightnessAdd}`)
    logInfo(`Target brightness: ${targetBrightness}`);


    // Smoothing
    let localCurrentBrightness = currentBrightness;
    const brightnessPerMs = brightnessAdd / smoothTime * stepCount;

    settingBrightness = true;
    const brightnessHandler = setInterval(() => {
      localCurrentBrightness += brightnessPerMs;
      localCurrentBrightness = Math.min(100, Math.max(0, localCurrentBrightness));

      logInfo(`Current brightness: ${localCurrentBrightness}, target: ${targetBrightness}`);
      window.SteamClient.System.Display.SetBrightness(localCurrentBrightness / 100);

      if (localCurrentBrightness >= targetBrightness) {
        clearInterval(brightnessHandler);
        settingBrightness = false;
      }
    }, stepCount);

  };

  logInfo('Setting up ALS');

  useEffect(() => {
    const registration = window.SteamClient.System.Display.RegisterForBrightnessChanges(
      async (data: { flBrightness: number }) => {
        currentBrightness = data.flBrightness * 100;
      }
    );

    return () => {
      registration.unregister();
    };
  }, []);

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
