 #!/bin/bash

pnpm run build
sudo rm -R $HOME/homebrew/plugins/LegionGoRemapper/
sudo cp -R ../LegionGoRemapper/ $HOME/homebrew/plugins/
sudo systemctl restart plugin_loader.service
