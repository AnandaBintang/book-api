# Book API

A RESTful API for managing books, authors, and users built with Node.js, Express, and PostgreSQL.

## Features

- **User Authentication**: Register and login with JWT tokens
- **Author Management**: CRUD operations for authors
- **User Management**: User profile management
- **Book Management**: CRUD operations for books (coming soon)
- **Pagination**: Built-in pagination for list endpoints
- **Search**: Search functionality for authors and books
- **Validation**: Input validation using express-validator
- **Security**: Password hashing with bcrypt

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Query Builder**: Knex.js
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: express-validator
- **Environment Variables**: dotenv
- **Package Manager**: pnpm

## Prerequisites

Before running this project, make sure you have the following installed:

- Node.js (v18 or higher)
- PostgreSQL
- pnpm (recommended) or npm

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd book-api
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory and configure the following variables:
   ```env
   PORT=3000

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=bookstore

   # JWT Secrets (generate your own secure keys)
   ACCESS_TOKEN_SECRET="your_access_token_secret"
   REFRESH_TOKEN_SECRET="your_refresh_token_secret"
   ACCESS_TOKEN_EXPIRY=15m
   REFRESH_TOKEN_EXPIRY=7d

   # Pagination
   PER_PAGE=10
   ```

4. **Set up PostgreSQL database**
   
   Create a PostgreSQL database:
   ```sql
   CREATE DATABASE bookstore;
   ```

5. **Run database migrations**
   ```bash
   npx knex migrate:latest
   ```

6. **Start the development server**
   ```bash
   pnpm run dev
   ```

   The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user

### Users

- `GET /users` - Get all users (authenticated)
- `GET /users/:id` - Get user by ID (authenticated)
- `PUT /users/:id` - Update user (authenticated)
- `DELETE /users/:id` - Delete user (authenticated)

### Authors

- `GET /authors` - Get all authors with pagination and search (authenticated)
- `POST /authors` - Create new author (authenticated)
- `GET /authors/:id` - Get author by ID (authenticated)
- `PUT /authors/:id` - Update author (authenticated)
- `DELETE /authors/:id` - Delete author (authenticated)

### Query Parameters

For list endpoints (GET /authors, GET /users):
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search term for filtering

## Request/Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...},
  "statusCode": 200,
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "data": null,
  "errors": "Detailed error information",
  "statusCode": 400
}
```

## Database Schema

### Users Table
- `id` - Primary key
- `username` - User's username
- `email` - User's email (unique)
- `password` - Hashed password
- `created_at` - Timestamp

### Authors Table
- `id` - Primary key
- `name` - Author's name
- `bio` - Author's biography
- `created_at` - Timestamp

### Books Table (coming soon)
- `id` - Primary key
- `title` - Book title
- `author_id` - Foreign key to authors table
- `isbn` - Book ISBN
- `publication_date` - Publication date
- `created_at` - Timestamp

## Development

### Available Scripts

- `pnpm run dev` - Start development server with nodemon
- `pnpm start` - Start production server
- `pnpm test` - Run tests (not implemented yet)

### Database Operations

- **Create migration**: `npx knex migrate:make migration_name`
- **Run migrations**: `npx knex migrate:latest`
- **Rollback migration**: `npx knex migrate:rollback`
- **Create seed**: `npx knex seed:make seed_name`
- **Run seeds**: `npx knex seed:run`

## Project Structure

```
book-api/
├── db/
│   └── knex.js              # Database connection
├── middleware/
│   ├── auth.js              # Authentication middleware
│   └── validate.js          # Validation middleware
├── migrations/
│   ├── create_users_table.js
│   ├── create_authors_table.js
│   └── create_books_table.js
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User routes
│   └── authors.js           # Author routes
├── seeds/                   # Database seeds
├── types/
│   └── response.js          # Response format types
├── .env                     # Environment variables
├── index.js                 # Application entry point
├── knexfile.js              # Knex configuration
├── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Troubleshooting

### Common Issues

1. **Module is not defined in ES module scope**
   - Make sure your `knexfile.js` uses `export default` instead of `module.exports`

2. **PostgreSQL connection issues**
   - Verify PostgreSQL is running
   - Check your database credentials in `.env`
   - Ensure the database exists

3. **Migration errors**
   - Check your knexfile.js configuration
   - Verify database connection settings
   - Ensure PostgreSQL user has proper permissions

4. **JWT Token issues**
   - Make sure you have strong, unique secrets in your `.env` file
   - Verify token expiry settings

For more help, please check the issues section or create a new issue.