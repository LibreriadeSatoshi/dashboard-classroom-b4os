# Makefile for B4OS Dashboard

# Variables
NPM = npm
FRONTEND_DIR = frontend/

# Phony targets (targets that are not files)
.PHONY: help install setup-env dev build start lint clean

help:
	@echo "Makefile for B4OS Classroom Dashboard"
	@echo ""
	@echo "Usage:"
	@echo "  make help          - Show this help message"
	@echo "  make install       - Install frontend dependencies"
	@echo "  make setup-env     - Create frontend/.env.local from example"
	@echo "  make dev           - Start the frontend development server"
	@echo "  make build         - Build the frontend for production"
	@echo "  make start         - Start the production frontend server"
	@echo "  make lint          - Lint the frontend code"
	@echo "  make clean         - Remove generated files and caches"
	@echo ""

install:
	@echo "⚛️  Installing frontend dependencies..."
	cd $(FRONTEND_DIR) && $(NPM) install

setup-env:
	@echo "📝 Creating frontend .env.local file..."
	@if [ ! -f $(FRONTEND_DIR)/.env.local ]; then \
		cp $(FRONTEND_DIR)/env.local.example $(FRONTEND_DIR)/.env.local; \
		echo "✅ frontend/.env.local created. Please fill it with your credentials."; \
	else \
		echo "ℹ️ frontend/.env.local file already exists."; \
	fi

dev:
	@echo "🚀 Starting frontend development server..."
	cd $(FRONTEND_DIR) && $(NPM) run dev

build:
	@echo "📦 Building frontend for production..."
	cd $(FRONTEND_DIR) && $(NPM) run build
start:
	@echo "▶️  Starting production frontend server..."
	cd $(FRONTEND_DIR) && $(NPM) run start

lint:
	@echo "🔍 Linting frontend code..."
	cd $(FRONTEND_DIR) && $(NPM) run lint

clean:
	@echo "🧹 Cleaning up project..."
	@rm -rf $(FRONTEND_DIR)/.next
	@rm -rf $(FRONTEND_DIR)/node_modules
	@echo "✅ Cleanup complete."