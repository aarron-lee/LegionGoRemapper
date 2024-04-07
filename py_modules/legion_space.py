# import subprocess
import decky_plugin
from time import sleep
from typing import NamedTuple, Sequence

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

# on
# echo '\_SB.GZFD.WMAE 0 0x12 {0x01, 0x00, 0x01, 0x03, 0x01, 0x00, 0x00, 0x00}' | sudo tee /proc/acpi/call; sudo cat /proc/acpi/call   
# off        
# echo '\_SB.GZFD.WMAE 0 0x12 {0x01, 0x00, 0x01, 0x03, 0x00, 0x00, 0x00, 0x00}' | sudo tee /proc/acpi/call
# 80% charge limit
def set_charging_limit(enabled: bool):
    if enabled:
        return call(
            r"\_SB.GZFD.WMAE",
            [
                0,
                0x12,
                bytes(
                    [
                        0x01,
                        0x00,
                        0x01,
                        0x03,
                        0x01,
                        0x00,
                        0x00,
                        0x00
                    ]
                ),
            ],
        )
    else:
        return call(
            r"\_SB.GZFD.WMAE",
            [
                0,
                0x12,
                bytes(
                    [
                        0x01,
                        0x00,
                        0x01,
                        0x03,
                        0x00,
                        0x00,
                        0x00,
                        0x00
                    ]
                ),
            ],
        )

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
    if get_power_light() == enabled:
        return

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