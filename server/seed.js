console.log('Hello from the seed!');

const { client, createTables, createUsers, createProducts, createFavorites } = require('./db');


const seed = async () => {
    try {
        await client.connect();
        await createTables();
        console.log('Tables created!');
        console.log('Seeding the database...');
        const [moe, ethyl, lucy] = await Promise.all([
            createUsers('moe', 'stooge'),
            createUsers('ethyl', 'mertz'),
            createUsers('lucy', 'ricardo')
        ]);
        console.log('Users created!');
        console.log('Creating products...');
        const [radio, tv, phone] = await Promise.all([
            createProducts('radio', 10),
            createProducts('tv', 100),
            createProducts('phone', 1000)
        ]);
        console.log('Products created!');
        console.log('Creating favorites...');
        const [fav1, fav2, fav3] = await Promise.all([
            createFavorites(moe.id, radio.id),
            createFavorites(ethyl.id, tv.id),
            createFavorites(lucy.id, phone.id)
        ]);

    } catch (error) {
        console.error('Error seeding the database: ', error);
    }
};

seed();