# Evaluator

Repositorio perteneciente al proyecto de grado
**Sistema de apoyo al proceso de evaluación y calificación de prácticas en C++ de la materia programación básica**

## Instalación

El proyecto precisa de un entorno Linux, en Windows 10 y 11 puede utilizarse [WSL](https://docs.microsoft.com/es-es/windows/wsl/install).

Se puede utilizar [Docker](https://docs.docker.com/get-docker/) para crear un contenedor en cualquier sistema operativo, o realizar una instalación local de las dependencias en un entorno Linux.

### Dependencias obligatorias

- [Docker](https://docs.docker.com/get-docker/) y [Docker Compose](https://docs.docker.com/compose/install/compose-desktop/)
- MySQL o MariaDB

### Dependencias opcionales para instalación local:

- [Python 3.10](https://www.python.org/downloads/)
- [Nodejs 16+](https://nodejs.org/es/)
- [Redis](https://redis.io/download/)
- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/)
- [Poetry](https://python-poetry.org/docs/#installation)

### Utilizando Docker y Docker Compose

1. Clonar este repositorio y ubicarse dentro del mismo.
2. Crear el archivo mysql.conf en la raíz del repositorio, un ejemplo se encuentra en el archivo `mysql-example.conf`.
3. Construir el contenedor.
   ```
   docker-compose build
   ```
4. Ejecutar las migraciones.
   ```
   docker-compose run api ./manage.py migrate
   ```

### Instalación local

1. Clonar este repositorio y ubicarse dentro del mismo.
2. Crear el archivo mysql.conf en la raíz del repositorio, un ejemplo se encuentra en el archivo `mysql-example.conf`.
3. Instalar las dependencias del backend utilizando Poetry.
   ```
   poetry install
   ```
4. Ejecutar las migraciones
   ```
   poetry run ./manage.py migrate
   ```
5. Instalar las dependencias del frontend utilizando Yarn.
   ```
   yarn install
   ```

El proyecto arrancará en modo desarrollo utilizando los puertos http://localhost:3000 para el frontend y http://localhost:8000 para el backend.

## Ejecución

### Utilizando Docker compose

```
docker-compose up
```

### Instalación local

1. Ejecutar el backend
   ```
   poetry run ./manage.py runserver
   ```
2. Ejecutar el frontend
   ```
   yarn dev
   ```

El proyecto arrancará en modo desarrollo utilizando los puertos http://localhost:3000 para el frontend y http://localhost:8000 para el backend.

Las credenciales por defecto son:

- **Usuario:** docente
- **Contraseña:** 12345678
