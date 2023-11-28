import os
import decky_plugin
import legion_configurator
from settings import SettingsManager
from controller_enums import Controller, RemappableButtons, RemapActions

settings_directory = os.environ["DECKY_PLUGIN_SETTINGS_DIR"]
settings_path = os.path.join(settings_directory, 'settings.json')
setting_file = SettingsManager(name="settings", settings_directory=settings_directory)
setting_file.read()

def deep_merge(origin, destination):
    for k, v in origin.items():
        if isinstance(v, dict):
            n = destination.setdefault(k, {})
            deep_merge(v, n)
        else:
            destination[k] = v

    return destination

def get_settings():
    setting_file.read()
    return setting_file.settings

def set_setting(name: str, value):
    return setting_file.setSetting(name, value)

DEFAULT_RGB_LIGHT_VALUES = {
  "enabled": False,
  "red": 255,
  "green": 255,
  "blue": 255,
  "brightness": 50
}

def bootstrap_rgb_settings(profileName: str, controller: str):
    settings = get_settings()

    if not settings.get('rgb'):
        settings['rgb'] = {}
    rgb_profiles = settings['rgb']
    if not rgb_profiles.get(profileName):
        rgb_profiles[profileName] = {}
    rgb_profile = rgb_profiles[profileName]
    default_rgb_profile = rgb_profiles.get('default').get(controller)

    if not rgb_profile.get(controller):
        rgb_profile[controller] = default_rgb_profile or DEFAULT_RGB_LIGHT_VALUES

def set_rgb_profile_value(profileName: str, controller: str, key: str, value):
    bootstrap_rgb_settings(profileName, controller)

    setting_file.settings['rgb'][profileName][controller][key] = value
    setting_file.commit()

def set_rgb_profile_values(profileName: str, controller: str, values):
    bootstrap_rgb_settings(profileName, controller)

    profile = setting_file.settings['rgb'][profileName][controller]

    deep_merge(values, profile)

    setting_file.settings['rgb'][profileName][controller] = profile

    setting_file.commit()

def set_all_rgb_profiles(rgb_profiles):
    for profileName, rgbProfile in rgb_profiles.items():
        left = rgbProfile.get('LEFT')
        set_rgb_profile_values(
            profileName=profileName,
            controller='LEFT',
            values=left
        )
        right = rgbProfile.get('RIGHT')
        set_rgb_profile_values(
            profileName=profileName,
            controller='RIGHT',
            values=right
        )


def set_all_controller_profiles(controller_profiles):
    settings = get_settings()

    if not settings.get('controller'):
        settings['controller'] = {}
    profiles = settings['controller']
    deep_merge(controller_profiles, profiles)

    setting_file.settings['controller'] = profiles
    setting_file.commit()

def sync_controller_profile_settings(current_game_id):
    settings = get_settings()
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
    settings = get_settings()
    controller_profile = settings.get('controller').get(current_game_id, {})

    try:
        new_touchpad_state = bool(controller_profile.get('TOUCHPAD'))
        t_toggle = legion_configurator.create_touchpad_command(new_touchpad_state)
        legion_configurator.send_command(t_toggle)
    except Exception as e:
        decky_plugin.logger.error(f"sync_touchpad: {e}")
