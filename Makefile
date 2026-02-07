# Makefile for B4OS Dashboard

# Variables
NPM = npm

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
	$(NPM) install

setup-env:
	@echo "📝 Creating frontend .env.local file..."
	@if [ ! -f .env.local ]; then \
		cp env.local.example .env.local; \
		echo "✅ .env.local created. Please fill it with your credentials."; \
	else \
		echo "ℹ️ .env.local file already exists."; \
	fi

dev:
	@echo "🚀 Starting frontend development server..."
	$(NPM) run dev

build:
	@echo "📦 Building frontend for production..."
	$(NPM) run build
start:
	@echo "▶️  Starting production frontend server..."
	$(NPM) run start

lint:
	@echo "🔍 Linting frontend code..."
	$(NPM) run lint

clean:
	@echo "🧹 Cleaning up project..."
	@rm -rf .next
	@rm -rf node_modules
	@echo "✅ Cleanup complete."