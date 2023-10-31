USE master;

DROP DATABASE IF EXISTS TECHFAB_ERP;
CREATE DATABASE TECHFAB_ERP;
GO

IF EXISTS (SELECT name FROM master.sys.server_principals WHERE name = 'TECHFAB')
DROP LOGIN TECHFAB;
CREATE LOGIN TECHFAB WITH PASSWORD = 'techfab';

USE TECHFAB_ERP;

IF EXISTS (SELECT name FROM TECHFAB_ERP.sys.database_principals WHERE name = 'TECHFAB_APP')
DROP USER TECHFAB_APP;
CREATE USER TECHFAB_APP FOR LOGIN TECHFAB;
GRANT EXECUTE TO TECHFAB_APP;

CREATE TABLE Customers (
    customer_id INT PRIMARY KEY IDENTITY(1,1),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    company_name VARCHAR(100),
    tax_id VARCHAR(20),
    preferred_payment_method VARCHAR(50) CHECK (preferred_payment_method IN ('cash', 'credit card', 'debit card', 'check')),
    credit_limit DECIMAL(10, 2),
    sales_representative_id INT,
    notes TEXT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
	status VARCHAR(10) NOT NULL CHECK (status IN ('active', 'archived'))
);

CREATE TABLE Products (
    product_id INT PRIMARY KEY IDENTITY(1,1),
    product_name VARCHAR(100) NOT NULL,
    description TEXT,
    unit_price DECIMAL(10, 2) NOT NULL,
    manufacturer VARCHAR(100),
    category VARCHAR(50),
    in_stock BIT NOT NULL
);

CREATE TABLE Inventory (
    inventory_item_id INT PRIMARY KEY IDENTITY(1,1),
    product_id INT NOT NULL,
    quantity_on_hand INT NOT NULL,
    quantity_on_order INT NOT NULL,
    location VARCHAR(50),
    last_inventory_date DATE NOT NULL,
    FOREIGN KEY (product_id) REFERENCES Products(product_id)
);

CREATE TABLE Orders (
    order_id INT PRIMARY KEY IDENTITY(1,1),
    customer_id INT NOT NULL,
    order_date DATE,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('cancelled', 'pending', 'processing', 'shipped', 'delivered')),
    payment_method VARCHAR(50) NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_date DATE,
    FOREIGN KEY (customer_id) REFERENCES Customers(customer_id)
);

CREATE TABLE OrderItems (
    order_item_id INT PRIMARY KEY IDENTITY(1,1),
    order_id INT NOT NULL,
    inventory_item_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(5, 2) NOT NULL CHECK (discount >= 0 AND discount <= 1),
    FOREIGN KEY (order_id) REFERENCES Orders(order_id),
    FOREIGN KEY (inventory_item_id) REFERENCES Inventory(inventory_item_id)
);

CREATE TABLE Production (
    production_order_id INT PRIMARY KEY IDENTITY(1,1),
    inventory_item_id INT NOT NULL,
    quantity_to_produce INT NOT NULL,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) NOT NULL CHECK (status IN ('in progress', 'completed')),
    FOREIGN KEY (inventory_item_id) REFERENCES Inventory(inventory_item_id),
);

CREATE TABLE Employees (
    employee_id INT PRIMARY KEY IDENTITY(1,1),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    hire_date DATE,
    department VARCHAR(50),
    manager_id INT,
    FOREIGN KEY (manager_id) REFERENCES Employees(employee_id)
);

CREATE TABLE EmployeeRoles (
    role_id INT PRIMARY KEY IDENTITY(1,1),
    role_name VARCHAR(50) NOT NULL,
    description TEXT
);

CREATE TABLE EmployeeAssignments (
    assignment_id INT PRIMARY KEY IDENTITY(1,1),
    employee_id INT,
    role_id INT,
    start_date DATE,
    end_date DATE,
    location VARCHAR(50),
    FOREIGN KEY (employee_id) REFERENCES Employees(employee_id),
    FOREIGN KEY (role_id) REFERENCES EmployeeRoles(role_id)
);
GO

-- Customers Procedures
CREATE PROCEDURE ReadCustomers
AS
BEGIN
	SELECT * FROM Customers;
