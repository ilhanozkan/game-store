# 🎮 Game Store

A prototype of an e-commerce site selling game products.

This project was developed using **React, TypeScript, Node.js, Express** and **Apollo GraphQL**.

![Overview](./%40readme-images/overview.gif)

This project inspired from [@folab](https://www.figma.com/@folab)'s [Game Drill design](https://www.figma.com/community/file/1138582638202684580).

Get the **live version** without installation **in [here](https://radiant-spire-46493.herokuapp.com/ "Live preview")**.

## Installation Prerequisites

> Make sure you have **Node.js 22 or newer** installed on your system.
>
> A local [MongoDB](https://www.mongodb.com/try/download/community) is optional during development: when `MONGO_URI` is not set, the backend starts a temporary in-memory MongoDB seeded with demo data.

If you haven't cloned this repository to your local machine yet, clone it first with fetch options (HTTPS, SSH, GitHub CLI).

If you have already cloned, you can skip to **Installation & Running** steps.

**Clone this repository**

Open your terminal and clone this repository to your local with the HTTPS option.

```bash
$ git clone https://github.com/ilhanozkan/game-store.git
```

## Installation & Running

### Backend

1 - Create environment variables file

Create a file named `.env` under the `backend` folder.

Example **.env** file (see [`backend/.env.example`](backend/.env.example)):

```bash
# Optional during development (an in-memory database is used when unset)
MONGO_URI=mongodb://127.0.0.1:27017/game-store
PORT=5000
# Required in production
JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

| Variable         | Default                  | Description                                                         |
| ---------------- | ------------------------ | ------------------------------------------------------------------- |
| `MONGO_URI`      | _in-memory database_     | MongoDB connection string. Required when `NODE_ENV=production`.     |
| `PORT`           | `5000`                   | Port for both the GraphQL (`/graphql`) and REST (`/api`) endpoints. |
| `JWT_SECRET`     | _development-only value_ | Secret used to sign login tokens. Required in production.           |
| `JWT_EXPIRES_IN` | `7d`                     | How long login tokens stay valid.                                   |
| `CORS_ORIGIN`    | `*`                      | Comma-separated origins allowed to call the API.                    |

2 - Install dependencies

Navigate to the backend folder in terminal.

```bash
cd game-store/backend
```

Run installation command in terminal.

```bash
npm i
```

3 - Seed the database

Load the categories, products and demo accounts into the database configured by `MONGO_URI`. Seeding is idempotent; add `-- --reset` to wipe all collections first.

```bash
npm run seed
```

You can skip this step when running without `MONGO_URI`, because the in-memory database is seeded automatically.

4 - Start the backend

Start the backend in development (restarts on file changes):

```bash
npm run dev
```

Use `npm start` to run it without watching. The API is then available at:

- GraphQL: `http://localhost:5000/graphql` (open it in a browser for Apollo Sandbox)
- REST: `http://localhost:5000/api`

Run the backend test suite with `npm test`.

### Frontend

1 - Create environment variables file

Create a file named `.env.local` under the `frontend` folder.

Example **.env.local** file:

```bash
REACT_APP_API_URL=http://localhost:5000/graphql
```

2 - Install dependencies

Navigate to the frontend folder in terminal.

```bash
cd game-store/frontend
```

Run installation command in terminal.

```bash
npm i
```

3 - Start the frontend

Start the frontend in development.

```bash
npm start
```

## Demo accounts

The seed creates two accounts for local development:

| Username | Password       | Role     | Store balance |
| -------- | -------------- | -------- | ------------- |
| `fola`   | `gamestore123` | customer | ₦500,000      |
| `admin`  | `admin12345`   | admin    | ₦0            |

> These credentials are for local development only. Never seed them into a production database.

## Data model

Seed data lives in [`backend/data`](backend/data) and the Mongoose models in [`backend/models`](backend/models). Prices and balances are stored in whole Naira (NGN).

```mermaid
erDiagram
    CATEGORY ||--o{ PRODUCT : "slug = category"
    USER }o--o{ PRODUCT : favorites
    USER ||--o{ ORDER : places
    ORDER ||--|{ ORDER_ITEM : contains
    ORDER_ITEM }o--|| PRODUCT : snapshots
    USER ||--o{ TRANSACTION : "balance ledger"
    ORDER |o--o| TRANSACTION : "paid by"

    CATEGORY {
        string name
        string slug UK
        string description
        number position
    }
    PRODUCT {
        string name
        string slug UK
        string brand
        string category FK
        number price
        number stock
        string img
        string description
        number rating
        number reviewCount
        array specs
    }
    USER {
        string name
        string username UK
        string email UK
        string passwordHash "bcrypt, never selected by default"
        string role "customer | admin"
        number balance
        ObjectId[] favorites
    }
    ORDER {
        ObjectId user FK
        number total
        string status "paid | cancelled"
    }
    ORDER_ITEM {
        ObjectId product FK
        string name
        number price
        number quantity
    }
    TRANSACTION {
        ObjectId user FK
        string type "top-up | purchase"
        number amount
        number balanceAfter
        ObjectId order FK
    }
```

## API

The backend serves GraphQL and a small read-mostly REST API from the same port. Authenticated requests send `Authorization: Bearer <token>`, where the token comes from the `login` or `register` mutation.

### GraphQL (`/graphql`)

| Operation                                       | Auth     | Description                                                     |
| ----------------------------------------------- | -------- | --------------------------------------------------------------- |
| `products(category, search, sort, inStockOnly)` | –        | Lists products. `category` accepts a slug or a name.            |
| `product(id)`                                   | –        | Finds a product by ID or slug.                                  |
| `categories`, `category(slug)`                  | –        | Categories with product counts.                                 |
| `me`                                            | optional | The signed-in user, or `null`.                                  |
| `myOrders`, `myTransactions`                    | user     | Order history and balance ledger, newest first.                 |
| `register(input)`, `login(input)`               | –        | Return `{ token, user }`. `login` accepts a username or email.  |
| `updateProfile(input)`                          | user     | Updates name, email or avatar URL.                              |
| `toggleFavorite(productId)`                     | user     | Adds or removes a favorite.                                     |
| `topUpBalance(amount)`                          | user     | Adds demo store credit (whole Naira).                           |
| `checkout(items)`                               | user     | Pays for the cart from the balance, reserving stock atomically. |
| `createProduct(input)`                          | admin    | Adds a product to the catalog.                                  |

Errors carry an `extensions.code`: `BAD_USER_INPUT`, `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `INSUFFICIENT_BALANCE` or `INTERNAL_SERVER_ERROR`.

### REST (`/api`)

| Method & path                      | Auth  | Description                                                                    |
| ---------------------------------- | ----- | ------------------------------------------------------------------------------ |
| `GET /api/health`                  | –     | Service and database status.                                                   |
| `GET /api/categories`              | –     | All categories in navigation order.                                            |
| `GET /api/products`                | –     | Query params: `category`, `search`, `sort` (e.g. `price_asc`), `inStock=true`. |
| `GET /api/products/category/:name` | –     | Products in a category (slug or name).                                         |
| `GET /api/products/:idOrSlug`      | –     | A single product, or `404`.                                                    |
| `POST /api/products`               | admin | Creates a product.                                                             |

REST errors are returned as `{ "error": { "message", "code" } }` with a matching HTTP status.

## License

MIT License

Copyright (c) 2022 Ilhan Ozkan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
