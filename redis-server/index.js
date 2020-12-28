require('dotenv').config()
const http = require('http');
const path = require('path');
const open = require('amqplib').connect('amqp://localhost');
const Counter = require(path.join('..', 'models', 'counter'));

const PORT = process.env.REDIS_SERVER_PORT || 5000;
const INCREASE_QUEUE = process.env.INCREASE_QUEUE;

http.createServer().listen(PORT, () => {
    console.log(`Redis server is running on port ${PORT}`)
});

const createChannel = () => {
    return new Promise(resolve => {
        open.then(conn => conn.createChannel())
            .then(channel => resolve(channel))
            .catch(err => { throw err });
    })
};

createChannel().then(channel => consumer(channel, INCREASE_QUEUE));

const publisher = (channel, queue, msg) => {
    channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(msg));
};

const consumer = (channel, queue) => {
    channel.assertQueue(queue);
    channel.consume(queue, (msg) => {
        const INCREASE_MSG = process.env.INCREASE_QUEUE;
        const REDIS_COUNTER_KEY = process.env.REDIS_COUNTER_KEY;
        if (msg.content.toString() === INCREASE_MSG) {
           increaseCounter(REDIS_COUNTER_KEY);
        }
    }, { noAck: true });
};

const increaseCounter = async (key) => {
    const COUNTER_QUEUE = process.env.COUNTER_QUEUE;
    await Counter.checkCache(key);
    const counter = await Counter.increase(key);
    const channel = await createChannel();
    publisher(channel, COUNTER_QUEUE, counter.toString())
};
