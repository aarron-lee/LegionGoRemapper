import os
import pwd
import struct
import ctypes
import ctypes.util
import asyncio
import decky_plugin

GAMESCOPE_DISPLAY = ":0"
BACKLIGHT_PATH = "/sys/class/backlight/amdgpu_bl1"
BRIGHTNESS_FILE = os.path.join(BACKLIGHT_PATH, "brightness")
MAX_BRIGHTNESS_FILE = os.path.join(BACKLIGHT_PATH, "max_brightness")

MIN_NITS = 5.0
MAX_NITS = 500.0

_watcher_running = False
_last_brightness_value = -1
_gamescope_user = None

# libX11 handle (loaded once)
_libX11 = None
_x11_setup_done = False


def _load_libx11():
    """Load libX11.so and set up ctypes signatures."""
    global _libX11, _x11_setup_done
    if _x11_setup_done:
        return _libX11

    _x11_setup_done = True
    path = ctypes.util.find_library("X11")
    if not path:
        decky_plugin.logger.error("libX11 not found")
        return None

    try:
        lib = ctypes.CDLL(path)
        lib.XOpenDisplay.argtypes = [ctypes.c_char_p]
        lib.XOpenDisplay.restype = ctypes.c_void_p
        lib.XCloseDisplay.argtypes = [ctypes.c_void_p]
        lib.XCloseDisplay.restype = ctypes.c_int
        lib.XDefaultRootWindow.argtypes = [ctypes.c_void_p]
        lib.XDefaultRootWindow.restype = ctypes.c_ulong
        lib.XInternAtom.argtypes = [ctypes.c_void_p, ctypes.c_char_p, ctypes.c_int]
        lib.XInternAtom.restype = ctypes.c_ulong
        lib.XChangeProperty.argtypes = [
            ctypes.c_void_p, ctypes.c_ulong, ctypes.c_ulong, ctypes.c_ulong,
            ctypes.c_int, ctypes.c_int, ctypes.POINTER(ctypes.c_ubyte), ctypes.c_int
        ]
        lib.XChangeProperty.restype = ctypes.c_int
        lib.XFlush.argtypes = [ctypes.c_void_p]
        lib.XFlush.restype = ctypes.c_int

        _libX11 = lib
        decky_plugin.logger.info(f"Loaded libX11 from {path}")
        return lib
    except Exception as e:
        decky_plugin.logger.error(f"Failed to load libX11: {e}")
        return None


def is_legion_go_2():
    try:
        with open("/sys/devices/virtual/dmi/id/chassis_version", "r") as f:
            version = f.read().strip()
            return "Legion Go 8ASP2" in version
    except OSError:
        return False


def _find_gamescope_user():
    """Find the UID/GID of the user running gamescope.

    Scans /proc directly instead of using pgrep to avoid PATH issues
    in systemd service contexts.

    Returns (username, uid, gid) or None.
    """
    global _gamescope_user
    if _gamescope_user is not None:
        return _gamescope_user

    # Try /proc scan for gamescope process
    try:
        for entry in os.listdir("/proc"):
            if not entry.isdigit():
                continue
            try:
                with open(f"/proc/{entry}/comm", "r") as f:
                    comm = f.read().strip()
                if not comm.startswith("gamescope"):
                    continue
                stat = os.stat(f"/proc/{entry}")
                if stat.st_uid == 0:
                    continue
                pw = pwd.getpwuid(stat.st_uid)
                _gamescope_user = (pw.pw_name, pw.pw_uid, pw.pw_gid)
                return _gamescope_user
            except (OSError, KeyError, ValueError):
                continue
    except Exception as e:
        decky_plugin.logger.error(f"/proc scan failed: {e}")

    # Fallback: use X11 socket owner
    try:
        stat = os.stat("/tmp/.X11-unix/X0")
        if stat.st_uid != 0:
            pw = pwd.getpwuid(stat.st_uid)
            _gamescope_user = (pw.pw_name, pw.pw_uid, pw.pw_gid)
            return _gamescope_user
    except (OSError, KeyError) as e:
        decky_plugin.logger.error(f"X socket fallback failed: {e}")

    decky_plugin.logger.warning("Could not find gamescope process owner")
    return None



