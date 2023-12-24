import subprocess
import decky_plugin

# all credit goes to corando98
# source: https://github.com/corando98/LLG_Dev_scripts/blob/main/LegionSpace.py

def execute_acpi_command(command):
    """
    Executes an ACPI command and returns the output.
    Uses subprocess for robust command execution.

    Args:
        command (str): The ACPI command to be executed.

    Returns:
        str: The output from the ACPI command execution.
    """
    try:
        result = subprocess.run(command, shell=True, check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        decky_plugin.logger.error(f"Error executing command: {e.stderr}")
        return None

def set_fan_curve(fan_table):
    """
    Sets a new fan curve based on the provided fan table array.
    The fan table should contain fan speed values that correspond to different temperature thresholds.

    Args:
        fan_table (list): An array of fan speeds to set the fan curve.

    Returns:
        str: The output from setting the new fan curve.
    """
    # Assuming Fan ID and Sensor ID are both 0 (as they are ignored)
    fan_id_sensor_id = '0x00, 0x00'

    # Assuming the temperature array length and values are ignored but required
    temp_array_length = '0x0A, 0x00, 0x00, 0x00'  # Length 10 in hex
    temp_values = ', '.join([f'0x{temp:02x}, 0x00' for temp in range(0, 101, 10)]) + ', 0x00'

    # Fan speed values in uint16 format with null termination
    fan_speed_values = ', '.join([f'0x{speed:02x}, 0x00' for speed in fan_table]) + ', 0x00'

    # Constructing the full command
    command = f"echo '\\_SB.GZFD.WMAB 0 0x06 {{{fan_id_sensor_id}, {temp_array_length}, {fan_speed_values}, {temp_array_length}, {temp_values}}}' |  tee /proc/acpi/call;  cat /proc/acpi/call"
    return execute_acpi_command(command)

# FFSS Full speed mode set on /off
# echo '\_SB.GZFD.WMAE 0 0x12 0x0104020000' | sudo tee /proc/acpi/call; sudo cat /proc/acpi/call
# echo '\_SB.GZFD.WMAE 0 0x12 0x0004020000' | sudo tee /proc/acpi/call; sudo cat /proc/acpi/call
def set_full_fan_speed(enable):
    """
    Enable or disable full fan speed mode.

    Args:
        enable (bool): True to enable, False to disable.

    Returns:
        str: The result of the operation.
    """
    status = '0x01' if enable else '0x00'
    command = f"echo '\\_SB.GZFD.WMAE 0 0x12 {status}04020000' | tee /proc/acpi/call; cat /proc/acpi/call"
    return execute_acpi_command(command)