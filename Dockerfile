FROM python:3.10.5-slim-bullseye

ENV PYTHONUNBUFFERED 1

# Setting up debian
RUN apt-get update && apt-get install -y --no-install-recommends\
  ca-certificates \
  curl \
  gnupg \
  lsb-release \
  gcc \
  redis \
  npm \
  mariadb-server \
  libmariadb-dev \
  python3-dev

# Setting up docker installation
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
RUN echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo \
  "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

RUN apt-get update && apt-get install -y \
  docker-ce docker-ce-cli containerd.io \
  yarn


RUN mkdir -p /app
WORKDIR /app
COPY . /app/

RUN curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python -
ENV PATH "$HOME/.poetry/bin:${PATH}"

# Installing app dependencies
RUN poetry install
RUN yarn install
