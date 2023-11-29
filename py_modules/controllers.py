import controller_settings
import decky_plugin
import legion_configurator
from controller_enums import Controller, RemappableButtons, RemapActions, GyroRemapActions, Gyro

def sync_controller_profile_settings(current_game_id):
    settings = controller_settings.get_settings()
    controller_profile = settings.get('controller').get(current_game_id, {})

    try:
        for remappable_button_name, remap_action in controller_profile.items():
            controller_code = None
            if remappable_button_name in ['Y3', 'M2', 'M3']:
                controller_code = Controller['RIGHT'].value
            elif remappable_button_name in ['Y1', 'Y2']:
                controller_code = Controller['LEFT'].value
            if not controller_code:
                continue

            btn_code = RemappableButtons[remappable_button_name].value
            action_code = RemapActions[remap_action].value
            remap_command = legion_configurator.create_button_remap_command(controller_code, btn_code, action_code)

            legion_configurator.send_command(remap_command)
    except Exception as e:
        decky_plugin.logger.error(f"sync_controller_profile_settings: {e}")

def sync_touchpad(current_game_id):
    settings = controller_settings.get_settings()
    controller_profile = settings.get('controller').get(current_game_id, {})

    try:
        new_touchpad_state = bool(controller_profile.get('TOUCHPAD'))
        t_toggle = legion_configurator.create_touchpad_command(new_touchpad_state)
        legion_configurator.send_command(t_toggle)
    except Exception as e:
        decky_plugin.logger.error(f"sync_touchpad: {e}")

def sync_gyros(current_game_id):
    settings = controller_settings.get_settings()
    controller_profile = settings.get('controller').get(current_game_id, {})

    for gyro in [g.name for g in Gyro]:
        try:
            gyro_remap_action = controller_profile.get(gyro)
            gyro_remap_action_code = GyroRemapActions[gyro_remap_action].value
            gyro_code = Gyro[gyro].value

            if gyro_remap_action_code >= 0 and gyro_code > 0:
                # valid codes, set gyro
                gyro_command = legion_configurator.create_gyro_remap_command(gyro_code, gyro_remap_action_code)
                legion_configurator.send_command(gyro_command)
        except Exception as e:
            decky_plugin.logger.error(f"sync_gyros {e}")