import os
import logging
import hid

# The decky plugin module is located at decky-loader/plugin
# For easy intellisense checkout the decky-loader code one directory up
# or add the `decky-loader/plugin` path to `python.analysis.extraPaths` in `.vscode/settings.json`

import decky_plugin
import legion_configurator
import controller_enums
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
    # A normal method. It can be called from JavaScript using call_plugin_function("method_1", argument1, argument2)
    async def add(self, left, right):
        return left + right

    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    async def _main(self):
        decky_plugin.logger.info("Hello World!")

    async def rgb_color(self, controller: str, red, blue, green, brightness, current_game_id):
        updated_settings = {
            'red': red,
            'blue': blue,
            'green': green,
            'brightness': brightness
        }
        settings.set_rgb_profile_values(
            profileName=current_game_id,
            controller=controller,
            values=updated_settings
        )


        hex_brightness = int(brightness)
        color = bytes([red, green, blue])
        controller_code = controller_enums.Controller[controller].value
        rgb = legion_configurator.create_rgb_control_command(controller_code,0x01,color, hex_brightness, 0x01)
        decky_plugin.logger.info(list(rgb))
        legion_configurator.send_command(rgb)

    async def get_settings(self):
        return settings.get_settings()

    # def set_rgb_profile_values(profileName: str, controller: str, values):

    async def rgb_on(self, current_game_id, controller: str):
        settings.set_rgb_profile_value(
            profileName=current_game_id,
            controller=controller,
            key='enabled',
            value=True
        )

        controller_code = controller_enums.Controller[controller].value
        rgb_on_command = legion_configurator.create_rgb_on_off_command(controller_code, True)
        decky_plugin.logger.info(rgb_on_command)
        legion_configurator.send_command(rgb_on_command)

    async def rgb_off(self, current_game_id, controller: str):
        settings.set_rgb_profile_value(
            profileName=current_game_id,
            controller=controller,
            key='enabled',
            value=False
        )
                
        controller_code = controller_enums.Controller[controller].value
        rgb_off_command = legion_configurator.create_rgb_on_off_command(controller_code, False)
        decky_plugin.logger.info(rgb_off_command)
        legion_configurator.send_command(rgb_off_command)

    async def remap_button(self, button: str, action: str):
        decky_plugin.logger.info(f"remap_button {button} {action}")
        controller_code = None
        if button in ['Y3', 'M2', 'M3']:
            # remap command for right
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