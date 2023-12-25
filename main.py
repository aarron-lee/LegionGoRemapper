import os
import logging

# The decky plugin module is located at decky-loader/plugin
# For easy intellisense checkout the decky-loader code one directory up
# or add the `decky-loader/plugin` path to `python.analysis.extraPaths` in `.vscode/settings.json`

import decky_plugin
import legion_configurator
import legion_space
import controller_enums
import rgb
import controllers
import controller_settings as settings


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

        try:
            if settings.supports_custom_fan_curves():
                results['supportsCustomFanCurves'] = True
            else:
                results['supportsCustomFanCurves'] = False
        except Exception as e:
            decky_plugin.logger.error(e)

        return results

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

    async def save_fan_settings(self, fanInfo, currentGameId):
        fanProfiles = fanInfo.get('fanProfiles', {})
        fanPerGameProfilesEnabled = fanInfo.get('fanPerGameProfilesEnabled', False)
        customFanCurvesEnabled = fanInfo.get('customFanCurvesEnabled', False)
        # Set Full Fan Speed Mode
        enableFullFanSpeedMode = fanInfo.get('enableFullFanSpeedMode', False)

        settings.set_setting('fanPerGameProfilesEnabled', fanPerGameProfilesEnabled)
        settings.set_setting('customFanCurvesEnabled', customFanCurvesEnabled)
        settings.set_setting('enableFullFanSpeedMode', enableFullFanSpeedMode)

        settings.set_all_fan_profiles(fanProfiles)

        try:
            active_fan_profile = fanProfiles.get('default')

            if customFanCurvesEnabled and settings.supports_custom_fan_curves():
                if fanPerGameProfilesEnabled:
                    fan_profile = fanProfiles.get(currentGameId)
                    if fan_profile:
                        active_fan_profile = fan_profile
                active_fan_curve = active_fan_profile.values()

                legion_space.set_fan_curve(active_fan_curve)

                legion_space.set_full_fan_speed(enableFullFanSpeedMode)

            return True
        except Exception as e:
            decky_plugin.logger(f'save_fan_settings error {e}')
            return False

    # sync state in settings.json to actual controller RGB hardware
    async def sync_rgb_settings(self, currentGameId):
        return rgb.sync_rgb_settings(currentGameId)

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