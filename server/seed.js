require('dotenv').config();
const { Client } = require('pg');
const { createTables, createUser, createProduct, createFavorite } = require('./db');

const seed = async () => {
    const client = new Client({
        user: process.env.PGUSER,
        host: process.env.PGHOST,
        database: process.env.PGDATABASE,
        password: process.env.PGPASSWORD,
        port: process.env.PGPORT,
    });

    try {
        await client.connect();
        await createTables(client);
        console.log('Tables created!');
        console.log('Seeding the database...');

        const [moe, ethyl, lucy, larry] = await Promise.all([
            createUser('moe', 'stooge'),
            createUser('ethyl', 'mertz'),
            createUser('lucy', 'ricardo'),
            createUser('larry', 'fine')
        ]);
        console.log('Users created:', moe, ethyl, lucy, larry);

        const [radio, tv, phone, laptop] = await Promise.all([
            createProduct('radio'),
            createProduct('tv'),
            createProduct('phone'),
            createProduct('laptop')
        ]);
        console.log('Products created:', radio, tv, phone, laptop);

        const [fav1, fav2, fav3, fav4] = await Promise.all([
            createFavorite(moe.id, radio.id),
            createFavorite(ethyl.id, tv.id),
            createFavorite(lucy.id, phone.id),
            createFavorite(larry.id, laptop.id)
        ]);
        console.log('Favorites created:', fav1, fav2, fav3, fav4);
    } catch (error) {
        console.error('Error seeding the database:', error);
    } finally {
        await client.end();
        console.log('Database connection closed.');
    }
};

seed();