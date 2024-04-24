import {
  ButtonItem,
  PanelSection,
  PanelSectionRow,
  ToggleField
} from 'decky-frontend-lib';

import { useState, useEffect } from 'react';
import { getServerApi, createServerApiHelpers, logInfo } from '../../backend/utils';

let currentBrightness = 40;

export default function () {
  const [enabledAls, setAlsEnabled] = useState(false);

  const previousAlsValues = [-1, -1, -1, -1];

  const serverApi = getServerApi();
  const { readAls } = serverApi ? createServerApiHelpers(serverApi) : { readAls: async () => null };

  // Brightness steps
  // [ALS delta, brightness add in %]
  const BRIGHTNESS_STEPS = [
    [50, 0],
    [75, 5],
    [82.5, 7.5],
    [100, 10]
  ];

  const smoothTime = 250;
  const stepCount = 10;
  const ignoreThreshold = 30;

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const brigtnessPromise = new Promise(async (resolve) => {
    while (true) {
      await sleep(100);

      if (!serverApi) {
        continue;
      }

      const alsValue = await readAls();

      if (alsValue === null) {
        continue;
      }

      // Keep track of the last 4 values
      previousAlsValues.push(alsValue);
      previousAlsValues.shift();

      //logInfo(`ALS value: ${alsValue}`);

      // Set the initial values
      if (previousAlsValues[0] === -1 || previousAlsValues[1] === -1
        || previousAlsValues[2] === -1 || previousAlsValues[3] === -1) {
        continue;
      }

      if (!enabledAls) {
        continue;
      }

      const alsDeltas = [];
      for (let i = 0; i < previousAlsValues.length - 1; i++) {
        alsDeltas.push(previousAlsValues[i + 1] - previousAlsValues[i]);
      }

      const delta = Math.round(alsDeltas.reduce((acc, val) => acc + val, 0) / alsDeltas.length);
      const absDelta = Math.abs(delta);

      // Ignore small changes
      if (absDelta < ignoreThreshold) {
        continue;
      }

      // More sophisticated implementation
      const negativeDelta = delta < 0;
      let brightnessAdd = 0;
      for (let i = 0; i < BRIGHTNESS_STEPS.length; i++) {
        if (absDelta <= BRIGHTNESS_STEPS[i][0]) {
          brightnessAdd = BRIGHTNESS_STEPS[i][1];
          break;
        }

        if (i === BRIGHTNESS_STEPS.length - 1) {
          brightnessAdd = BRIGHTNESS_STEPS[i][1];
        }
      }

      // Clamp brightness
      if (negativeDelta) {
        brightnessAdd = -brightnessAdd;
      }
      let targetBrightness = currentBrightness + brightnessAdd;
      targetBrightness = Math.min(100, Math.max(0, targetBrightness));

      //logInfo(`Current brightness: ${currentBrightness} | ALS delta: ${delta} | previous values: ${previousAlsValues} | Current Brightness ${currentBrightness} | Brightness add: ${brightnessAdd} | Target brightness: ${targetBrightness}`);

      // Smoothing
      let localCurrentBrightness = currentBrightness;
      const brightnessPerMs = brightnessAdd / smoothTime * stepCount;

      for (let i = 0; i < smoothTime / stepCount; i++) {
        localCurrentBrightness += brightnessPerMs;
        localCurrentBrightness = Math.min(100, Math.max(0, localCurrentBrightness));

        window.SteamClient.System.Display.SetBrightness(localCurrentBrightness / 100);

        await sleep(smoothTime / stepCount);

        // Ensure that we don't have stale data
        previousAlsValues.push(alsValue);
        previousAlsValues.shift();
      }
    }
    resolve('');
  });

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
    return () => {
      brigtnessPromise.then(() => {
        logInfo('Brightness promise resolved');
      });
    }
  }, []);

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