END;
GO

CREATE PROCEDURE ReadCustomer
	@customer_id INT
AS
BEGIN
	SELECT * FROM Customers WHERE customer_id = @customer_id;
END;
GO	

CREATE PROCEDURE CreateCustomer
    @name VARCHAR(100),
    @email VARCHAR(50),
    @phone VARCHAR(20),
    @company_name VARCHAR(100),
    @tax_id VARCHAR(20),
    @preferred_payment_method VARCHAR(50),
    @credit_limit DECIMAL(10, 2),
    @sales_representative_id INT,
    @notes TEXT
AS
BEGIN
    INSERT INTO Customers (
        name, email, phone, company_name, tax_id, preferred_payment_method, 
		credit_limit, sales_representative_id, notes, created_at, updated_at, status
    )
    VALUES (
        @name, @email, @phone, @company_name, @tax_id, @preferred_payment_method, 
		@credit_limit, @sales_representative_id, @notes, GETDATE(), GETDATE(), 'active'
    );

    SELECT SCOPE_IDENTITY() AS customer_id;
END;
GO

CREATE PROCEDURE UpdateCustomer
    @customer_id INT,
    @name VARCHAR(100) = NULL,
    @email VARCHAR(50) = NULL,
    @phone VARCHAR(20) = NULL,
    @company_name VARCHAR(100) = NULL,
    @tax_id VARCHAR(20) = NULL,
    @preferred_payment_method VARCHAR(50) = NULL,
    @credit_limit DECIMAL(10, 2) = NULL,
    @sales_representative_id INT = NULL,
    @notes TEXT = NULL,
	@status VARCHAR(10) = NULL
AS
BEGIN
	BEGIN TRANSACTION;

	IF NOT EXISTS (SELECT 1 FROM Customers WHERE customer_id = @customer_id)
    BEGIN
        ROLLBACK;
        RAISERROR('Customer not found.', 16, 1);
        RETURN;
    END;

    UPDATE Customers
    SET
        name = ISNULL(@name, name),
        email = ISNULL(@email, email),
        phone = ISNULL(@phone, phone),
        company_name = ISNULL(@company_name, company_name),
        tax_id = ISNULL(@tax_id, tax_id),
        preferred_payment_method = ISNULL(@preferred_payment_method, preferred_payment_method),
        credit_limit = ISNULL(@credit_limit, credit_limit),
        sales_representative_id = ISNULL(@sales_representative_id, sales_representative_id),
        notes = ISNULL(@notes, notes),
        updated_at = GETDATE(),
		status = ISNULL(@status, status)
    WHERE customer_id = @customer_id;

	COMMIT;
END;
GO

CREATE PROCEDURE DeleteCustomer 
	@customer_id INT
AS
BEGIN
	BEGIN TRANSACTION;

	IF NOT EXISTS (SELECT 1 FROM Customers WHERE customer_id = @customer_id)
    BEGIN
        ROLLBACK;
        RAISERROR('Customer not found.', 16, 1);
        RETURN;
    END;

	DELETE FROM Customers WHERE customer_id = @customer_id;

	COMMIT;
END;
GO

-- Orders Procedures
CREATE PROCEDURE CreateOrder
	@customer_id INT,
	@order_date DATE,
	@payment_method VARCHAR(20),
	@shipping_address TEXT,
	@shipping_date DATE
AS
BEGIN
	BEGIN TRANSACTION;

	INSERT INTO Orders (customer_id, order_date, total_amount, status, payment_method, shipping_address, shipping_date)
	VALUES (@customer_id, @order_date, 0.0, 'pending', @payment_method, @shipping_address, @shipping_date);

	SELECT SCOPE_IDENTITY() AS order_id; 

	COMMIT;
END;
GO

CREATE PROCEDURE UpdateOrder
	@order_id INT,
	@order_date DATE,
	@status VARCHAR(50),
	@payment_method VARCHAR(50),
	@shipping_address TEXT,
	@shipping_date DATE