def _read_max_brightness():
    try:
        with open(MAX_BRIGHTNESS_FILE, "r") as f:
            return int(f.read().strip())
    except OSError as e:
        decky_plugin.logger.error(f"Failed to read max brightness: {e}")
        return 471000  # fallback default for LGo2


def _read_brightness():
    try:
        with open(BRIGHTNESS_FILE, "r") as f:
            return int(f.read().strip())
    except OSError as e:
        decky_plugin.logger.error(f"Failed to read brightness: {e}")
        return None


def _pct_to_nits(pct):
    """Convert a brightness percentage (0-100) to nits (5-500)."""
    ratio = max(0.0, min(100.0, pct)) / 100.0
    return MIN_NITS + ratio * (MAX_NITS - MIN_NITS)


def backlight_to_nits(bl_value, max_bl):
    ratio = bl_value / max_bl
    return MIN_NITS + ratio * (MAX_NITS - MIN_NITS)


def nits_to_gamescope_int(nits):
    """Pack a float nits value as a 32-bit unsigned int for the gamescope atom."""
    float_bytes = struct.pack('f', nits)
    return struct.unpack('I', float_bytes)[0]


def set_gamescope_brightness(nits):
    nits = max(MIN_NITS, min(MAX_NITS, nits))
    int_val = nits_to_gamescope_int(nits)

    lib = _load_libx11()
    if lib is None:
        return

    user_info = _find_gamescope_user()

    # Switch to gamescope user's credentials before opening the display.
    # We need to switch and switch back since this runs in the main process.
    original_uid = os.getuid()
    original_gid = os.getgid()
    original_groups = os.getgroups()
    switched = False

    try:
        if user_info and original_uid == 0:
            username, uid, gid = user_info
            os.setegid(gid)
            os.initgroups(username, gid)
            os.seteuid(uid)
            switched = True

        display = lib.XOpenDisplay(GAMESCOPE_DISPLAY.encode())
        if not display:
            decky_plugin.logger.error("Failed to open X display :0 via libX11")
            return

        try:
            root = lib.XDefaultRootWindow(display)
            atom_name = b"GAMESCOPE_SDR_ON_HDR_CONTENT_BRIGHTNESS"
            atom = lib.XInternAtom(display, atom_name, 0)
            cardinal = lib.XInternAtom(display, b"CARDINAL", 0)

            # Pack the value as a 32-bit array (one element)
            data = (ctypes.c_ubyte * 4)(*struct.pack('I', int_val))

            # PropModeReplace = 0, format = 32, nelements = 1
            lib.XChangeProperty(display, root, atom, cardinal, 32, 0, data, 1)
            lib.XFlush(display)
        finally:
            lib.XCloseDisplay(display)
    except Exception as e:
        decky_plugin.logger.error(f"Failed to set gamescope brightness: {e}")
    finally:
        if switched:
            os.seteuid(original_uid)
            os.setegid(original_gid)
            os.setgroups(original_groups)


def set_gamescope_brightness_pct(pct):
    """Set gamescope brightness from a 0-100 percentage. Used by ALS on LGo2."""
    nits = _pct_to_nits(pct)
    set_gamescope_brightness(nits)


async def backlight_watcher_loop():
    """Poll sysfs backlight and bridge changes to gamescope atom.

    Watches for sysfs brightness changes (from Steam slider) and reflects
    them to gamescope's HDR brightness atom.
    """
    global _watcher_running, _last_brightness_value

    _watcher_running = True
    max_bl = _read_max_brightness()
    decky_plugin.logger.info(
        f"Starting LGo2 backlight watcher (max_brightness={max_bl})"
    )

    while _watcher_running:
        await asyncio.sleep(0.05)  # 50ms polling

        bl_value = _read_brightness()
        if bl_value is None or bl_value == _last_brightness_value:
            continue

        _last_brightness_value = bl_value
        nits = backlight_to_nits(bl_value, max_bl)
        set_gamescope_brightness(nits)


def stop_backlight_watcher():
    global _watcher_running
    _watcher_running = False
    decky_plugin.logger.info("Stopping LGo2 backlight watcher")
