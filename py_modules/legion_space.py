# import subprocess
import decky_plugin
from time import sleep
from typing import NamedTuple, Sequence

# all credit goes to corando98
# source: https://github.com/corando98/LLG_Dev_scripts/blob/main/LegionSpace.py

# def execute_acpi_command(command):
#     """
#     Executes an ACPI command and returns the output.
#     Uses subprocess for robust command execution.

#     Args:
#         command (str): The ACPI command to be executed.

#     Returns:
#         str: The output from the ACPI command execution.
#     """
#     try:
#         result = subprocess.run(command, shell=True, check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
#         return result.stdout.strip()
#     except subprocess.CalledProcessError as e:
#         decky_plugin.logger.error(f"Error executing command: {e.stderr}")
#         return None

# def set_default_fan_curve():
#     """
#         # Fan ID, Sensor ID, ignored
#         0x00, 0x00,
#         # Temperature array length (10; ignored; suspected use)
#         0x0A, 0x00, 0x00, 0x00,
#         # Speeds in uint16, except last that is a byte.
#         0x2c, 0x00, # FSS0 44
#         0x30, 0x00, # FSS1 48
#         0x37, 0x00, # FSS2 55
#         0x3c, 0x00, # FSS3 60
#         0x47, 0x00, # FSS4 71
#         0x4f, 0x00, # FSS5 79
#         0x57, 0x00, # FSS6 87
#         0x57, 0x00, # FSS7 87
#         0x64, 0x00, # FSS8 100
#         0x64, 0x00, # FSS9 100
#         0x00, # Null termination (?)
#     """
#     command = "echo '\_SB.GZFD.WMAB 0 0x06 {0x00, 0x00, 0x0A, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x30, 0x00, 0x37, 0x00, 0x3c, 0x00, 0x47, 0x00, 0x4f, 0x00, 0x57, 0x00, 0x57, 0x00, 0x64, 0x00, 0x64, 0x00, 0x00, 0x0a, 0x00, 0x00, 0x00, 0x0a, 0x00, 0x14, 0x00, 0x1e, 0x00, 0x28, 0x00, 0x32, 0x00, 0x3c, 0x00, 0x46, 0x00, 0x50, 0x00, 0x5a, 0x00, 0x64, 0x00, 0x00}' | tee /proc/acpi/call; cat /proc/acpi/call"
#     return execute_acpi_command(command)

# source: hhd-adjustor
# https://github.com/hhd-dev/adjustor/blob/072411bff14bb5996b0fe00da06f36d17f31a389/src/adjustor/core/lenovo.py#L13

def set_full_fan_speed(enable: bool):
    decky_plugin.logger.info(f"Setting full fan mode to {enable}.")
    return set_feature(0x04020000, int(enable))

def set_active_fan_curve(arr: Sequence[int]):
    current_mode = get_tdp_mode()

    if current_mode != "custom":
        # set custom
        set_tdp_mode("custom")
    
    sleep(0.3)

    set_fan_curve(arr)

def set_fan_curve(arr: Sequence[int]):
    decky_plugin.logger.info(f"Setting fan curve to:\n{arr}")
    if len(arr) != 10:
        decky_plugin.logger.error(f"Invalid fan curve length: {len(arr)}. Should be 10.")
        return False
    if any(not isinstance(d, int) for d in arr):
        decky_plugin.logger.error(f"Curve has null value, not setting.")
        return False

    return call(
        r"\_SB.GZFD.WMAB",
        [
            0,
            0x06,
            bytes(
                [
                    0x00,
                    0x00,
                    0x0A,
                    0x00,
                    0x00,
                    0x00,
                    arr[0],
                    0x00,
                    arr[1],
                    0x00,
                    arr[2],
                    0x00,
                    arr[3],
                    0x00,
                    arr[4],
                    0x00,
                    arr[5],
                    0x00,
                    arr[6],
                    0x00,
                    arr[7],
                    0x00,
                    arr[8],
                    0x00,
                    arr[9],
                    0x00,
                    0x00,
                    0x0A,
                    0x00,
                    0x00,
                    0x00,
                    0x0A,
                    0x00,
                    0x14,
                    0x00,
                    0x1E,
                    0x00,
                    0x28,
                    0x00,
                    0x32,
                    0x00,
                    0x3C,
                    0x00,
                    0x46,
                    0x00,
                    0x50,
                    0x00,
                    0x5A,
                    0x00,
                    0x64,
                    0x00,
                    0x00,
                ]
            ),
        ],
    )

def set_tdp_mode(mode):
    decky_plugin.logger.info(f"Setting tdp mode to '{mode}'.")
    match mode:
        case "quiet":
            b = 0x01
        case "balanced":
            b = 0x02
        case "performance":
            b = 0x03
        case "custom":
            b = 0xFF
        case _:
            decky_plugin.logger.error(f"TDP mode '{mode}' is unknown. Not setting.")
            return False

    return call(r"\_SB.GZFD.WMAA", [0, 0x2C, b])

def get_tdp_mode():
    if not call(r"\_SB.GZFD.WMAA", [0, 0x2D, 0], risky=False):
        decky_plugin.logger.error(f"Failed retrieving TDP Mode.")
        return None

    match read():
        case 0x01:
            return "quiet"
        case 0x02:
            return "balanced"
        case 0x03:
            return "performance"
        case 0xFF:
            return "custom"
        case v:
            decky_plugin.logger.error(f"TDP mode '{v}' is unknown")
            return None
        

def call(method: str, args: Sequence[bytes | int], risky: bool = True):
    cmd = method
    for arg in args:
        if isinstance(arg, int):
            cmd += f" 0x{arg:02x}"
        else:
            cmd += f" b{arg.hex()}"

    log = decky_plugin.logger.info
    log(f"Executing ACPI call:\n'{cmd}'")

    try:
        with open("/proc/acpi/call", "wb") as f:
            f.write(cmd.encode())
        return True
    except Exception as e:
        decky_plugin.logger.error(f"ACPI Call failed with error:\n{e}")
        return False

def read():
    with open("/proc/acpi/call", "rb") as f:
        d = f.read().decode().strip()

    if d == "not called\0":
        return None
    if d.startswith("0x") and d.endswith("\0"):
        return int(d[:-1], 16)
    if d.startswith("{") and d.endswith("}\0"):
        bs = d[1:-2].split(", ")
        return bytes(int(b, 16) for b in bs)
    assert False, f"Return value '{d}' supported yet or was truncated."    

def set_feature(id: int, value: int):
    return call(
        r"\_SB.GZFD.WMAE",
        [
            0,
            0x12,
            int.to_bytes(id, length=4, byteorder="little", signed=False)
            + int.to_bytes(value, length=4, byteorder="little", signed=False),
        ],
    )

def set_power_light(enabled: bool):
    decky_plugin.logger.info(f"Setting power light status.")
    return call(r"\_SB.GZFD.WMAF", [0, 0x02, bytes([0x03, int(enabled), 0x00])])


def get_power_light():
    decky_plugin.logger.info(f"Getting power light status.")
    if not call(r"\_SB.GZFD.WMAF", [0, 0x01, 0x03], risky=False):
        return None
    o = read()
    if isinstance(o, bytes) and len(o) == 2:
        return bool(o[0])
    return None