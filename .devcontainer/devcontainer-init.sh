#!/bin/bash
set -e

# ensure all local config directories exist for mounting
mkdir -p ~/.config
mkdir -p ~/.docker
mkdir -p ~/.gnupg
mkdir -p ~/.password-store
mkdir -p ~/.ssh
