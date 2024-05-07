import { createServerApiHelpers, getServerApi, logInfo } from './utils';

// Brightness thresholds
// [ALS value, brightness as percentage]
const BRIGHTNESS_THRESHOLDS = [
  [0, 10],
  [25, 15],
  [50, 20],
  [75, 25],
  [100, 30],
  [125, 35],
  [150, 40],
  [175, 45],
  [200, 50],
  [225, 55],
  [250, 60],
  [275, 65],
  [300, 70],
  [325, 75],
  [350, 80],
  [375, 85],
  [400, 90],
  [425, 95],
  [450, 100]
];

let steamRegistration: any;
let enableAdaptiveBrightness = false;
let manualBrightnessTimeout: number = 0; // 2 minutes

const pollingRate = 100; // Time in milliseconds
const smoothTime = 500; // Time in milliseconds
const stepCount = 10; // Less steps = smoother transition
const ignoreThreshold = 15; // Ignore values that are too close to the average

let previousAlsValues = Array(25).fill(-1); // Increase length to increase read times (less sensitive to changes)
let currentBrightness = 50;

const handleAls = async () => {
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const serverAPI = getServerApi();

  if (!serverAPI) {
    return;
  }

  const { readAls } = createServerApiHelpers(serverAPI);

  while (enableAdaptiveBrightness) {
    await sleep(pollingRate);

    manualBrightnessTimeout = 0;

    const alsValue = await readAls();
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

    // Get the average of the last N values
    const averageAlsValue =
      previousAlsValues.reduce((acc, val) => acc + val, 0) /
      previousAlsValues.length;

    // Find the target brightness
    let targetBrightness = currentBrightness;
    for (let i = 0; i < BRIGHTNESS_THRESHOLDS.length; i++) {
      if (averageAlsValue <= BRIGHTNESS_THRESHOLDS[i][0]) {
        targetBrightness = BRIGHTNESS_THRESHOLDS[i][1];
        break;
      }

      if (i === BRIGHTNESS_THRESHOLDS.length - 1) {
        targetBrightness = BRIGHTNESS_THRESHOLDS[i][1];
      }
    }

    if (targetBrightness === currentBrightness) {
      continue;
    }

    logInfo(`ALS value: ${ alsValue } | Average ALS value: ${ averageAlsValue } | Target brightness: ${ targetBrightness } | Current brightness: ${ currentBrightness }`);

    let localCurrentBrightness = currentBrightness;
    const numSteps = smoothTime / stepCount;

    let brightnessPerStep = (targetBrightness - currentBrightness) / numSteps;

    for (let i = 0; i < numSteps; i++) {
      await sleep(numSteps);

      localCurrentBrightness = localCurrentBrightness + brightnessPerStep;

      localCurrentBrightness = Math.min(
        100,
        Math.max(0, localCurrentBrightness)
      );

      logInfo(`Setting brightness to ${localCurrentBrightness}, target: ${targetBrightness}, brightnessPerStep: ${brightnessPerStep}`);

      window.SteamClient.System.Display.SetBrightness(
        localCurrentBrightness / 100
      );
    }

    currentBrightness = targetBrightness;
    previousAlsValues.fill(-1);
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

        //manualBrightnessTimeout = 120 * 1000;
      }
    );
};


export const clearAlsListener = () => {
  enableAdaptiveBrightness = false;

  previousAlsValues.fill(-1);
  if (
    steamRegistration &&
    typeof steamRegistration?.unregister === 'function'
  ) {
    steamRegistration.unregister();
  }
  steamRegistration = undefined;
};
