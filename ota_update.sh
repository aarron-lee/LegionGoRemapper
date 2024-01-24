#!/usr/bin/bash
# does the following:
# - Update LegionGoRemapper Decky Plugin

if [ ! -f '/tmp/LegionGoRemapper.tar.gz' ]; then
  echo "Failed to find downloaded plugin"
  exit -1
fi

DECKY_DIR="$HOME/homebrew/plugins"

if [ ! -d $DECKY_DIR ]; then
  echo "Failed to find DECKY_DIR at: "
  echo $DECKY_DIR
  exit -1
fi

rm -rf $DECKY_DIR/LegionGoRemapper

tar -xzf /tmp/LegionGoRemapper.tar.gz -C $DECKY_DIR

# install complete, remove files
rm  -rf /tmp/LegionGoRemapper.tar.gz

systemctl restart plugin_loader.service
