import hid

# Global variables
vendor_id = 0x17EF
product_id_match = lambda x: x & 0xFFF0 == 0x6180
usage_page = 0xFFA0
global_config = None  # Global configuration for the device

# Enumerate and set the global configuration
for dev in hid.enumerate(vendor_id):
    if product_id_match(dev["product_id"]) and dev["usage_page"] == usage_page:
        global_config = dev
        break

if not global_config:
    print("Legion go configuration device not found.")
else:
    print(global_config)


def send_command(command):
    assert len(command) == 64 and global_config
    try:
        with hid.Device(path=global_config['path']) as device:
            device.write(command)
            print("Command sent successfully.")
    except IOError as e:
        print(f"Error opening HID device: {e}")


def create_touchpad_command(enable):
    """
    Create a command to enable or disable the touchpad.

    :param enable: bool - True to enable, False to disable the touchpad
    :return: bytes - The command byte array
    """
    enable_byte = 0x01 if enable else 0x00

    command = [
        0x05,
        0x06,  # Report ID and Length
        0x6B,  # Command (Nibble 6 + b)
        0x02,  # Command sub-parameter
        0x04,  # Right Controller
        enable_byte,  # Enable/Disable flag
        0x01   # All commands end with 0x01
    ]

    byte_command = bytes(command)
    # Pad the byte_command with 0xCD to meet the length of 64 bytes
    buffered_command = byte_command + bytes([0xCD] * (64 - len(byte_command)))
    return buffered_command

def create_rgb_control_command(controller, mode, color, brightness, profile):
    """
    Create a command for RGB LED control.

    :param controller: byte - The controller byte (e.g., 0x03, 0x04)
    :param mode: byte - The LED mode (e.g., 0x01 for solid)
    :param color: bytes - The RGB color value (e.g., b'\xFF\x00\x00' for red)
    :param brightness: byte - The brightness value
    :param profile: byte - The profile number
    :return: bytes - The command byte array
    """
    command = [
        0x05, 0x0c,  # Report ID and Length
        0x72,        # Command (Nibble 7 + 2)
        0x01, controller, mode
    ] + list(color) + [brightness, profile, 0x01]
    return bytes(command) + bytes([0xCD] * (64 - len(command)))

def create_rgb_on_off_command(controller, on):
    """
    Create a command to turn the RGB LEDs on or off.

    :param controller: byte - The controller byte (e.g., 0x03 for left, 0x04 for right)
    :param on: bool - True to turn on, False to turn off
    :return: bytes - The command byte array
    """
    on_off_byte = 0x01 if on else 0x00
    command = [
        0x05, 0x06,  # Report ID and Length
        0x70,        # Command (Nibble 7 + 0)
        0x02,        # Sub-parameter
        controller,  # Controller
        on_off_byte, # On/Off
        0x01         # Command end marker
    ]
    return bytes(command) + bytes([0xCD] * (64 - len(command)))

def create_gyro_remap_command(gyro, joystick):
    """
    Create a command for gyro remapping.

    :param gyro: byte - The gyro setting (e.g., 0x01, 0x02)
    :param joystick: byte - The joystick value (e.g., 0x00, 0x01, 0x02)
    :return: bytes - The command byte array
    """
    command = [
        0x05, 0x08,  # Report ID and Length
        0x6a,        # Command (Nibble 6 + a)
        0x06, 0x01, 0x01,  # Sub-parameters
        gyro, joystick,
        0x01         # Command end marker
    ]
    return bytes(command) + bytes([0xCD] * (64 - len(command)))

def create_button_remap_command(controller, button, action):
    """
    Create a command for button remapping.

    :param controller: byte - The controller byte (e.g., 0x03, 0x04)
    :param button: byte - The button to remap
    :param action: byte - The action to assign to the button
    :return: bytes - The command byte array
    """
    command = [
        0x05, 0x07,  # Report ID and Length
        0x6c,        # Command (Nibble 6 + c)
        0x02, controller, button, action,
        0x01         # Command end marker
    ]
    return bytes(command) + bytes([0xCD] * (64 - len(command)))


# Example usage of gyro remap command
gyro_remap_command = create_gyro_remap_command(0x01, 0x01)
send_command(gyro_remap_command)

# Example usage of RGB remap command
rgb_command = create_rgb_control_command(
    controller=0x04,     # Right Controller
    mode=0x01,           # Solid color mode
    color=b'\xFF\x00\x00',  # Red color
    brightness=0xFF,     # Full brightness
    profile=0x01         # Profile number 1
)

send_command(rgb_command)

touchpad_disable_command = create_touchpad_command(True)
send_command(touchpad_disable_command)


# Turn the RGB LEDs on (right controller)
rgb_on_command = create_rgb_on_off_command(0x03, True)
send_command(rgb_on_command)