# Full-Stack Library Management System

A premium, full-stack Library Management System built with **Spring Boot** (backend) and **React + Vite** (frontend), featuring JWT authentication, role-based access control, and a modern Glassmorphism UI.

---

## Features

- **JWT Authentication** — Register, login, and protected routes
- **Role-Based Access** — `USER` and `ADMIN` roles
- **Book Catalog** — Search, browse, and view books with pagination
- **Borrow & Return** — Full transaction lifecycle with due-date tracking
- **Global Error Handling** — Structured JSON error responses across all APIs
- **Request Validation** — Bean Validation on all API inputs
- **Premium UI** — Glassmorphism design, animated toasts, smooth loading states

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 21, Spring Boot 3.2, Spring Security, JJWT |
| Database | PostgreSQL |
| ORM | Spring Data JPA / Hibernate |
| Frontend | React 19, Vite, React Router DOM |
| HTTP Client | Axios |
| Icons | Lucide React |
| Containerization | Docker / Docker Compose |

---

## Getting Started

### Prerequisites
- Java 21+
- Node.js 18+
- Docker (optional, for PostgreSQL)
- Maven (or use the included `mvnw` wrapper)

---

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/library-management-system.git
cd library-management-system
```

---

### 2. Start the Database

Using Docker:
```bash
cd backend
docker-compose up -d
```

Or configure your own PostgreSQL instance and set the environment variables below.

---

### 3. Configure Backend Environment

Copy the example file:
```bash
cp backend/src/main/resources/application-local.properties.example \
   backend/src/main/resources/application-local.properties
```

Fill in your values in `application-local.properties`. You can also set these as OS environment variables:

| Variable | Description | Default |
|---|---|---|
| `DB_URL` | JDBC connection URL | `jdbc:postgresql://localhost:5432/library_db` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | — |
| `JWT_SECRET` | 256-bit Base64 JWT signing key | *(dev fallback set)* |
| `JWT_EXPIRATION` | Token lifetime in ms | `86400000` (24h) |

---

### 4. Run the Backend
```bash
cd backend
./mvnw spring-boot:run
```

The API will be available at `http://localhost:8080`.

---

### 5. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Project Structure

```
.
├── backend/                        # Spring Boot API
│   ├── src/main/java/com/lms/
│   │   ├── controller/             # REST endpoints
│   │   ├── service/                # Business logic
│   │   ├── repository/             # JPA repositories
│   │   ├── entity/                 # JPA entities
│   │   ├── dto/                    # Request/Response DTOs
│   │   ├── mapper/                 # Entity <-> DTO mappers
│   │   ├── exception/              # Global error handling
│   │   └── security/               # JWT filter + config
│   └── docker-compose.yml
│
└── frontend/                       # React + Vite SPA
    └── src/
        ├── api/                    # Axios service modules
        ├── components/             # Reusable UI components
        ├── context/                # AuthContext (global state)
        ├── pages/                  # Application pages
        └── constants.js            # Shared constants
```

---

## API Endpoints

### Auth
| Method | Endpoint | Access |
|---|---|---|
| `POST` | `/api/auth/register` | Public |
| `POST` | `/api/auth/login` | Public |

### Books
| Method | Endpoint | Access |
|---|---|---|
| `GET` | `/api/books` | Public |
| `GET` | `/api/books/{id}` | Public |
| `GET` | `/api/books/search?query=` | Public |
| `POST` | `/api/books` | Admin only |
| `PUT` | `/api/books/{id}` | Admin only |
| `DELETE` | `/api/books/{id}` | Admin only |

### Transactions
| Method | Endpoint | Access |
|---|---|---|
| `POST` | `/api/transactions/borrow/{bookId}` | Authenticated |
| `POST` | `/api/transactions/return/{bookId}` | Authenticated |
| `GET` | `/api/transactions/my-history` | Authenticated |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.
