import { createServerApiHelpers, getServerApi, logInfo } from './utils';

const log = false;

// Brightness steps
// [ALS delta, brightness add in %]
const BRIGHTNESS_STEPS = [
  [50, 0],
  [75, 5],
  [82.5, 7.5],
  [100, 10]
];

let enableAdaptiveBrightness = false;

const smoothTime = 250;
const stepCount = 10;
const ignoreThreshold = 30;
const alsPollingRate = 125;

let steamRegistration: any;
let previousAlsValues = [-1, -1, -1, -1];
let currentBrightness = 40;

const handleAls = async () => {
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const serverAPI = getServerApi();

  if (!serverAPI) {
    logInfo('Server API not available');
    return;
  }

  const { readAls } = createServerApiHelpers(serverAPI);

  while (true) {
    sleep(alsPollingRate);

    if (!enableAdaptiveBrightness) {
      log && logInfo('Adaptive brightness disabled');
      break;
    }

    const alsValue = await readAls();
    log && logInfo(`ALS value: ${alsValue}`);
    if (typeof alsValue !== 'number') {
      continue;
    }

    // Keep track of the last 4 values
    previousAlsValues.push(alsValue);
    previousAlsValues.shift();

    // Set the initial values
    if (
      previousAlsValues[0] === -1 ||
      previousAlsValues[1] === -1 ||
      previousAlsValues[2] === -1 ||
      previousAlsValues[3] === -1
    ) {
      log && logInfo('Initial values are being set');
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
      log && logInfo(`Ignoring small change: ${absDelta}`);
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

      // Ensure that we don't have stale data
      previousAlsValues.push(alsValue);
      previousAlsValues.shift();
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
  logInfo(`als listener enabled`);
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
  logInfo(`als listener disabled`);
};