AS
BEGIN
	BEGIN TRANSACTION;

	IF NOT EXISTS (SELECT 1 FROM Orders WHERE order_id = @order_id)
    BEGIN
        ROLLBACK;
        RAISERROR('Order not found.', 16, 1);
        RETURN;
    END;

	UPDATE Orders
	SET
		order_date = ISNULL(@order_date, order_date),
		status = ISNULL(@status, status),
		payment_method = ISNULL(@payment_method, payment_method),
		shipping_address = ISNULL(@shipping_address, shipping_address),
		shipping_date = ISNULL(@shipping_date, shipping_date)
	WHERE order_id = @order_id

	COMMIT;
END;
GO

CREATE PROCEDURE DeleteOrder
	@order_id INT
AS
BEGIN
	BEGIN TRANSACTION;

	IF NOT EXISTS (SELECT 1 FROM Orders WHERE order_id = @order_id)
	BEGIN
        ROLLBACK;
        RAISERROR('Order not found.', 16, 1);
        RETURN;
    END;

	DELETE Orders WHERE order_id = @order_id;

	COMMIT;
END;
GO

CREATE TRIGGER tr_UpdateTotalAmount 
ON OrderItems
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    UPDATE o
    SET total_amount = (SELECT SUM(unit_price * (1 - discount) * quantity) FROM OrderItems oi WHERE oi.order_id = o.order_id)
    FROM Orders o
    JOIN (
        SELECT DISTINCT order_id
        FROM inserted
        UNION ALL
        SELECT DISTINCT order_id
        FROM deleted
    ) AS changes ON o.order_id = changes.order_id;
END;
GO

-- OrderItems Procedures
CREATE PROCEDURE CreateOrderItem
	@order_id INT,
	@inventory_item_id INT,
	@quantity INT,
	@unit_price DECIMAL(10,2),
	@discount DECIMAL(2,2)
AS
BEGIN
	BEGIN TRANSACTION;

	IF NOT EXISTS (SELECT 1 FROM Inventory WHERE inventory_item_id = @inventory_item_id)
    BEGIN
        ROLLBACK;
        RAISERROR('Inventory item not found.', 16, 1);
        RETURN;
    END;

	INSERT INTO OrderItems (order_id, inventory_item_id, quantity, unit_price, discount)
	VALUES(@order_id, @inventory_item_id, @quantity, @unit_price, @discount);

	SELECT SCOPE_IDENTITY() AS order_item_id;
	COMMIT;
END;
GO

CREATE PROCEDURE UpdateOrderItem
	@order_item_id INT,
	@inventory_item_id INT,
	@quantity INT,
	@unit_price DECIMAL(10,2),
	@discount DECIMAL(2,2)
AS
BEGIN
	BEGIN TRANSACTION;

	IF NOT EXISTS (SELECT 1 FROM OrderItems WHERE order_item_id = @order_item_id)
	BEGIN
        ROLLBACK;
        RAISERROR('Order item not found.', 16, 1);
        RETURN;
    END;

	IF @inventory_item_id != NULL AND NOT EXISTS (SELECT 1 FROM Inventory WHERE inventory_item_id = @inventory_item_id)
    BEGIN
        ROLLBACK;
        RAISERROR('Inventory item not found.', 16, 1);
        RETURN;
    END;

	UPDATE OrderItems
	SET
		inventory_item_id = ISNULL(@inventory_item_id, inventory_item_id),
		quantity = ISNULL(@quantity, quantity),
		unit_price = ISNULL(@unit_price, unit_price),
		discount = ISNULL(@discount, discount)
	WHERE order_item_id = @order_item_id;

	COMMIT;
END;
GO

CREATE PROCEDURE DeleteOrderItem
	@order_item_id INT
AS
BEGIN
	BEGIN TRANSACTION;

	IF NOT EXISTS (SELECT 1 FROM OrderItems WHERE order_item_id = @order_item_id)
	BEGIN
        ROLLBACK;
        RAISERROR('Order item not found.', 16, 1);
        RETURN;
    END;

	DELETE OrderItems WHERE order_item_id = @order_item_id;

	COMMIT;
END;
GO

-- Product Procedures
CREATE PROCEDURE CreateProduct
	@product_name VARCHAR(100),
	@description TEXT,
	@unit_price DECIMAL(10,2),
	@manufacturer VARCHAR(100),
	@category VARCHAR(50)
