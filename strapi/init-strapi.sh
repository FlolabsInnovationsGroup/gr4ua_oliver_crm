#!/bin/bash
set -e

echo "🚀 Initializing Strapi project..."

# Create Strapi app directory if it doesn't exist
if [ ! -d "app" ]; then
    echo "📦 Creating new Strapi project..."
    npx create-strapi-app@latest app \
        --quickstart \
        --no-run \
        --skip-cloud \
        --typescript
    
    echo "✅ Strapi project created"
else
    echo "✅ Strapi project already exists"
fi

# Generate secrets if .env doesn't exist
if [ ! -f ".env" ]; then
    echo "🔐 Generating secure secrets..."
    
    JWT_SECRET=$(openssl rand -base64 32)
    ADMIN_JWT_SECRET=$(openssl rand -base64 32)
    KEY1=$(openssl rand -base64 32)
    KEY2=$(openssl rand -base64 32)
    KEY3=$(openssl rand -base64 32)
    KEY4=$(openssl rand -base64 32)
    API_TOKEN_SALT=$(openssl rand -base64 32)
    
    cat > .env << EOF
JWT_SECRET=${JWT_SECRET}
ADMIN_JWT_SECRET=${ADMIN_JWT_SECRET}
APP_KEYS=${KEY1},${KEY2},${KEY3},${KEY4}
API_TOKEN_SALT=${API_TOKEN_SALT}

DATABASE_CLIENT=postgres
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=strapi

PUBLIC_URL=http://localhost:1337
EOF
    
    echo "✅ Secrets generated and saved to .env"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "✨ Setup complete! Next steps:"
echo ""
echo "1. Start services:"
echo "   cd strapi && docker-compose up -d"
echo ""
echo "2. Create admin user:"
echo "   Visit http://localhost:1337/admin"
echo ""
echo "3. Import WordPress data:"
echo "   cd ../scripts && node import-wordpress-to-strapi.js"
echo ""
