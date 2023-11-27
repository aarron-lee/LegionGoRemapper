export type ControllerType = 'LEFT' | 'RIGHT';

export enum RemappableButtons {
  Y1 = 'Y1',
  Y2 = 'Y2',
  Y3 = 'Y3',
  M2 = 'M2',
  M3 = 'M3'
}

export enum RemapActions {
  DISABLED = 'DISABLED',
  L_STICK_CLICK = 'L_STICK_CLICK',
  L_STICK_UP = 'L_STICK_UP',
  L_STICK_DOWN = 'L_STICK_DOWN',
  L_STICK_LEFT = 'L_STICK_LEFT',
  L_STICK_RIGHT = 'L_STICK_RIGHT',

  R_STICK_CLICK = 'R_STICK_CLICK',
  R_STICK_UP = 'R_STICK_UP',
  R_STICK_DOWN = 'R_STICK_DOWN',
  R_STICK_LEFT = 'R_STICK_LEFT',
  R_STICK_RIGHT = 'R_STICK_RIGHT',

  D_PAD_UP = 'D_PAD_UP',
  D_PAD_DOWN = 'D_PAD_DOWN',
  D_PAD_LEFT = 'D_PAD_LEFT',
  D_PAD_RIGHT = 'D_PAD_RIGHT',

  BUTTON_A = 'BUTTON_A',
  BUTTON_B = 'BUTTON_B',
  BUTTON_X = 'BUTTON_X',
  BUTTON_Y = 'BUTTON_Y',

  L_BUMPER = 'L_BUMPER',
  L_TRIGGER = 'L_TRIGGER',
  R_BUMPER = 'R_BUMPER',
  R_TRIGGER = 'R_TRIGGER',

  VIEW = 'VIEW',
  MENU = 'MENU'
}

export enum RgbModes {
  SOLID = 'SOLID',
  DYNAMIC = 'DYNAMIC',
  BLINKING = 'BLINKING'
}
