# SUVIDHA Admin Dashboard

Admin dashboard for managing the SUVIDHA Kiosk System.

## Features

- **Dashboard**: Overview with key metrics and statistics
- **Monitoring**: Real-time kiosk health monitoring and alerts
- **Content Management**: Manage announcements and banners
- **Analytics**: View reports with charts and export data

## Tech Stack

- React 18 + TypeScript
- Material-UI v5
- Recharts for data visualization
- React Router for navigation
- Zustand for state management
- Axios for API calls
- Vite for building

## Development

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Run development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

```
VITE_API_URL=http://localhost:8080/api
```

## Docker

```bash
# Build image
docker build -t suvidha-admin-dashboard .

# Run container
docker run -p 3001:80 suvidha-admin-dashboard
```

## Pages

- `/login` - Admin login
- `/` - Dashboard with statistics
- `/monitoring` - Kiosk monitoring and alerts
- `/content` - Content management (announcements/banners)
- `/analytics` - Analytics and reports with charts

## API Integration

The dashboard connects to the SUVIDHA backend API through the API gateway at port 8080.

All endpoints require JWT authentication via `Authorization: Bearer <token>` header.
