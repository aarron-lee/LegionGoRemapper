import decky_plugin
import time
import legion_configurator
import controller_enums
import controller_settings as settings

# sync the state of the RGB lights to the values in settings.json
def sync_rgb_settings(current_game_id):
    s = settings.get_settings()
    rgb_profile = s.get('rgb').get(current_game_id)
    for controller in ['LEFT', 'RIGHT']:
        rgb_light = rgb_profile.get(controller)
        rgb_mode = rgb_light.get('mode')

        decky_plugin.logger.info(f"rgb_light {rgb_light}")

        if rgb_light.get('enabled'):
            rgb_on(current_game_id, controller)
            time.sleep(0.1)
            rgb_color(
                current_game_id,
                controller,
                rgb_mode,
                rgb_light.get('red'),
                rgb_light.get('blue'),
                rgb_light.get('green'),
                rgb_light.get('brightness')
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


def rgb_color(current_game_id, controller: str, mode: str, red, blue, green, brightness):
    hex_brightness = int(brightness)
    color = bytes([red, green, blue])
    controller_code = controller_enums.Controller[controller].value
    rgb_mode_code = controller_enums.RgbModes[mode].value or controller_enums.RgbModes['SOLID'].value

    decky_plugin.logger.info(f"Mode: {mode} {rgb_mode_code}")

    rgb = legion_configurator.create_rgb_control_command(controller_code, rgb_mode_code, color, hex_brightness, 0x01)
    # decky_plugin.logger.info(list(rgb))
    legion_configurator.send_command(rgb)