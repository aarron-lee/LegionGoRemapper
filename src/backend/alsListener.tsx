import { createServerApiHelpers, getServerApi, logInfo } from './utils';

const log = true;

// Brightness steps
// [ALS delta, brightness add in %]
const BRIGHTNESS_STEPS = [
  [50, 0],
  [75, 5],
  [82.5, 7.5],
  [100, 10]
];

let enableAdaptiveBrightness = false;

const smoothTime = 300;
const stepCount = 10;
const ignoreThreshold = BRIGHTNESS_STEPS[0][0];
const alsPollingRate = 125;

let steamRegistration: any;
let previousAlsValues = Array(10).fill(-1);
let currentBrightness = 40;

const handleAls = async () => {
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const serverAPI = getServerApi();

  if (!serverAPI) {
    return;
  }

  const { readAls } = createServerApiHelpers(serverAPI);

  while (enableAdaptiveBrightness) {
    sleep(alsPollingRate);

    const alsValue = await readAls();
    log && logInfo(`ALS value: ${alsValue}`);
    if (typeof alsValue !== 'number') {
      continue;
    }

    // Keep track of the last N values
    previousAlsValues.push(alsValue);
    previousAlsValues.shift();

    // Set the initial values
    if (previousAlsValues.includes(-1)) {
      continue;
    }

    const alsDeltas = [];
    for (let i = 0; i < previousAlsValues.length - 1; i++) {
      alsDeltas.push(previousAlsValues[i + 1] - previousAlsValues[i]);
    }

    const delta = Math.round(
      alsDeltas.reduce((acc, val) => acc + val, 0) / alsDeltas.length
    );
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

    log &&
      logInfo(
        `Current brightness: ${currentBrightness} | ALS delta: ${delta} | previous values: ${previousAlsValues} | Current Brightness ${currentBrightness} | Brightness add: ${brightnessAdd} | Target brightness: ${targetBrightness}`
      );

    // Smoothing
    let localCurrentBrightness = currentBrightness;
    const brightnessPerMs = (brightnessAdd / smoothTime) * stepCount;

    for (let i = 0; i < smoothTime / stepCount; i++) {
      localCurrentBrightness += brightnessPerMs;
      localCurrentBrightness = Math.min(
        100,
        Math.max(0, localCurrentBrightness)
      );

      window.SteamClient.System.Display.SetBrightness(
        localCurrentBrightness / 100
      );

      await sleep(smoothTime / stepCount);
    }
  }
};

export const enableAlsListener = () => {
  enableAdaptiveBrightness = true;
  new Promise(async () => {
    await handleAls();
  });

  steamRegistration =
    window.SteamClient.System.Display.RegisterForBrightnessChanges(
      async (data: { flBrightness: number }) => {
        currentBrightness = data.flBrightness * 100;
      }
    );
};

export const clearAlsListener = () => {
  enableAdaptiveBrightness = false;

  previousAlsValues = [-1, -1, -1, -1];
  if (
    steamRegistration &&
    typeof steamRegistration?.unregister === 'function'
  ) {
    steamRegistration.unregister();
  }
  steamRegistration = undefined;
};
