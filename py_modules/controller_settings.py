import os
from settings import SettingsManager

settings_directory = os.environ["DECKY_PLUGIN_SETTINGS_DIR"]
settings_path = os.path.join(settings_directory, 'settings.json')
setting_file = SettingsManager(name="settings", settings_directory=settings_directory)
setting_file.read()

def get_settings():
    setting_file.read()
    return setting_file.settings

def set_setting(name: str, value):
    return setting_file.setSetting(name, value)


def set_game_profile_setting(self, profileName: str, key: str, value):
    setting_file.read()
    if not setting_file.settings.get('gameProfiles'):
        setting_file.settings['gameProfiles'] = {}
    game_profiles  = setting_file.settings['gameProfiles']
    if not game_profiles.get(profileName):
        game_profiles[profileName] = {}

    setting_file.settings['gameProfiles'][profileName][key] = value
    
    # save to settings file
    setting_file.commit()