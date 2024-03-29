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
  docker-ce docker-ce-cli containerd.io docker-compose-plugin \
  yarn

RUN curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python -
ENV PATH /root/.poetry/bin:${PATH}
RUN poetry config virtualenvs.create false

# Installing app dependencies
RUN mkdir -p /app
COPY ./package.json /app/package.json
COPY ./yarn.lock /app/yarn.lock
COPY ./pyproject.toml /app/pyproject.toml
COPY ./poetry.lock /app/poetry.lock
WORKDIR /app

RUN yarn install
RUN poetry install

# Building app
COPY . /app/
RUN yarn build
RUN echo yes | ./manage.py collectstatic
