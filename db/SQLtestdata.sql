USE TECHFAB_ERP;

-- Insert data into Customers
INSERT INTO Customers (name, email, phone, status_id)
VALUES ('John Doe', 'john.doe@example.com', '123456789', 1),
       ('Alice Smith', 'alice.smith@example.com', '987654321', 2);

-- Insert data into Employees
INSERT INTO Employees (name, email, phone, position, status_id)
VALUES ('Michael Johnson', 'michael.j@example.com', '333333333', 'Manager', 1),
       ('Anna Smith', 'anna.smith@example.com', '444444444', 'Developer', 2);

-- Insert data into Inventory
INSERT INTO Inventory (name, category, quantity, price, status_id)
VALUES ('Product A', 'Electronics', 100, 50.0, 1),
       ('Product B', 'Clothing', 200, 20.0, 2),
       ('Product C', 'Parts', 100, 10.99, 1);


-- Insert data into Orders
INSERT INTO Orders (customer_id, total_price, status_id)
VALUES (1, 300.0, 2),
       (2, 150.0, 1);

-- Insert data into OrderProducts
INSERT INTO OrderProducts (order_id, product_id, quantity)
VALUES (1, 1, 2),
       (1, 2, 1),
       (2, 1, 3),
       (2, 2, 2);

-- Insert data into Production
INSERT INTO Production (product_id, quantity, status_id)
VALUES (1, 100, 3),
       (2, 50, 2);