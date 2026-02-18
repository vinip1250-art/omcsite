#!/bin/sh
echo "Rodando prisma db push..."
npx prisma db push --schema=./prisma/schema.prisma --skip-generate
echo "Iniciando servidor..."
node .next/standalone/server.js
EOF

chmod +x ~/server/omcsite/start.sh
