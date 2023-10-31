USE TECHFAB_ERP;
-- Insert data into the Customers table
INSERT INTO Customers (name, email, phone, company_name, tax_id, preferred_payment_method, credit_limit, sales_representative_id, notes, created_at, updated_at, status)
VALUES
    ('John Doe', 'john@example.com', '123-456-7890', 'ABC Company', 'TAX123', 'credit card', 1000.00, 1, 'A loyal customer', '2023-01-15 09:00:00', '2023-01-15 09:00:00', 'active'),
    ('Jane Smith', 'jane@example.com', '987-654-3210', 'XYZ Corp', 'TAX456', 'check', 1500.00, 2, 'Preferred customer', '2023-02-20 10:30:00', '2023-02-20 10:30:00', 'active');

-- Insert data into the Products table
INSERT INTO Products (product_name, description, unit_price, manufacturer, category, in_stock)
VALUES
    ('Product A', 'Description of Product A', 100.00, 'Company X', 'Category 1', 1),
    ('Product B', 'Description of Product B', 50.00, 'Company Y', 'Category 2', 1),
    ('Product C', 'Description of Product C', 150.00, 'Company Z', 'Category 1', 1),
    ('Product D', 'Description of Product D', 80.00, 'Company X', 'Category 3', 1);

-- Insert data into the Inventory table
INSERT INTO Inventory (product_id, quantity_on_hand, quantity_on_order, location, last_inventory_date)
VALUES
    (1, 100, 20, 'Warehouse A', '2023-02-28'),
    (2, 75, 10, 'Warehouse B', '2023-02-28'),
    (3, 50, 5, 'Warehouse A', '2023-02-28'),
    (4, 60, 15, 'Warehouse B', '2023-02-28');

-- Insert data into the Orders table
INSERT INTO Orders (customer_id, order_date, total_amount, status, payment_method, shipping_address, shipping_date)
VALUES
    (1, '2023-03-01', 500.00, 'shipped', 'Credit Card', '123 Main St, Anytown, USA', '2023-03-02'),
    (2, '2023-03-05', 800.00, 'delivered', 'Check', '456 Elm St, Othertown, USA', '2023-03-06');

-- Insert data into the OrderItems table
INSERT INTO OrderItems (order_id, inventory_item_id, quantity, unit_price, discount)
VALUES
    (1, 1, 5, 100.00, 0.10),
    (1, 2, 3, 50.00, 0.05),
    (2, 3, 4, 150.00, 0.15),
    (2, 4, 2, 80.00, 0.05);

-- Insert data into the ProductionOrders table
INSERT INTO Production (inventory_item_id, quantity_to_produce, start_date, end_date, status)
VALUES
    (1, 20, '2023-03-05', '2023-03-10', 'in progress'),
    (2, 10, '2023-03-08', '2023-03-12', 'completed');

-- Insert data into the Employees table
INSERT INTO Employees (first_name, last_name, email, phone, hire_date, department, manager_id)
VALUES
    ('John', 'Smith', 'john@example.com', '123-456-7890', '2022-01-10', 'Sales', NULL),
    ('Jane', 'Doe', 'jane@example.com', '987-654-3210', '2022-02-15', 'Customer Support', 1);

-- Insert data into the EmployeeRoles table
INSERT INTO EmployeeRoles (role_name, description)
VALUES
    ('Sales Representative', 'Responsible for sales activities'),
    ('Customer Support Agent', 'Provides customer support services');

-- Insert data into the EmployeeAssignments table
INSERT INTO EmployeeAssignments (employee_id, role_id, start_date, end_date, location)
VALUES
    (1, 1, '2022-01-10', NULL, 'Office A'),
    (2, 2, '2022-02-15', NULL, 'Office B');