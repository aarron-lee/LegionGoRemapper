import os
from settings import SettingsManager

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

DEFAULT_RGB_PROFILE_VALUES = {
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
        rgb_profile[controller] = default_rgb_profile or DEFAULT_RGB_PROFILE_VALUES

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


def set_game_profile_setting(profileName: str, key: str, value):
    setting_file.read()
    if not setting_file.settings.get('gameProfiles'):
        setting_file.settings['gameProfiles'] = {}
    game_profiles  = setting_file.settings['gameProfiles']
    if not game_profiles.get(profileName):
        game_profiles[profileName] = {}

    setting_file.settings['gameProfiles'][profileName][key] = value
    
    # save to settings file
    setting_file.commit()