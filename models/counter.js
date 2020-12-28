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

    static async checkCache(key) {
        return new Promise((resolve, reject) => {
            client.exists(key, (err, isExist) => {
                if (err) reject();
                if (!isExist) {
                    this._addKey(key, 0).then(_ => resolve());
                } else {
                    resolve();
                }
            })
        })
    }

    static async _addKey(key, value) {
        return new Promise((resolve, reject) => {
            client.set(key, value, (err) => err ? reject(err) : resolve());
        })
    }
}

module.exports = Counter;
