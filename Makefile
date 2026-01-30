# Makefile for B4OS Dashboard

# Variables
NPM = npm

# Phony targets (targets that are not files)
.PHONY: help install setup-env dev build start lint clean generate

help:
	@echo "Makefile for B4OS Classroom Dashboard"
	@echo ""
	@echo "Usage:"
	@echo "  make help          - Show this help message"
	@echo "  make install       - Install dependencies"
	@echo "  make setup-env     - Create .env.local from example"
	@echo "  make dev           - Start the development server"
	@echo "  make build         - Build the app for production"
	@echo "  make start         - Start the production server"
	@echo "  make lint          - Lint the code"
	@echo "  make generate      - Generate a new component"
	@echo "  make clean         - Remove generated files and caches"
	@echo ""

install:
	@echo "⚛️  Installing dependencies..."
	$(NPM) install

setup-env:
	@echo "📝 Creating .env.local file..."
	@if [ ! -f .env.local ]; then \
		cp env.local.example .env.local; \
		echo "✅ .env.local created. Please fill it with your credentials."; \
	else \
		echo "ℹ️ .env.local file already exists."; \
	fi

dev:
	@echo "🚀 Starting development server..."
	$(NPM) run dev

build:
	@echo "📦 Building for production..."
	$(NPM) run build

start:
	@echo "▶️  Starting production server..."
	$(NPM) run start

lint:
	@echo "🔍 Linting code..."
	$(NPM) run lint

generate:
	@echo "✨ Generating a new component..."
	$(NPM) run generate

clean:
	@echo "🧹 Cleaning up project..."
	@rm -rf .next
	@rm -rf node_modules
	@echo "✅ Cleanup complete."