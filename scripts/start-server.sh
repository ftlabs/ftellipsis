#!/bin/bash
# run this before https://gist.github.com/2630210
./scripts/kill-servers.sh phantom
./scripts/kill-servers.sh buster-server
./node_modules/buster/bin/buster-server & # fork to a subshell
phantomjs ./node_modules/buster/script/phantom.js &
sleep 0.5