AS
BEGIN
	BEGIN TRANSACTION;

	INSERT INTO Products (product_name, description, unit_price, manufacturer, category, in_stock)
	VALUES (@product_name, @description,@unit_price, @manufacturer, @category, 0);

	SELECT SCOPE_IDENTITY() AS product_id;
	COMMIT;
END;
GO

CREATE PROCEDURE UpdateProduct
	@product_id INT,
	@product_name VARCHAR(100),
	@description TEXT,
	@unit_price DECIMAL(10,2),
	@manufacturer VARCHAR(100),
	@category VARCHAR(50)
AS
BEGIN
	BEGIN TRANSACTION;

	IF NOT EXISTS (SELECT 1 FROM Products WHERE product_id = @product_id)
	BEGIN
        ROLLBACK;
        RAISERROR('Product not found.', 16, 1);
        RETURN;
    END;

	UPDATE Products
	SET
		product_name = ISNULL(@product_name, product_name),
		description = ISNULL(@description, description),
		unit_price = ISNULL(@unit_price, unit_price),
		manufacturer = ISNULL(@manufacturer, manufacturer),
		category = ISNULL(@category, category)
	WHERE product_id = @product_id

	COMMIT;
END;
GO

CREATE PROCEDURE DeleteProduct
	@product_id INT
AS
BEGIN
	BEGIN TRANSACTION;

	IF NOT EXISTS (SELECT 1 FROM Products WHERE product_id = @product_id)
	BEGIN
        ROLLBACK;
        RAISERROR('Product not found.', 16, 1);
        RETURN;
    END;

	DELETE Products WHERE product_id = @product_id;

	COMMIT;
END;
GO

CREATE TRIGGER tr_ProductOnStock 
ON Inventory
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
	BEGIN TRANSACTION;

IF EXISTS (SELECT * FROM inserted)
	BEGIN
		DECLARE product_ids_cursor CURSOR FOR SELECT product_id FROM inserted;
	END
	ELSE
	BEGIN
		DECLARE product_ids_cursor CURSOR FOR SELECT product_id FROM deleted;
	END
	
	DECLARE @product_id INT;

	OPEN product_ids_cursor;

	FETCH NEXT FROM product_ids_cursor INTO @product_id;

	WHILE @@FETCH_STATUS = 0
	BEGIN
		DECLARE @total INT;
		SET @total = (SELECT SUM(quantity_on_hand) FROM Inventory WHERE product_id = @product_id);

		UPDATE Products
		SET
			in_stock = @total
		WHERE product_id = @product_id;

		FETCH NEXT FROM product_ids_cursor INTO @product_id;
	END;
	CLOSE product_ids_cursor;
	DEALLOCATE product_ids_cursor;

	COMMIT;
END;
GO

-- Inventory Procedures
CREATE PROCEDURE CreateInventory
	@product_id INT,
	@quantity_on_hand INT,
	@location VARCHAR(50)
AS
BEGIN
	BEGIN TRANSACTION;
	
	INSERT INTO Inventory (product_id, quantity_on_hand, quantity_on_order, location, last_inventory_date)
	VALUES (@product_id, @quantity_on_hand, 0, @location, GETDATE());

	SELECT SCOPE_IDENTITY() AS inventory_item_id;
	COMMIT;
END;
GO

CREATE PROCEDURE UpdateInventory
	@inventory_item_id INT,
	@product_id INT,
	@quantity_on_hand INT,
	@location VARCHAR(50)
AS
BEGIN
	BEGIN TRANSACTION;

	IF NOT EXISTS (SELECT 1 FROM Inventory WHERE inventory_item_id = @inventory_item_id)
	BEGIN
        ROLLBACK;
        RAISERROR('Inventory item not found.', 16, 1);
        RETURN;
    END;

	UPDATE Inventory
	SET
		product_id = ISNULL(@product_id, product_id),
		quantity_on_hand = ISNULL(@quantity_on_hand, quantity_on_hand),
		location = ISNULL(@location, location)
	WHERE inventory_item_id = @inventory_item_id;

	COMMIT;
END;
GO

CREATE PROCEDURE DeleteInventory
	@inventory_item_id INT
