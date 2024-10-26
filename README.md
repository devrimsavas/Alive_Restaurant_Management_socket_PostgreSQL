# Alive Restaurant Management System with Socket

- quick start
  `npm install` for each folder

`cd gateway`

`npm start`

`http://localhost:8000/ `

## Instructions

### Restaurant Management Gateway

This application demonstrates the implementation of a gateway and microservices architecture for a restaurant management system. The system is divided into three parts:

1. **Customer Service**: Allows customers to place food orders.
2. **Employee Service**: Enables employees to view and mark customer orders as served.
3. **Management Service**: Provides restaurant statistics, such as the total number of orders, active orders, and the two most popular dishes.

The gateway manages these services, accessible through the following routes:

- **Gateway Base**: `http://localhost:8000`
- **Customer Service**: `http://localhost:8000/customer`
- **Employee Service**: `http://localhost:8000/employee`
- **Management Service**: `http://localhost:8000/management`

Each service runs on its own port and is managed through the gateway.

## Installation

1. **Install Dependencies**:  
   In each service folder, install the necessary dependencies. Navigate to each folder (`customer`, `employee`, `management`, and `gateway`) and run:

   ```bash
   npm install
   ```

2. **Environment Variables**:  
   Due to Azure limitations, I had to migrate the database from Azure to local and make some adjustments.

   - **Environment Variables for Local MSSQL Database**:

     ```bash
     ADMIN_USERNAME="sa"
     ADMIN_PASSWORD=<your_password>
     DATABASE_NAME=<your_database>
     HOST="localhost"
     DIALECT="mssql"
     PORT=8000
     ```

   - **Environment Variables for Local PostgreSQL**:  
     In this case, I used Google Cloud PostgreSQL:

     ```bash
     ADMIN_USERNAME=<admin_username>
     ADMIN_PASSWORD=<admin_password>
     DATABASE_NAME="postgres"
     HOST="<local or IP of Google Cloud, e.g., 34.xxx.xxx.xxx>"
     DIALECT="postgres"
     PORT=8000
     ```

   Ensure to enable local database settings before using it.

   Additionally, I adjusted the connection module (`index.js` inside the models folder) as shown below:

## Database Connection Configurations

### SQL Express Configuration (`index.js` for MSSQL):

```javascript
const Sequelize = require("sequelize");
const fs = require("fs");
const path = require("path");
const basename = path.basename(__filename);
require("dotenv").config();
const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.ADMIN_USERNAME,
  process.env.ADMIN_PASSWORD,
  {
    host: process.env.HOST,
    dialect: process.env.DIALECT,
    port: 1433,
    dialectOptions: {
      encrypt: false,
    },
  }
);
const db = {};
db.sequelize = sequelize;
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize);
    db[model.name] = model;
  });
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});
module.exports = db;
```

### PostgreSQL Configuration (`index.js` for PostgreSQL):

```javascript
const Sequelize = require("sequelize");
const fs = require("fs");
const path = require("path");
const basename = path.basename(__filename);
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.ADMIN_USERNAME,
  process.env.ADMIN_PASSWORD,
  {
    host: process.env.HOST,
    dialect: process.env.DIALECT,
    port: 5432,
    logging: console.log,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
);

const db = {};
db.sequelize = sequelize;
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
```

### Environment Variables for Azure:

Each folder contains a `.env.sample` file. For security reasons, the actual `.env` file is not provided. Copy the `.env.sample` file to `.env` in each folder and configure it according to your setup. Each service must have its own port number defined in the `.env` file.

Example:

```bash
ADMIN_USERNAME=<azure-admin-username>
ADMIN_PASSWORD=<azure-admin-password>
DATABASE_NAME=<databasename>
HOST="<databaseservername>.database.windows.net"
DIALECT="mssql"
PORT=8001
```

3. **Required Packages**:  
   The application uses Node.js along with the following key packages:

   - `express`
   - `msnodesqlv8`
   - `mssql`
   - `sequelize`

   The app is designed to use Microsoft Azure SQL (MSSQL), but it can also run with MySQL if you modify the `sequelize` dialect in the models.

4. **CSS Styling**:  
   The project uses Bootstrap for styling via the Bootstrap CDN. Note that in future updates, the frontend might be migrated to **Vite/React**, and **Tailwind CSS** could replace Bootstrap.

## Running the App

### 1. **Manual Start**:

In each service folder (`customer`, `employee`, `management`), start the service using:

```bash
npm start
```

After starting all the services, go to the **gateway** folder and run:

```bash
npm start
```

The gateway will now manage the services via `localhost:8000`.

### 2. **Concurrent Start (Recommended)**:

To simplify starting all services at once, the gateway is configured with **concurrently**. In the **gateway** folder, run:

```bash
npm start
```

This will start the gateway and all services simultaneously. Check the console output if you encounter any issues.

## Additional Features

- **Main Gateway Interface**: A user-friendly interface for navigating between customer, employee, and management services.
- **Bootstrap Modal Form for Orders**: Improved user experience for placing orders using a Bootstrap modal.

## Table Creation (MSSQL)

To create the `Orders` table manually:

```sql
CREATE TABLE Orders (
  OrderId INT IDENTITY(1,1) PRIMARY KEY,
  FirstName VARCHAR(255),
  LastName VARCHAR(255),
  DishName VARCHAR(255),
  Active BIT
);
```

## WebSocket Implementation (Socket.IO)

### 1. **Install Socket.IO**

- For the gateway folder:

  ```bash
  npm install socket.io
  ```

- For the microservices:

  ```bash
  npm install socket.io-client
  ```

### 2. **Server-Side Implementation (Customer Service)**

In `app.js`:

```javascript
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("newOrder", (order) => {
    console.log("New order received", order);
  });
});

module.exports = { app, server };
```

### 3. **Client-Side (Customer Route)**

In `routes/customer.js`:

```javascript
const socket = require("socket.io-client")("http://localhost:8000");

router.post("/", async function (req, res, next) {
  const { FirstName, LastName, DishName } = req.body;

  try {
    const newOrder = await orderService.create({
      FirstName,
      LastName,
      DishName,
    });
    socket.emit("newOrder", newOrder);
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).send("Failed to create order");
  }
});
```

## Using PostgreSQL (Google Cloud)

1. **Install the PostgreSQL client**:

   ```bash
   npm install pg pg-hstore
   ```

2. **Update `.env` file**:

   ```bash
   ADMIN_USERNAME="your_postgresql_username"
   ADMIN_PASSWORD="your_postgresql_password"
   DATABASE_NAME="your_database_name"
   HOST="/cloudsql/restaurantdatabase-438519:us-central1:restaurantdatabase"
   DIALECT="postgres"
   PORT=5432
   ```

## Further Ideas

- **Frontend Update**: Migrate the frontend to use **Vite/React** for better performance and modern development capabilities.
- **Tailwind CSS Integration**: Replace Bootstrap with **Tailwind CSS** to provide a more flexible and modern styling approach.
- **Enhanced Real-Time Features**: Expand the use of WebSocket for live updates on kitchen orders and table availability.
- **Analytics Dashboard**: Add a dashboard for management to view detailed analytics such as revenue, customer patterns, and order efficiency.
