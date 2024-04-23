import os
#import decky_plugin

def find_als():
    iio_path = '/sys/bus/iio/devices/'
    try:
        for device_dir in os.listdir(iio_path):
            if device_dir.startswith('iio:device'):
                device_name_path = os.path.join(iio_path, device_dir, 'name')
                with open(device_name_path, 'r') as file:
                    if file.read().strip() == 'als':
                        return device_dir

    except OSError as e:
        decky_plugin.logger.error(f"failed to find ALS {e}")

def read_als():
    als_device = find_als()
    sensor = f'/sys/bus/iio/devices/{als_device}/in_intensity_both_raw'

    # Check for commands, increase min_brightness_level or decrease min_brightness_level
    try:
        with open(sensor, 'r') as file:
            return int(file.read().strip())
    except OSError as e:
        decky_plugin.logger.error(f"Failed to read sensor data: {e}")
