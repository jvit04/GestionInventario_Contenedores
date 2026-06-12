CREATE TABLE IF NOT EXISTS productos (
                                         id SERIAL PRIMARY KEY,
                                         nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    cantidad INT NOT NULL DEFAULT 0,
    precio DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

INSERT INTO productos (nombre, descripcion, cantidad, precio) VALUES
                                                                  ('Laptop ASUS', '8GB RAM, 512GB SSD', 3, 750.00),
                                                                  ('Teclado Mecánico', 'RGB Switch Azul', 15, 45.00),
                                                                  ('Monitor Gamer 24"', '144Hz Full HD', 2, 180.00),
                                                                  ('Mouse Óptico', 'Inalámbrico', 20, 15.00);