AS
BEGIN
	BEGIN TRANSACTION;

	IF NOT EXISTS (SELECT 1 FROM Inventory WHERE inventory_item_id = @inventory_item_id)
	BEGIN
        ROLLBACK;
        RAISERROR('Inventory item not found.', 16, 1);
        RETURN;
    END;

	DELETE FROM Inventory WHERE inventory_item_id = @inventory_item_id

	COMMIT;
END;
GO

CREATE TRIGGER tr_QuantityOnOrder
ON OrderItems
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
	BEGIN TRANSACTION;

	IF EXISTS (SELECT * FROM inserted)
	BEGIN
		DECLARE inventory_item_ids_cursor CURSOR FOR SELECT inventory_item_id FROM inserted;
	END
	ELSE
	BEGIN
		DECLARE inventory_item_ids_cursor CURSOR FOR SELECT inventory_item_id FROM deleted;
	END

	DECLARE @inventory_item_id INT;

	OPEN inventory_item_ids_cursor;

	FETCH NEXT FROM inventory_item_ids_cursor INTO @inventory_item_id;

	WHILE @@FETCH_STATUS = 0
	BEGIN
		DECLARE @quantity_on_order INT;
		SET @quantity_on_order = (SELECT SUM(quantity) FROM OrderItems WHERE inventory_item_id = @inventory_item_id);

		UPDATE Inventory
		SET quantity_on_order = @quantity_on_order
		WHERE inventory_item_id = @inventory_item_id;

		FETCH NEXT FROM inventory_item_ids_cursor INTO  @inventory_item_id;
	END;

	COMMIT;
END;
GO	

-- Production Procedures
CREATE PROCEDURE CreateProduction
	@inventory_item_id INT,
	@quantity_to_produce INT
AS
BEGIN
	BEGIN TRANSACTION;

	IF NOT EXISTS (SELECT 1 FROM Inventory WHERE inventory_item_id = @inventory_item_id)
	BEGIN
        ROLLBACK;
        RAISERROR('Inventory item not found.', 16, 1);
        RETURN;
    END;

	INSERT INTO Production (inventory_item_id, quantity_to_produce, status)
	VALUES (@inventory_item_id, @quantity_to_produce, 'in progress');
	
	SELECT SCOPE_IDENTITY() AS product_id;
	COMMIT;
END;
GO

CREATE PROCEDURE UpdateProduction
	@production_order_id INT,
	@inventory_item_id INT,
	@quantity_to_produce INT,
	@status VARCHAR(50)
AS
BEGIN
	BEGIN TRANSACTION;

	IF NOT EXISTS (SELECT 1 FROM Production WHERE production_order_id = @production_order_id)
	BEGIN
        ROLLBACK;
        RAISERROR('Production order not found.', 16, 1);
        RETURN;
    END;

	IF @inventory_item_id != NULL AND NOT EXISTS (SELECT 1 FROM Inventory WHERE inventory_item_id = @inventory_item_id)
	BEGIN
        ROLLBACK;
        RAISERROR('Inventory item not found.', 16, 1);
        RETURN;
    END;

	UPDATE Production
	SET
		inventory_item_id = ISNULL(@inventory_item_id, inventory_item_id),
		quantity_to_produce = ISNULL(@quantity_to_produce, quantity_to_produce),
		status = ISNULL(@status, status)
	WHERE production_order_id = @production_order_id;

	COMMIT;
END;
GO

CREATE PROCEDURE DeleteProduction
	@production_order_id INT
AS
BEGIN
	BEGIN TRANSACTION;

	IF NOT EXISTS (SELECT 1 FROM Production WHERE production_order_id = @production_order_id)
	BEGIN
        ROLLBACK;
        RAISERROR('Production order not found.', 16, 1);
        RETURN;
    END;

	DELETE Production WHERE production_order_id = @production_order_id;

	COMMIT;
END;
GO

