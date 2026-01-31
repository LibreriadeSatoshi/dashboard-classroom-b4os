# Makefile for B4OS Dashboard

# Variables
NPM = npm

# Phony targets (targets that are not files)
.PHONY: help install setup-env dev build start lint clean generate nvm-check

nvm-check:
	@echo "Checking Node.js version with nvm..."
	@if [ -f .nvmrc ]; then \
		nvm install; \
		nvm use; \
	else \
		echo "⚠️ .nvmrc not found. Please ensure you are using the correct Node.js version manually."; \
	fi

install: nvm-check
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