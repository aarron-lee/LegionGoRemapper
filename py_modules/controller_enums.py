from enum import Enum

class Controller(Enum):
    LEFT = 0x03
    RIGHT = 0x04

# The Button to Remap
class RemappableButtons(Enum):
    Y1 = 0x1c
    Y2 = 0x1d
    Y3 = 0x1e
    M2 = 0x21
    M3 = 0x22

# The action to assign to Remappable Buttons
class RemapActions(Enum):
    DISABLED = 0x00
    L_STICK_CLICK = 0x03
    L_STICK_UP = 0x04
    L_STICK_DOWN = 0x05
    L_STICK_LEFT = 0x06
    L_STICK_RIGHT = 0x07

    R_STICK_CLICK = 0x08
    R_STICK_UP = 0x09
    R_STICK_DOWN = 0x0a
    R_STICK_LEFT = 0x0b
    R_STICK_RIGHT = 0x0c

    D_PAD_UP = 0x0d
    D_PAD_DOWN = 0x0e
    D_PAD_LEFT = 0x0f
    D_PAD_RIGHT = 0x10

    BUTTON_A = 0x12
    BUTTON_B = 0x13
    BUTTON_X = 0x14
    BUTTON_Y = 0x15

    L_BUMPER = 0x16
    L_TRIGGER = 0x17
    R_BUMPER = 0x18
    R_TRIGGER = 0x19

    VIEW = 0x23
    MENU = 0x24

class RgbModes(Enum):
    SOLID = 0x01
    DYNAMIC = 0x03
    PULSE = 0x02