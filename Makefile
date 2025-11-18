DOCKER_COMPOSE = docker compose
SERVICE = aik

.PHONY: all
all: build up

.PHONY: build
build:
	$(DOCKER_COMPOSE) build

.PHONY: up
up:
	$(DOCKER_COMPOSE) up

.PHONY: update
update:
	$(DOCKER_COMPOSE) up -d

.PHONY: down
down:
	$(DOCKER_COMPOSE) down

.PHONY: logs
logs:
	$(DOCKER_COMPOSE) logs -f $(service)

.PHONY: bash
bash:
	$(DOCKER_COMPOSE) exec $(SERVICE) /bin/bash


.PHONY: install
install:
	$(DOCKER_COMPOSE) exec $(SERVICE) pip install $(package)

.PHONY: clean
clean:
	$(DOCKER_COMPOSE) down -v --remove-orphans

.PHONY: help
help:
	@echo "Available targets:"
	@echo "  make build     - Build Docker images"
	@echo "  make up        - Start services"
	@echo "  make down      - Stop services"
	@echo "  make logs      - View logs (use 'make logs service=jupyter')"
	@echo "  make bash      - Enter bash shell in Jupyter service"
	@echo "  make install   - Install a package (use 'make install package=numpy')"
	@echo "  make clean     - Clean up Docker resources"
	@echo "  make help      - Display this help message"