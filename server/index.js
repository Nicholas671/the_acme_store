const express = require('express');
const app = express();
require('dotenv').config();

const {
    client,
    createTables,
    createUser,
    createProduct,
    createFavorite,
    getUsers,
    getProducts,
    getFavorites,
    getAllFavorites,
    deleteFavorite,
} = require('./db');

const PORT = process.env.PORT || 3000;
app.use(express.json());

app.get('/api/users', async (req, res) => {
    try {
        const users = await getUsers();
        res.send(users);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const products = await getProducts();
        res.send(products);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/api/favorites', async (req, res) => {
    try {
        const favorites = await getFavorites();
        res.send(favorites);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/api/users/:id/favorites', async (req, res) => {
    try {
        const id = req.params.id;
        const favorites = await getAllFavorites(id);
        res.send(favorites);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await createUser(username, password);
        res.send(user);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/api/users/:id/favorites', async (req, res) => {
    try {
        const addedFavorite = await createFavorite(req.params.id, req.body.productId);
        console.log(addedFavorite);
        res.send(addedFavorite);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.delete('/api/users/:userId/favorites/:id', async (req, res) => {
    try {
        const deletedFavorite = await deleteFavorite(req.params.userId, req.params.id);
        res.send(deletedFavorite);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

const seedDatabase = async () => {
    try {
        console.log('Creating tables...');
        await createTables(client);
        console.log('Tables created successfully.');

        console.log('Seeding the database...');
        console.log('Creating users...');
        const [moe, ethyl, lucy, larry] = await Promise.all([
            createUser('moe', 'stooge'),
            createUser('ethyl', 'mertz'),
            createUser('lucy', 'ricardo'),
            createUser('larry', 'fine')
        ]);
        console.log('Users created:', moe, ethyl, lucy, larry);

        console.log('Creating products...');
        const [radio, tv, phone, laptop] = await Promise.all([
            createProduct('radio'),
            createProduct('tv'),
            createProduct('phone'),
            createProduct('laptop')
        ]);
        console.log('Products created:', radio, tv, phone, laptop);

        console.log('Creating favorites...');
        const [fav1, fav2, fav3, fav4] = await Promise.all([
            createFavorite(moe.id, radio.id),
            createFavorite(ethyl.id, tv.id),
            createFavorite(lucy.id, phone.id),
            createFavorite(larry.id, laptop.id)
        ]);
        console.log('Favorites created:', fav1, fav2, fav3, fav4);
    } catch (error) {
        console.error('Error seeding the database:', error);
    }
};

const init = async () => {
    try {
        console.log('Connecting to the database...');
        await client.connect();
        console.log('Connected to the database!');
        await seedDatabase();
        app.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}!`);
        });
    } catch (error) {
        console.error('Error starting server!', error);
    }
};

init();