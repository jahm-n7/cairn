#!/bin/sh
[ -d "$HOME/.local/node/bin" ] && export PATH="$HOME/.local/node/bin:$PATH"
exec npx expo start --web --port 8090
