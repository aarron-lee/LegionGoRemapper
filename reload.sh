 #!/bin/bash

pnpm run build
sudo rm -r /home/deck/homebrew/plugins/LegionGoRemapper/
sudo cp -r /home/deck/Development/LegionGoRemapper/ /home/deck/homebrew/plugins/
sudo systemctl restart plugin_loader.service
