const { Client } = require('pg');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const client = new Client({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
});

const createTables = async (client) => {
    try {
        console.log('Creating tables...');
        const SQL = `
            DROP TABLE IF EXISTS favorites;
            DROP TABLE IF EXISTS products;
            DROP TABLE IF EXISTS users;

            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

            CREATE TABLE users (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                username VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(100) NOT NULL
            );

            CREATE TABLE products (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name VARCHAR(100) UNIQUE NOT NULL
            );

            CREATE TABLE favorites (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id) NOT NULL,
                product_id UUID REFERENCES products(id) NOT NULL,
                CONSTRAINT unique_user_product UNIQUE(user_id, product_id)
            );
        `;
        await client.query(SQL);
        console.log('Tables created successfully.');
    } catch (error) {
        console.error('Error creating tables:', error);
        throw error;
    }
};


const createUser = async (username, password) => {
    try {
        console.log(`Creating user: ${username}`);
        const SALT_COUNT = 10;
        const hashedPassword = await bcrypt.hash(password, SALT_COUNT);
        const SQL = `
            INSERT INTO users (id, username, password) VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const result = await client.query(SQL, [uuidv4(), username, hashedPassword]);
        console.log('User created:', result.rows[0]);
        return result.rows[0];
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};


const createProduct = async (name) => {
    try {
        console.log(`Creating product: ${name}`);
        const SQL = `
            INSERT INTO products (id, name) VALUES ($1, $2)
            RETURNING *;
        `;
        const result = await client.query(SQL, [uuidv4(), name]);
        console.log('Product created:', result.rows[0]);
        return result.rows[0];
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
};


const createFavorite = async (user_id, product_id) => {
    try {
        console.log(`Creating favorite for user ${user_id} and product ${product_id}`);
        const SQL = `
            INSERT INTO favorites (id, user_id, product_id) VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const result = await client.query(SQL, [uuidv4(), user_id, product_id]);
        console.log('Favorite created:', result.rows[0]);
        return result.rows[0];
    } catch (error) {
        console.error('Error creating favorite:', error);
        throw error;
    }
};


const getUsers = async () => {
    try {
        const SQL = `SELECT * FROM users;`;
        const { rows } = await client.query(SQL);
        return rows;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

const getProducts = async () => {
    try {
        const SQL = `SELECT * FROM products;`;
        const { rows } = await client.query(SQL);
        return rows;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

const getFavorites = async (id) => {
    try {
        const SQL = `
            SELECT favorites.id, products.name AS product_name, users.username AS user_name
            FROM favorites
            JOIN users ON favorites.user_id = users.id
            JOIN products ON favorites.product_id = products.id
            WHERE favorites.user_id = $1;
        `;
        const { rows } = await client.query(SQL, [id]);
        return rows;
    } catch (error) {
        console.error('Error fetching favorites:', error);
        throw error;
    }
};

const getAllFavorites = async (id) => {
    try {
        const SQL = `
            SELECT favorites.id, users.username, users.id AS user_id, products.name AS product_name, products.id AS product_id
            FROM favorites
            JOIN users ON favorites.user_id = users.id
            JOIN products ON favorites.product_id = products.id
            WHERE favorites.user_id = $1;
        `;
        const { rows } = await client.query(SQL, [id]);
        return rows;
    } catch (error) {
        console.error('Error fetching all favorites:', error);
        throw error;
    }
};

const deleteFavorite = async (userId, productId) => {
    try {
        const SQL = `DELETE FROM favorites WHERE user_id = $1 AND product_id = $2;`;
        await client.query(SQL, [userId, productId]);
        return true;
    } catch (error) {
        console.error('Error deleting favorite:', error);
        throw error;
    }
};

module.exports = {
    client,
    createTables,
    createUser,
    createProduct,
    createFavorite,
    getUsers,
    getProducts,
    getFavorites,
    getAllFavorites,
    deleteFavorite
};