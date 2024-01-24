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
    # decky_plugin.logger.info(command)
    return execute_acpi_command(command)

def set_default_fan_curve():
    """
        # Fan ID, Sensor ID, ignored
        0x00, 0x00,
        # Temperature array length (10; ignored; suspected use)
        0x0A, 0x00, 0x00, 0x00,
        # Speeds in uint16, except last that is a byte.
        0x2c, 0x00, # FSS0 44
        0x30, 0x00, # FSS1 48
        0x37, 0x00, # FSS2 55
        0x3c, 0x00, # FSS3 60
        0x47, 0x00, # FSS4 71
        0x4f, 0x00, # FSS5 79
        0x57, 0x00, # FSS6 87
        0x57, 0x00, # FSS7 87
        0x64, 0x00, # FSS8 100
        0x64, 0x00, # FSS9 100
        0x00, # Null termination (?)
    """
    command = "echo '\_SB.GZFD.WMAB 0 0x06 {0x00, 0x00, 0x0A, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x30, 0x00, 0x37, 0x00, 0x3c, 0x00, 0x47, 0x00, 0x4f, 0x00, 0x57, 0x00, 0x57, 0x00, 0x64, 0x00, 0x64, 0x00, 0x00, 0x0a, 0x00, 0x00, 0x00, 0x0a, 0x00, 0x14, 0x00, 0x1e, 0x00, 0x28, 0x00, 0x32, 0x00, 0x3c, 0x00, 0x46, 0x00, 0x50, 0x00, 0x5a, 0x00, 0x64, 0x00, 0x00}' | tee /proc/acpi/call; cat /proc/acpi/call"
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