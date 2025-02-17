const express = require('express');
const app = express();
require('dotenv').config();

const {
    client,
    createUser,
    createProduct,
    createFavorite,
    getUsers,
    getProducts,
    getFavorites,
    getAllFavorites,
    deleteUserFavorites,
} = require('./db');

const PORT = process.env.PORT || 3000;
app.use(express.json());

app.get('/users', async (req, res) => {
    try {
        const users = await getUsers();
        res.send(users);
    }
    catch (error) {
        console.error(error);
    }
});

app.get('/products', async (req, res) => {
    try {
        const products = await getProducts();
        res.send(products);
    }
    catch (error) {
        console.error(error);
    }
});

app.get('/favorites', async (req, res) => {
    try {
        const favorites = await getFavorites();
        res.send(favorites);
    }
    catch (error) {
        console.error(error);
    }
});

app.get('/api/users/:id/favorites', async (req, res) => {
    try {
        const id = req.params.id;
        const favorites = await getAllFavorites(id);
        res.send(favorites);
    }
    catch (error) {
        console.error(error);
    }
});

app.post('/users', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await createUser({ username, password });
        res.send(user);
    }
    catch (error) {
        console.error(error);
    }
});

app.post('api/users/:id/favorites', async (req, res) => {
    try {
        const addedFavorite = await createFavorite(
            req.params.id,
            req.body.productId
        );
        console.log(addedFavorite);
        res.send(addedFavorite);
    }
    catch (error) {
        console.error(error);
    }
});

app.delete('/users/:userId/favorites/:id', async (req, res) => {
    try {
        const deletedFavorite = await deleteUserFavorites(req.params.userId, req.params.productId);
        res.send(deletedFavorite);
    }
    catch (error) {
        console.error(error);
    }
});

const init = async () => {
    try {
        await client.connect();
        console.log('Connected to the database!');
        app.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}!`);
        });
    }
    catch (error) {
        console.error('Error starting server!', error);
    }
};

init();