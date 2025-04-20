# E-commerce REST API

This is a RESTful API for an e-commerce platform built with Node.js, Express, and MongoDB.

## Features

- Manage products, orders, and users
- JWT authentication and authorization
- Rate limiting to prevent abuse
- CSV data migration script for legacy data
- API documentation with Swagger

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start MongoDB server locally (default port 27017).

3. Run the server in development mode:

```bash
npm run dev
```

4. Access API documentation at:

```
http://localhost:3000/api-docs
```

## Data Migration

To migrate legacy CSV data to MongoDB, place CSV files in the `data/` directory and run:

```bash
node scripts/migrateCsvToMongo.js
```

## Environment Variables

- `JWT_SECRET`: Secret key for JWT token signing (default: 'your_jwt_secret')

## License

MIT
