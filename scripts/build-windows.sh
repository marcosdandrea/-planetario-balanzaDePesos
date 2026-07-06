#!/bin/bash
# Build Windows executable without trying to rebuild native modules
# (serialport uses prebuilt binaries)
export npm_config_build_from_source=false
npx electron-builder --win --x64 --publish never
