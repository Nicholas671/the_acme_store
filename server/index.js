const express = require('express');
const app = express();
require('dotenv').config();

const {
    client,
    createUser,
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

const init = async () => {
    try {
        await client.connect();
        console.log('Connected to the database!');
        app.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}!`);
        });
    } catch (error) {
        console.error('Error starting server!', error);
    }
};

init();