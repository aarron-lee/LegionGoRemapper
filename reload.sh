 #!/bin/bash

pnpm run build
sudo rm -R /home/deck/homebrew/plugins/LegionGoRemapper/
sudo cp -R /home/deck/Development/LegionGoRemapper/ /home/deck/homebrew/plugins/
sudo systemctl restart plugin_loader.service
