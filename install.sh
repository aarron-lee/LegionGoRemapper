#!/usr/bin/bash
# does the following:
# - RGB control via LegionGoRemapper Decky Plugin
echo "removing previous install if it exists"

sudo rm -rf $HOME/homebrew/plugins/LegionGoRemapper

echo "installing LegionGoRemapper plugin for RGB control"
# download + install Legion go remapper
curl -L $(curl -s https://api.github.com/repos/aarron-lee/LegionGoRemapper/releases/latest | grep "browser_download_url" | cut -d '"' -f 4) -o $HOME/LegionGoRemapper.tar.gz
sudo tar -xzf LegionGoRemapper.tar.gz -C $HOME/homebrew/plugins

# install complete, remove build dir
rm  $HOME/LegionGoRemapper.tar.gz
echo "Installation complete"
