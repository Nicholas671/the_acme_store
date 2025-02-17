const pg = require('pg');
const client = new pg.Client();
const uuid = require('uuid');
const bcrypt = require('bcrypt');

const createTables = async () => {
    try {

        const SQL = `
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS products;
    DROP TABLE IF EXISTS favorites;

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
        user_id UUID REFERENCES users NOT NULL,
        product_id UUID REFERENCES products NOT NULL,
        CONSTRAINT unique_user_product UNIQUE(user_id, product_id)  
    );
    `;
        await client.query(SQL);
    }
    catch (error) {
        console.error(error);
        throw error;
    }
};

const createUser = async ({ username, password }) => {
    try {
        const SALT_COUNT = 10;
        const hashedPassword = await bcrypt.hash(password, SALT_COUNT);
        const SQL = `
        INSERT INTO users (username, password) values ($1, $2)
        RETURNING *;
        `;
        return (await client.query(SQL, [username, hashedPassword])).rows[0];
    }
    catch (error) {
        console.error(error);
        throw error;
    }
};

const createProduct = async ({ name }) => {
    try {
        const SQL = `
        INSERT INTO products (id, name) VALUES ($1, $2)
        RETURNING *;
        `;
        return (await client.query(SQL, [name])).rows[0];
    }
    catch (error) {
        console.error(error);
        throw error;
    }
};

const createFavorite = async ({ user_id, product_id }) => {
    try {
        const SQL = `
        INSERT INTO favorites (id, user_id, product_id) values ($1, $2)
        RETURNING *;
        `;
        return (await client.query(SQL, [user_id, product_id])).rows[0];
    }
    catch (error) {
        console.error(error);
        throw error;
    }
};

const getUsers = async () => {
    try {
        const SQL = ` SELECT * FROM users;`;
        const { rows } = await client.query(SQL);
        return rows;
    }
    catch (error) {
        console.error(error);
        throw error;
    }
};

const getProducts = async () => {
    try {
        const SQL = ` SELECT * FROM products;`;
        const { rows } = await client.query(SQL);
        return rows;
    }
    catch (error) {
        console.error(error);
        throw error;
    }
};

const getFavorites = async (id) => {
    try {
        const SQL = `SELECT favorites.id, products.name AS product_name, users.name AS user_name
      FROM favorites
      JOIN users ON favorites.user_id = users.id
      JOIN products ON favorites.product_id = products.id
      WHERE favorites.user_id = $1;`;
        const { rows } = await client.query(SQL);
        return rows;
    }
    catch (error) {
        console.error(error);
        throw error;
    }
};

const getAllFavorites = async () => {
    try {
        const SQL = `
      SELECT favorites.id, users.username, users.id AS user_id, products.name AS product_name, products.id AS product_id
      FROM favorites
      JOIN users ON favorites.user_id = users.id
      JOIN products ON favorites.product_id = products.id;
    `;
        const { rows } = await client.query(SQL, [id]);
        return rows;
    }
    catch (error) {
        console.error(error);
        throw error;
    }
};

const deleteFavorite = async (id) => {
    try {
        const SQL = `DELETE FROM favorites WHERE user_id = $1 AND product_id = $2;`;
        await client.query(SQL, [userId, productId]);
        return true;
    } catch (err) {
        console.log(err);
    }
};

module.exports = {
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