CREATE TRIGGER tr_ProductionStatus
ON Production
AFTER INSERT, UPDATE
AS
BEGIN
	BEGIN TRANSACTION;
	DECLARE @production_order_id INT;
	DECLARE @oldStatus VARCHAR(50);
	DECLARE @newStatus VARCHAR(50);

	IF NOT EXISTS (SELECT * FROM deleted)
	BEGIN
		DECLARE production_changes_cursor CURSOR FOR
		SELECT production_order_id, '', status FROM inserted;
	END;
	ELSE
	BEGIN
		DECLARE production_changes_cursor CURSOR FOR
		SELECT inserted.production_order_id, deleted.status, inserted.status
		FROM deleted INNER JOIN inserted ON deleted.production_order_id = inserted.production_order_id
	END;

	OPEN production_changes_cursor;

	FETCH NEXT FROM production_changes_cursor INTO @production_order_id, @oldStatus, @newStatus;

	WHILE @@FETCH_STATUS = 0
	BEGIN
		IF @oldStatus != @newStatus
		BEGIN
			IF @newStatus = 'in progress' AND @oldStatus != 'in progress'
			BEGIN
				UPDATE Production
				SET
					start_date = GETDATE()
				WHERE production_order_id = @production_order_id;
			END;
			ELSE IF @newStatus = 'completed' AND @oldStatus != 'completed'
			BEGIN
				UPDATE Production
				SET
					end_date = GETDATE()
				WHERE production_order_id = @production_order_id;

				DECLARE @inventory_item_id INT;
				DECLARE @quantity_to_produce INT;

				SELECT @inventory_item_id = inventory_item_id, @quantity_to_produce = quantity_to_produce 
				FROM Production WHERE production_order_id = @production_order_id;
			
				UPDATE Inventory
				SET 
					quantity_on_hand = quantity_on_hand + @quantity_to_produce
				WHERE inventory_item_id = @inventory_item_id;
			END;
		END;
		FETCH NEXT FROM production_changes_cursor INTO @production_order_id, @oldStatus, @newStatus;
	END;

	CLOSE production_changes_cursor;
	DEALLOCATE production_changes_cursor;

	COMMIT;
END;
GO

-- Employees Procedures
CREATE PROCEDURE CreateEmployee
	@first_name VARCHAR(50),
	@last_name VARCHAR(50),
	@email VARCHAR(100),
	@phone VARCHAR(20),
	@hire_date DATE,
	@department VARCHAR(50),
	@manager_id INT
AS
BEGIN
	BEGIN TRANSACTION;

	INSERT INTO Employees (first_name, last_name, email, phone, hire_date, department, manager_id)
	VALUES (@first_name, @last_name, @email, @phone, @hire_date, @department, @manager_id);

	COMMIT;
END;
GO

CREATE PROCEDURE UpdateEmployee
	@employee_id INT,
	@first_name VARCHAR(50),
	@last_name VARCHAR(50),
	@email VARCHAR(100),
	@phone VARCHAR(20),
	@hire_date DATE,
	@department VARCHAR(50),
	@manager_id INT
AS
BEGIN
	BEGIN TRANSACTION;

	IF NOT EXISTS (SELECT 1 FROM Employees WHERE employee_id = @employee_id)
	BEGIN
        ROLLBACK;
        RAISERROR('Employee not found.', 16, 1);
        RETURN;
    END;

	 UPDATE Employees
	 SET
		first_name = ISNULL(@first_name, first_name),
		last_name = ISNULL(@last_name, last_name),
		email = ISNULL(@email, email),
		phone = ISNULL(@phone, phone),
		hire_date = ISNULL(@hire_date, hire_date),
		department = ISNULL(@department, department),
		manager_id = ISNULL(@manager_id, manager_id)
	 WHERE employee_id = @employee_id;

	COMMIT;
END;
GO

CREATE PROCEDURE DeleteEmployee
	@employee_id INT
AS
BEGIN
	BEGIN TRANSACTION;

	IF NOT EXISTS (SELECT 1 FROM Employees WHERE employee_id = @employee_id)
	BEGIN
        ROLLBACK;
        RAISERROR('Employee not found.', 16, 1);
        RETURN;
    END;

	DELETE Employees
	WHERE employee_id = @employee_id;

	COMMIT;
END;
GO

-- Employee Roles Procedures
CREATE PROCEDURE CreateEmployeeRole
	@role_name VARCHAR(50),
	@description TEXT
