import os
import logging

# The decky plugin module is located at decky-loader/plugin
# For easy intellisense checkout the decky-loader code one directory up
# or add the `decky-loader/plugin` path to `python.analysis.extraPaths` in `.vscode/settings.json`

import decky_plugin
import ambient_light_sensor
import legion_configurator
import legion_space
import controller_enums
import rgb
import controllers
import file_timeout
import plugin_update
import controller_settings as settings
from time import sleep

try:
    LOG_LOCATION = f"/tmp/legionGoRemapper.log"
    logging.basicConfig(
        level = logging.INFO,
        filename = LOG_LOCATION,
        format="[%(asctime)s | %(filename)s:%(lineno)s:%(funcName)s] %(levelname)s: %(message)s",
        filemode = 'w',
        force = True)
except Exception as e:
    logging.error(f"exception|{e}")

class Plugin:
    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    async def _main(self):
        decky_plugin.logger.info("Hello World!")

    async def get_settings(self):
        results = settings.get_settings()

        if results.get("chargeLimitEnabled", False):
            legion_space.set_charge_limit(True)

        try:
            results['pluginVersionNum'] = f'{decky_plugin.DECKY_PLUGIN_VERSION}'

            if settings.supports_custom_fan_curves():
                results['supportsCustomFanCurves'] = True
            else:
                results['supportsCustomFanCurves'] = False
        except Exception as e:
            decky_plugin.logger.error(e)

        return results

    async def find_als(self):
        return ambient_light_sensor.find_als()

    async def read_als(self):
        return ambient_light_sensor.read_als()

    async def save_rgb_per_game_profiles_enabled(self, enabled: bool):
        return settings.set_setting('rgbPerGameProfilesEnabled', enabled)

    async def save_controller_settings(self, controller, currentGameId):
        controllerProfiles = controller.get('controllerProfiles')
        controllerPerGameProfilesEnabled = controller.get('perGameProfilesEnabled') or False
        controllerRemappingEnabled  = controller.get('controllerRemappingEnabled') or False

        settings.set_setting('controllerPerGameProfilesEnabled', controllerPerGameProfilesEnabled)
        settings.set_setting('controllerRemappingEnabled', controllerRemappingEnabled)
        result = settings.set_all_controller_profiles(controllerProfiles)

        if controllerRemappingEnabled:
            # double-sync just in case the first one doesn't register
            for _ in range(2):
                # sync settings.json to actual controller hardware
                if currentGameId:
                    controllers.sync_controller_profile_settings(currentGameId)
                    # sync touchpad
                    controllers.sync_touchpad(currentGameId)
                    # sync gyros
                    controllers.sync_gyros(currentGameId)
        return result

    async def save_rgb_settings(self, payload):
        currentGameId = payload.get('currentGameId')
        rgbProfiles = payload.get('rgbProfiles')
        enableRgbControl = payload.get('enableRgbControl', True)
        result = settings.set_all_rgb_profiles(rgbProfiles)

        settings.set_setting('enableRgbControl', enableRgbControl)

        if enableRgbControl:
            # double-sync just in case the first one doesn't register
            for _ in range(2):
                if currentGameId:
                    rgb.sync_rgb_settings(currentGameId)
        return result

    async def disable_fan_profiles(self, resetCurve = False):
        settings.set_setting('customFanCurvesEnabled', False)

        if resetCurve:
            legion_space.set_tdp_mode("performance")
            sleep(0.5)
            legion_space.set_tdp_mode("custom")

    async def save_fan_settings(self, fanInfo, currentGameId):
        fanProfiles = fanInfo.get('fanProfiles', {})
        fanPerGameProfilesEnabled = fanInfo.get('fanPerGameProfilesEnabled', False)
        customFanCurvesEnabled = fanInfo.get('customFanCurvesEnabled', False)

        settings.set_setting('fanPerGameProfilesEnabled', fanPerGameProfilesEnabled)
        settings.set_setting('customFanCurvesEnabled', customFanCurvesEnabled)
        settings.set_all_fan_profiles(fanProfiles)

        try:
            active_fan_profile = fanProfiles.get('default')

            if customFanCurvesEnabled and settings.supports_custom_fan_curves():
                if fanPerGameProfilesEnabled:
                    fan_profile = fanProfiles.get(currentGameId)
                    if fan_profile:
                        active_fan_profile = fan_profile

                enable_full_fan_speed = active_fan_profile.get("fullFanSpeedEnabled", False)
                del active_fan_profile['fullFanSpeedEnabled']
                active_fan_curve = list(active_fan_profile.values())

                if not enable_full_fan_speed:
                    legion_space.set_full_fan_speed(False)
                    sleep(0.5)
                    legion_space.set_active_fan_curve(active_fan_curve)
                else:
                    legion_space.set_full_fan_speed(True)
            elif not customFanCurvesEnabled and settings.supports_custom_fan_curves():
                legion_space.set_tdp_mode("performance")
                sleep(0.5)
                legion_space.set_tdp_mode("custom")

            return True
        except Exception as e:
            decky_plugin.logger(f'save_fan_settings error {e}')
            return False

    # sync state in settings.json to actual controller RGB hardware
    async def sync_rgb_settings(self, currentGameId):
        return rgb.sync_rgb_settings(currentGameId)

    async def set_power_led(self, enabled):
        settings.set_setting('powerLedEnabled', enabled)

        legion_space.set_power_light(enabled)

    async def set_charge_limit(self, enabled):
        try:
            settings.set_setting('chargeLimitEnabled', enabled)

            legion_space.set_charge_limit(enabled)
        except Exception as e:
            decky_plugin.logger.error(f'error while setting charge limit {e}')

    async def set_als_enabled(self, enabled):
        try:
            settings.set_setting('alsEnabled', enabled)
        except Exception as e:
            decky_plugin.logger.error(f'error while setting als {e}')


    async def remap_button(self, button: str, action: str):
        decky_plugin.logger.info(f"remap_button {button} {action}")
        controller_code = None
        if button in ['Y3', 'M2', 'M3']:
            controller_code = controller_enums.Controller['RIGHT'].value
        elif button in ['Y1', 'Y2']:
            controller_code = controller_enums.Controller['LEFT'].value
        if not controller_code:
            return
        btn_code = controller_enums.RemappableButtons[button].value
        action_code = controller_enums.RemapActions[action].value
        remap_command = legion_configurator.create_button_remap_command(controller_code, btn_code, action_code)

        legion_configurator.send_command(remap_command)

    async def set_touchpad(self, enable: bool):
        t_toggle = legion_configurator.create_touchpad_command(enable)
        decky_plugin.logger.info(t_toggle)

        legion_configurator.send_command(t_toggle)

    async def ota_update(self):
        # trigger ota update
        try:
            with file_timeout.time_limit(15):
                plugin_update.ota_update()
        except Exception as e:
            logging.error(e)

    # Function called first during the unload process, utilize this to handle your plugin being removed
    async def _unload(self):
        decky_plugin.logger.info("Goodbye World!")
        pass

    # Migrations that should be performed before entering `_main()`.
    async def _migration(self):
        decky_plugin.logger.info("Migrating")
        # Here's a migration example for logs:
        # - `~/.config/decky-template/template.log` will be migrated to `decky_plugin.DECKY_PLUGIN_LOG_DIR/template.log`
        decky_plugin.migrate_logs(os.path.join(decky_plugin.DECKY_USER_HOME,
                                               ".config", "decky-template", "template.log"))
        # Here's a migration example for settings:
        # - `~/homebrew/settings/template.json` is migrated to `decky_plugin.DECKY_PLUGIN_SETTINGS_DIR/template.json`
        # - `~/.config/decky-template/` all files and directories under this root are migrated to `decky_plugin.DECKY_PLUGIN_SETTINGS_DIR/`
        decky_plugin.migrate_settings(
            os.path.join(decky_plugin.DECKY_HOME, "settings", "template.json"),
            os.path.join(decky_plugin.DECKY_USER_HOME, ".config", "decky-template"))
        # Here's a migration example for runtime data:
        # - `~/homebrew/template/` all files and directories under this root are migrated to `decky_plugin.DECKY_PLUGIN_RUNTIME_DIR/`
        # - `~/.local/share/decky-template/` all files and directories under this root are migrated to `decky_plugin.DECKY_PLUGIN_RUNTIME_DIR/`
        decky_plugin.migrate_runtime(
            os.path.join(decky_plugin.DECKY_HOME, "template"),
            os.path.join(decky_plugin.DECKY_USER_HOME, ".local", "share", "decky-template"))

    async def log_info(self, info):
        logging.info(info)
