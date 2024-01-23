import decky_plugin
import time
import legion_configurator
import controller_enums
import controller_settings as settings

# sync the state of the RGB lights to the values in settings.json
def sync_rgb_settings(current_game_id):
    s = settings.get_settings()
    # enable_separate_rgb_management = s.get('forceEnableSeparateLedManagement', False)

    controllers = ['LEFT', 'RIGHT']

    should_update_controllers = False

    rgb_profile = s.get('rgb').get(current_game_id)
    for controller in controllers:
        rgb_light = rgb_profile.get(controller)
        rgb_mode = rgb_light.get('mode')

        if rgb_light.get('enabled'):
            should_update_controllers = True

    for controller in controllers:
        if should_update_controllers:
            rgb_on(current_game_id, controller)
            time.sleep(0.1)
            rgb_color(
                current_game_id,
                controller,
                rgb_mode,
                rgb_light.get('red'),
                rgb_light.get('blue'),
                rgb_light.get('green'),
                rgb_light.get('brightness'),
                rgb_light.get('speed')
            )
        else:
            rgb_off(current_game_id, controller)

def rgb_on(current_game_id, controller: str):
    controller_code = controller_enums.Controller[controller].value
    rgb_on_command = legion_configurator.create_rgb_on_off_command(controller_code, True)
    # decky_plugin.logger.info(rgb_on_command)
    legion_configurator.send_command(rgb_on_command)

def rgb_off(current_game_id, controller: str):
    controller_code = controller_enums.Controller[controller].value
    rgb_off_command = legion_configurator.create_rgb_on_off_command(controller_code, False)
    # decky_plugin.logger.info(rgb_off_command)
    legion_configurator.send_command(rgb_off_command)


def rgb_color(current_game_id, controller: str, mode: str, red, blue, green, brightness, speed):
    hex_brightness = int(brightness)
    hex_speed = int(100) - int(speed)
    # Controller method is probably delay, meaning that it is the inverse of speed. Doing the above line as a bandaid
    decky_plugin.logger.info(hex_speed)
    color = bytes([red, green, blue])
    controller_code = controller_enums.Controller[controller].value
    rgb_mode_code = controller_enums.RgbModes[mode].value or controller_enums.RgbModes['SOLID'].value

    rgb = legion_configurator.create_rgb_control_command(controller_code, rgb_mode_code, color, hex_brightness, hex_speed)
    # decky_plugin.logger.info(list(rgb))
    legion_configurator.send_command(rgb)