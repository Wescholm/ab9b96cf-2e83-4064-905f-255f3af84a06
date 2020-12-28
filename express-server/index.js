require('dotenv').config()
const express = require('express');
const path = require('path');
const open = require('amqplib').connect('amqp://localhost');
const Counter = require(path.join('..', 'models', 'counter'));

const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine' , 'ejs');

const PORT = process.env.EXPRESS_SERVER_PORT || 3000;
app.listen(PORT, () => {
    console.log(`Express server is running on port ${PORT}`)
});

app.get('/', async (req, res) => {
    const REDIS_COUNTER_KEY = process.env.REDIS_COUNTER_KEY;
    const counter = await Counter.fetch(REDIS_COUNTER_KEY) || 0;
    res.render('index', { counter })
});

app.post('/', async (req, res) => {
    const counter = await increaseCounter();
    res.render('index', { counter })
});

const increaseCounter = async () => {
    const INCREASE_QUEUE = process.env.INCREASE_QUEUE;
    const INCREASE_MSG = process.env.INCREASE_MSG;
    const COUNTER_QUEUE = process.env.COUNTER_QUEUE;
    return new Promise(resolve => {
        open.then(conn => conn.createChannel())
            .then(async (channel) => {
                publisher(channel, INCREASE_QUEUE, INCREASE_MSG);
                const counter = await consumer(channel, COUNTER_QUEUE);
                channel.close();
                resolve(counter);
            })
            .catch(err => { throw err });
    })
};

const publisher = (channel, queue, msg) => {
    channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(msg));
};

const consumer = async (channel, queue) => {
   return new Promise(resolve => {
       channel.assertQueue(queue);
       channel.consume(
           queue,
           (msg) => resolve(msg.content.toString()),
           { noAck: true });
   })
};