AS
BEGIN
	BEGIN TRANSACTION;

	INSERT INTO EmployeeRoles (role_name, description)
	VALUES (@role_name, @description)

	COMMIT;
END;
GO

CREATE PROCEDURE UpdateEmployeeRole
	@role_id INT,
	@role_name VARCHAR(50),
	@description TEXT
AS
BEGIN
	BEGIN TRANSACTION;

	IF NOT EXISTS (SELECT 1 FROM EmployeeRoles WHERE role_id = @role_id)
	BEGIN
		ROLLBACK;
		RAISERROR('Employee role not found.', 16, 1);
		RETURN;
	END;

	UPDATE EmployeeRoles
	SET
		role_name = ISNULL(@role_name, role_name),
		description = ISNULL(@description, description)
	WHERE role_id = @role_id;

	COMMIT;
END;
GO

CREATE PROCEDURE DeleteEmployeeRole
	@role_id INT
AS
BEGIN
	BEGIN TRANSACTION;

	IF NOT EXISTS (SELECT 1 FROM EmployeeRoles WHERE role_id = @role_id)
	BEGIN
		ROLLBACK;
		RAISERROR('Employee role not found.', 16, 1);
		RETURN;
	END;

	DELETE EmployeeRoles
	WHERE role_id = @role_id;

	COMMIT;
END;
GO

-- Employee Assignaments Procedures
CREATE PROCEDURE CreateEmployeeAssignment
	@employee_id INT,
	@role_id INT,
	@start_date DATE,
	@end_date DATE,
	@location VARCHAR(50)
AS
BEGIN
	BEGIN TRANSACTION;

	IF NOT EXISTS (SELECT 1 FROM Employees WHERE employee_id = @employee_id)
	BEGIN
        ROLLBACK;
        RAISERROR('Employee not found.', 16, 1);
        RETURN;
    END;

	IF NOT EXISTS (SELECT 1 FROM EmployeeRoles WHERE role_id = @role_id)
	BEGIN
		ROLLBACK;
		RAISERROR('Employee role not found.', 16, 1);
		RETURN;
	END;

	INSERT INTO EmployeeAssignments (employee_id, role_id, start_date, end_date, location)
	VALUES (@employee_id, @role_id, @start_date, @end_date, @location);

	COMMIT;
END;
GO

CREATE PROCEDURE UpdateEmployeeAssignment
	@assignment_id INT,
	@employee_id INT,
	@role_id INT,
	@start_date DATE,
	@end_date DATE,
	@location VARCHAR(50)
AS
BEGIN
	BEGIN TRANSACTION;

	IF NOT EXISTS (SELECT 1 FROM EmployeeAssignments WHERE assignment_id = @assignment_id)
	BEGIN
        ROLLBACK;
        RAISERROR('Assignment not found.', 16, 1);
        RETURN;
    END;

	IF @employee_id != NULL AND NOT EXISTS (SELECT 1 FROM Employees WHERE employee_id = @employee_id)
	BEGIN
        ROLLBACK;
        RAISERROR('Employee not found.', 16, 1);
        RETURN;
    END;

	IF @role_id != NULL AND NOT EXISTS (SELECT 1 FROM EmployeeRoles WHERE role_id = @role_id)
	BEGIN
		ROLLBACK;
		RAISERROR('Employee role not found.', 16, 1);
		RETURN;
	END;

	UPDATE EmployeeAssignments
	SET
		employee_id = ISNULL(@employee_id, employee_id),
		role_id = ISNULL(@role_id, role_id),
		start_date = ISNULL(@start_date, start_date),
		end_date = ISNULL(@end_date, end_date),
		location = ISNULL(@location, location)
	WHERE assignment_id = @assignment_id;

	COMMIT;
END;
GO

CREATE PROCEDURE DeleteEmployeeAssignament
	@assignment_id INT
AS
BEGIN
	BEGIN TRANSACTION;

	IF NOT EXISTS (SELECT 1 FROM EmployeeAssignments WHERE assignment_id = @assignment_id)
	BEGIN
        ROLLBACK;
        RAISERROR('Assignment not found.', 16, 1);
        RETURN;
    END;

	DELETE EmployeeAssignments
	WHERE assignment_id = @assignment_id;

	COMMIT;
END;