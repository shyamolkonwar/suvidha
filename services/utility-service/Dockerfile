FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only-production
COPY . .
RUN npm run build
EXPOSE 8002
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
    CMD node -e "require('http').get('http://localhost:8002/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"
CMD ["npm", "start"]
