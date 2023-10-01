-- CREATE DATABASE TECHFAB_ERP;
USE TECHFAB_ERP;
CREATE TABLE CustomersStatus (
  id INT NOT NULL IDENTITY(1, 1) PRIMARY KEY,
  status VARCHAR(32) NOT NULL
);
INSERT INTO CustomersStatus (status)
VALUES ('active'),
  ('archived');
CREATE TABLE Customers (
  id INT NOT NULL IDENTITY(1, 1) PRIMARY KEY,
  name VARCHAR(32) NOT NULL,
  email VARCHAR(32) NOT NULL,
  phone VARCHAR(16) NOT NULL,
  status_id INT NOT NULL FOREIGN KEY REFERENCES CustomersStatus(id)
);
CREATE TABLE EmployeesStatus (
  id INT NOT NULL IDENTITY(1, 1) PRIMARY KEY,
  status VARCHAR(32) NOT NULL
);
INSERT INTO EmployeesStatus (status)
VALUES ('active'),
  ('suspended'),
  ('terminated'),
  ('retired');
CREATE TABLE Employees (
  id INT NOT NULL IDENTITY(1, 1) PRIMARY KEY,
  name VARCHAR(32) NOT NULL,
  email VARCHAR(32) NOT NULL,
  phone VARCHAR(16) NOT NULL,
  position VARCHAR(32) NOT NULL,
  status_id INT NOT NULL FOREIGN KEY REFERENCES EmployeesStatus(id)
);
CREATE TABLE InventoryStatus (
  id INT NOT NULL IDENTITY(1, 1) PRIMARY KEY,
  status VARCHAR(32) NOT NULL
);
INSERT INTO InventoryStatus (status)
VALUES ('available'),
  ('out of stock'),
  ('discontinued');
CREATE TABLE Inventory (
  id INT NOT NULL IDENTITY(1, 1) PRIMARY KEY,
  name VARCHAR(32) NOT NULL,
  category VARCHAR(32) NOT NULL,
  quantity INT NOT NULL,
  price FLOAT NOT NULL,
  status_id INT NOT NULL FOREIGN KEY REFERENCES InventoryStatus(id)
);
CREATE TABLE OrdersStatus (
  id INT NOT NULL IDENTITY(1, 1) PRIMARY KEY,
  status VARCHAR(32) NOT NULL
);
INSERT INTO OrdersStatus (status)
VALUES ('cancelled'),
  ('pending'),
  ('processing'),
  ('shipped'),
  ('delivered');
CREATE TABLE Orders (
  id INT NOT NULL IDENTITY(1, 1) PRIMARY KEY,
  customer_id INT NOT NULL FOREIGN KEY REFERENCES Customers(id),
  total_price FLOAT NOT NULL,
  status_id INT NOT NULL FOREIGN KEY REFERENCES OrdersStatus(id)
);
CREATE TABLE OrderProducts (
  id INT NOT NULL IDENTITY(1, 1) PRIMARY KEY,
  order_id INT NOT NULL FOREIGN KEY REFERENCES Orders(id),
  product_id INT NOT NULL FOREIGN KEY REFERENCES Inventory(id),
  quantity INT NOT NULL
);
CREATE TABLE ProductionStatus (
  id INT NOT NULL IDENTITY(1, 1) PRIMARY KEY,
  status VARCHAR(32) NOT NULL
);
INSERT INTO ProductionStatus (status)
VALUES ('cancelled'),
  ('pending'),
  ('in progress'),
  ('completed');
CREATE TABLE Production (
  id INT NOT NULL IDENTITY(1, 1) PRIMARY KEY,
  product_id INT NOT NULL FOREIGN KEY REFERENCES Inventory(id),
  quantity INT NOT NULL,
  status_id INT NOT NULL FOREIGN KEY REFERENCES ProductionStatus(id)
)