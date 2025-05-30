## **README.md**

```markdown
# Property Listing Management System

A comprehensive backend system for managing property listings with advanced features including user authentication, CRUD operations, property favorites, recommendations, and Redis caching for optimized performance.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

## ✨ Features

### Core Features
- **User Authentication**: Secure registration and login with JWT tokens
- **Property Management**: Complete CRUD operations for property listings
- **Advanced Filtering**: Search properties by 10+ attributes including:
  - Property type, price range, location (state/city)
  - Area, bedrooms, bathrooms
  - Amenities, furnished status
  - Availability date, listing type (sale/rent)
  - Verification status, ratings
- **Property Favorites**: Users can save and manage favorite properties
- **Property Recommendations**: Share properties with other users via email
- **Redis Caching**: Optimized performance for frequent read operations
- **CSV Import**: Bulk import properties from CSV files

### Security Features
- Password hashing with bcrypt
- JWT-based authentication
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS configuration
- Helmet.js for security headers

### Performance Features
- Redis caching with TTL
- Database indexing for fast queries
- Pagination for large datasets
- Response compression
- Optimized query patterns

## 🛠 Tech Stack

- **Runtime**: Node.js (v14+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcrypt, helmet, cors
- **Validation**: express-validator
- **Logging**: Winston
- **Development**: Nodemon

## 📁 Project Structure

```
property-listing-api/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.js  # MongoDB & Redis connections
│   │   └── jwt.js       # JWT configuration
│   ├── models/          # Mongoose schemas
│   │   ├── Property.js  # Property model
│   │   └── User.js      # User model
│   ├── controllers/     # Request handlers
│   │   ├── authController.js
│   │   ├── propertyController.js
│   │   ├── favoriteController.js
│   │   └── recommendationController.js
│   ├── middleware/      # Custom middleware
│   │   ├── auth.js      # Authentication middleware
│   │   ├── cache.js     # Caching middleware
│   │   └── validation.js # Validation rules
│   ├── routes/          # API routes
│   │   ├── auth.js
│   │   ├── properties.js
│   │   ├── favorites.js
│   │   └── recommendations.js
│   ├── services/        # Business logic
│   │   ├── propertyService.js
│   │   └── cacheService.js
│   └── utils/           # Utility functions
│       ├── csvImporter.js    # CSV import utility
│       └── filterBuilder.js  # Query filter builder
├── .env                 # Environment variables
├── .gitignore          # Git ignore file
├── app.js              # Application entry point
├── package.json        # Dependencies
└── README.md           # Documentation
```

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Redis (v6 or higher)
- npm or yarn

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/property-listing-api.git
cd property-listing-api
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up MongoDB**
```bash
# Start MongoDB service
sudo service mongod start

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

4. **Set up Redis**
```bash
# Start Redis service
sudo service redis-server start

```

## ⚙️ Environment Setup

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/property_listing
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Security Configuration
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Cache Configuration
CACHE_TTL=3600
```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Import CSV Data
```bash
npm run import-csv path/to/your/properties.csv
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

### Property Endpoints

#### Create Property
```http
POST /properties
Authorization: Bearer <token>
Content-Type: application/json

{
  "propertyId": "PROP-001",
  "title": "Luxury Villa",
  "type": "Villa",
  "price": 2500000,
  "state": "Delhi",
  "city": "New Delhi",
  "areaSqFt": 3500,
  "bedrooms": 4,
  "bathrooms": 3,
  "amenities": ["pool", "gym", "garden"],
  "furnished": "Furnished",
  "availableFrom": "2025-08-01",
  "listedBy": "Owner",
  "listingType": "sale"
}
```

#### Get Properties with Filtering
```http
GET /properties?type=Villa&minPrice=1000000&maxPrice=5000000&city=Delhi&page=1&limit=20
```

#### Update Property
```http
PUT /properties/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 2800000,
  "description": "Updated description"
}
```

#### Delete Property
```http
DELETE /properties/:id
Authorization: Bearer <token>
```

### Favorites Endpoints

#### Add to Favorites
```http
POST /favorites
Authorization: Bearer <token>
Content-Type: application/json

{
  "propertyId": "property_id_here"
}
```

#### Get Favorites
```http
GET /favorites?page=1&limit=10
Authorization: Bearer <token>
```

#### Remove from Favorites
```http
DELETE /favorites/:propertyId
Authorization: Bearer <token>
```

### Recommendations Endpoints

#### Recommend Property
```http
POST /recommendations
Authorization: Bearer <token>
Content-Type: application/json

{
  "propertyId": "property_id_here",
  "recipientEmail": "friend@example.com",
  "message": "Check out this property!"
}
```

#### Get Recommendations
```http
GET /recommendations?page=1&limit=10
Authorization: Bearer <token>
```

## 🧪 Testing

### Using Postman

1. **Import the Postman Collection**
   - Open Postman
   - Click "Import" button
   - Select the `Property Listing API.postman_collection.json` file
   - Click "Import"

2. **Set Environment Variables**
   - Create a new environment in Postman
   - Add variable `baseUrl` with value `http://localhost:3000/api`
   - Save the environment

3. **Run Tests**
   - Start with the Authentication folder
   - Register a new user
   - Login to get the auth token
   - The token will be automatically saved for subsequent requests
   - Test other endpoints

### Manual Testing

You can also test the API using curl:

```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

