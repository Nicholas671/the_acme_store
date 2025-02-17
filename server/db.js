const pg = require('pg');
require('dotenv').config();

const client = new pg.Client(process.env.DATABASE_URL);

const createTables = async () => {
    try {
        const SQL = `
            DROP TABLE IF EXISTS products;
            DROP TABLE IF EXISTS users;
            CREATE TABLE users (
                id UUID PRIMARY KEY,
                username VARCHAR(64) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL
            );
            CREATE TABLE products (
                id UUID PRIMARY KEY,
                name VARCHAR(64) UNIQUE NOT NULL,
                price DECIMAL NOT NULL
            );
       CREATE TABLE favorites ( 
              id UUID PRIMARY KEY,
              user_id UUID REFERENCES users(id) NOT NULL,
              product_id UUID REFERENCES products(id) NOT NULL
              CONSTRAINT unique_favorites UNIQUE(user_id, product_id)   
        `;
        await client.query(SQL);
    } catch (error) {
        console.error('Error creating tables: ', error);
    }
}

const createUsers = async (username, password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 5);
        const SQL = `INSERT INTO users(id, username, password) VALUES($1, $2, $3) RETURNING *;`;
        const { rows } = await client.query(SQL, [uuid(), username, hashedPassword]);
        return rows[0];
    } catch (error) {
        console.error('Error creating users: ', error);
    }
};

const createProducts = async (productName, price) => {
    try {
        const SQL = `INSERT INTO products(id, name, price) VALUES($1, $2, $3) RETURNING *;`;
        const { rows } = await client.query(SQL, [uuid(), productName, price]);
        return rows[0];
    } catch (error) {
        console.error('Error creating products: ', error);
    }
}

const createFavorites = async (userId, productId) => {
    try {
        const SQL = `INSERT INTO favorites(id, user_id, product_id) VALUES($1, $2, $3) RETURNING *;`;
        const { rows } = await client.query(SQL, [uuid(), userId, productId]);
        return rows[0];
    } catch (error) {
        console.error('Error creating favorites: ', error);
    }
}


module.exports = {
    client,
    createTables,
    createUsers,
    createProducts,
    createFavorites
};