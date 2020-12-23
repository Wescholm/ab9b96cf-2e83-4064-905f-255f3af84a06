const redis = require('redis');
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const client = redis.createClient(REDIS_PORT);

class Counter {
    static async fetch(key) {
        return new Promise((resolve, reject) => {
            client.get(key, (err, data) => err ? reject(err) : resolve(data))
        });
    }

    static async increase(key) {
        return new Promise((resolve, reject) => {
            client.incr(key, (err, data) => err ? reject(err) : resolve(data))
        });
    }

    static checkCache(key) {
        client.exists(key, (err, isExist) => {
            if (err) throw err;
            if (!isExist) this._addKey(key, 0);
        })
    }

    static _addKey(key, value) {
        client.set(key, value, (err) => {
            if (err) throw err;
        })
    }
}

module.exports = Counter;
