# User Management API
A lightweight RESTful API built with **Node.js** and **Express** to manage a collection of users.

## Features
- **In-Memory Storage**: Users are stored in a sorted list by `username`.
- **Input Validation**: Custom logic to ensure data integrity (e.g., age must be ≥ 18, unique usernames).
- **CRUD Operations**: Complete management of user profiles.
- **Advanced Filtering**: List users with optional age filtering.

## Installation & Local Setup
1. **Clone the repository:**
   ```bash
   git clone https://github.com/WisalELALOUAN1/UserManagementAPI.git
   cd UserManagementAPI
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the server:** (the server will run on http://localhost:3000)
   ```bash
   npm start
   ```

## Running Tests
This project uses Jest (and Supertest) for testing API endpoints.
To run all tests:
```bash
npm test
```
## Project Structure
- **server.js**: Main application entry point and logic.
- **server.test.js**: Comprehensive test suite for the API.
- **package.json**: Project configuration and dependencies.

## API Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/users` | Create a new user (Age must be ≥ 18) |
| **GET** | `/users/:id` | Get a specific user by ID |
| **GET** | `/users/username/:username` | Get a specific user by username |
| **PUT** | `/users/:id` | Update a user by ID |
| **DELETE** | `/users/:id` | Delete a user by ID |
| **GET** | `/users` | List all users (Query param `?age=X` to filter) |

##  Manual Testing with cURL

You can test the API endpoints using the following commands in your terminal:

### 1. Create a User (POST)
```bash
curl -X POST http://localhost:3000/users \\
     -H "Content-Type: application/json" \\
     -d '{"username": "wisal_dev", "age": 22, "email": "wisal@example.com"}'
```

### 2. Test Age Validation 
```bash
curl -i -X POST http://localhost:3000/users \\
     -H "Content-Type: application/json" \\
     -d '{"username": "junior", "age": 16, "email": "junior@example.com"}'
```

### 3. Get All Users (GET)
```bash
curl -X GET http://localhost:3000/users
```

### 4. Search by Username (GET)
```bash
curl -X GET http://localhost:3000/users/username/wisal_dev
```

### 5. Filter by Age (GET with Query Param)
```bash
curl -X GET "http://localhost:3000/users?age=22"
```

### 6. Update a User (PUT)
```bash
curl -X PUT http://localhost:3000/users/1 \\
     -H "Content-Type: application/json" \\
     -d '{"username": "wisal_updated", "age": 23, "email": "new_email@example.com"}'
```

### 7. Delete a User (DELETE)
``` bash
curl -i -X DELETE http://localhost:3000/users/1
```


