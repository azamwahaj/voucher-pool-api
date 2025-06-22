# Voucher Pool API (NestJS)

This is a NestJS application that provides a REST API for managing and redeeming voucher codes. It features customer and special offer management, voucher generation, redemption with transactions, and API rate limiting.

## Features

- Customer Management: Create and retrieve customer information.

- Special Offer Management: Create and retrieve special offer details, including discount percentages.

- Voucher Generation: Generate unique, time-bound voucher codes for specific customers and special offers.

- Voucher Redemption: Validate and redeem voucher codes. This process is atomic using database transactions, marking the voucher as used and returning the discount.

- Voucher Listing: Retrieve all valid (not expired, not used) vouchers for a given customer email.

- API Rate Limiting: Protects endpoints from abuse using @nestjs/throttler.

- Database Transactions: Ensures data consistency during voucher redemption.

- Swagger Documentation: Provides interactive API documentation accessible via a web interface.

- Docker Support: Easily set up the application and its PostgreSQL database using Docker Compose.

- Unit Tests: Comprehensive unit tests for core services.

## Technologies Used
- NestJS: A progressive Node.js framework for building efficient, reliable, and scalable server-side applications.

- TypeScript: Type-safe programming language.

- TypeORM: An ORM (Object Relational Mapper) that runs in Node.js and allows you to work with your database using TypeScript classes.

- PostgreSQL: A powerful, open source object-relational database system.

- Docker & Docker Compose: For containerization and easy deployment.

- @nestjs/throttler: For API rate limiting.

- Swagger (OpenAPI): For API documentation.

- Jest: For unit testing.

- nanoid: For generating unique voucher codes.

## Getting Started
### Prerequisites
- Node.js (v18 or higher recommended)

- npm (Node Package Manager)

- Docker and Docker Compose


### 1. Clone the Repository

```bash
git clone https://github.com/azamwahaj/voucher-pool-api.git
cd voucher-pool-api
```

### 2. Configure Environment Variables
Create a .env file in the root of the project and populate it with the following:

```bash
# Database Configuration
POSTGRES_DB=voucher_db
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_PORT=5432

# Application Configuration
APP_PORT=3000

# API Rate Limiting Configuration
# TTL (Time to Live) in seconds, Limit (max requests within TTL)
THROTTLER_TTL=60
THROTTLER_LIMIT=100
```

### 3. Build and Run with Docker Compose (Recommended)

This method sets up both the PostgreSQL database and the NestJS application in separate containers.

```bash
docker-compose up --build
```

This command will:

- Build the `app` Docker image based on the Dockerfile.

- Start the `db` (PostgreSQL) service.

- Start the `app` (NestJS) service.

- The NestJS application will automatically connect to the PostgreSQL database via the `db` service name.

- `synchronize: true` in `TypeOrmModule` will create the database schema automatically on startup (for development). Remember to set `synchronize: false` and use migrations for production environments.

Once the containers are up and running, you should see logs indicating that the NestJS application has started, typically on `http://localhost:3000` (or the `APP_PORT` you configured).

### 4. Access the API Documentation (Swagger)

Open your web browser and navigate to:

`http://localhost:3000/api`

Here you will find interactive API documentation where you can test the endpoints.

### 5. Manual Setup (Alternative to Docker)
If you prefer to run the application directly on your machine without Docker:

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL (e.g., via Docker desktop or local installation)
#    Ensure your PostgreSQL server is running and accessible at the host and port
#    specified in your .env file (e.g., localhost:5432).

# 3. Build the application
npm run build

# 4. Run the application
npm start
```

## API Endpoints
All endpoints are prefixed with `/api` in the Swagger UI.

### Customers
- `POST /customers`: Create a new customer.

- `GET /customers`: Get all customers.

- `GET /customers/:id`: Get a customer by ID.

- `DELETE /customers/:id`: Delete a customer by ID.

### Special Offers
- `POST /special-offers`: Create a new special offer.

- `GET /special-offers`: Get all special offers.

- `GET /special-offers/:id`: Get a special offer by ID.

- `DELETE /special-offers/:id`: Delete a special offer by ID.

### Vouchers
- `POST /vouchers/generate`: Generate a new voucher code for a customer and special offer.

  - Request Body: `customerName`, `customerEmail`, `specialOfferName`, `expirationDate` (ISO 8601 string)

- `POST /vouchers/redeem`: Validate and redeem a voucher code.

  - Request Body: `code`, `customerEmail`

- `GET /vouchers/customer-valid?email={customerEmail}`: Get all valid (not expired, not used) voucher codes for a given customer email.

## Running Tests
To run the unit tests:

```bash
npm run test
```

## Important Considerations for Production
- Database Migrations: For production environments, set `synchronize: false` in `TypeOrmModule.forRootAsync` in `app.module.ts`. Use TypeORM migrations to manage schema changes (e.g., `typeorm migration:generate`, `typeorm migration:run`).

- Security: Implement authentication (e.g., JWT) and authorization for sensitive endpoints.

- Error Handling: Enhance error handling for more specific and user-friendly messages.

- Logging: Implement a robust logging solution.

- Configuration: Use a more secure configuration management system than plain `.env` files.

- HTTPS: Always deploy with HTTPS in production.