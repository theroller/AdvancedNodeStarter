FROM mcr.microsoft.com/vscode/devcontainers/base:0.201.5-ubuntu-20.04

ARG DEBIAN_FRONTEND=noninteractive
ARG TZ=America/Los_Angeles
ARG USER=vscode

RUN apt-get update \
    && apt-get install -y --no-install-recommends --no-install-suggests \
    apache2-utils \
    build-essential \
    gnupg-agent \
    pass \
    python3-pip \
    software-properties-common \
    tmux \
    tzdata \
    && apt-get -y --purge autoremove

WORKDIR /tmp

# docker
# ------------------------------------------------------------------------------
# https://github.com/microsoft/vscode-dev-containers/tree/master/containers/docker-from-docker

# docker cli
ARG DOCKER_VER=5:20.10.7~3-0~ubuntu-focal
ENV DOCKER_BUILDKIT=1
RUN curl -fsSL https://download.docker.com/linux/$(lsb_release -is | tr '[:upper:]' '[:lower:]')/gpg | apt-key add - 2>/dev/null \
    && echo "deb [arch=amd64] https://download.docker.com/linux/$(lsb_release -is | tr '[:upper:]' '[:lower:]') $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list \
    && apt-get update \
    && apt-get install -y docker-ce-cli=${DOCKER_VER} \
    && groupadd docker \
    && usermod -aG docker ${USER}

# docker-compose
ENV COMPOSE_DOCKER_CLI_BUILD=1
RUN LATEST_COMPOSE_VERSION=$(curl -sSL "https://api.github.com/repos/docker/compose/releases/latest" | grep -o -P '(?<="tag_name": ").+(?=")') \
    && curl -sSL "https://github.com/docker/compose/releases/download/${LATEST_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose \
    && chmod +x /usr/local/bin/docker-compose \
    && docker-compose version

# Default to root only access to the Docker socket, set up non-root init script
RUN touch /var/run/docker-host.sock \
    && ln -s /var/run/docker-host.sock /var/run/docker.sock \
    && apt-get update \
    && apt-get -y install socat

# Create docker-init.sh to spin up socat
RUN echo "#!/bin/sh\n\
    sudoIf() { if [ \"\$(id -u)\" -ne 0 ]; then sudo \"\$@\"; else \"\$@\"; fi }\n\
    sudoIf rm -rf /var/run/docker.sock\n\
    ((sudoIf socat UNIX-LISTEN:/var/run/docker.sock,fork,mode=660,user=${USER} UNIX-CONNECT:/var/run/docker-host.sock) 2>&1 >> /tmp/vscr-docker-from-docker.log) & > /dev/null\n\
    \"\$@\"" >> /usr/local/share/docker-init.sh \
    && chmod +x /usr/local/share/docker-init.sh

# VS Code overrides ENTRYPOINT and CMD when executing `docker run` by default.
# Setting the ENTRYPOINT to docker-init.sh will configure non-root access to
# the Docker socket if "overrideCommand": false is set in devcontainer.json.
# The script will also execute CMD if you need to alter startup behaviors.
ENTRYPOINT [ "/usr/local/share/docker-init.sh" ]
CMD [ "sleep", "infinity" ]
# ------------------------------------------------------------------------------

# github cli
ARG GH_CLI_VER=1.12.1
RUN curl -sSL https://github.com/cli/cli/releases/download/v${GH_CLI_VER}/gh_${GH_CLI_VER}_linux_amd64.deb -o gh_cli.deb \
    && dpkg -i gh_cli.deb \
    && gh --version

# node.js lts
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - \
    && apt-get install -y nodejs

# timezone
RUN ln -fs /usr/share/zoneinfo/${TZ} /etc/localtime \
    && dpkg-reconfigure tzdata


## user-dependent configurations
# ==============================================================================
USER ${USER}

RUN sudo apt install -y redis-server
