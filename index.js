const express = require('express');
const Counter = require('./models/counter');

const app = express();
app.set('views', 'views');
app.set('view engine' , 'ejs');

const PORT = process.env.PORT || 3000;
const KEY_NAME = 'counter';

app.listen(PORT, () => {
    Counter.checkCache('counter');
    console.log(`Server is running on port ${PORT}`)
})

app.get('/', async (req, res) => {
    const counter = await Counter.fetch(KEY_NAME);
    res.render('index', { counter })
});

app.post('/', async (req, res) => {
    const counter = await Counter.increase(KEY_NAME);
    res.render('index', { counter })
});
