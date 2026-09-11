const orders = "postgres://localhost:5432/orders_test";
const events = "mongodb://127.0.0.1:27017/events_test";
const service = "postgres://postgres:5432/orders_test";
const cache = "redis://[::1]:6379";
const api = "https://api.example.com/v1/orders";

// A host read out of config cannot be judged here, so neither of these is reported.
const fromConfig = `redis://${config.cacheHost}:6379`;
const fromEnvironment = `postgres://${process.env.DB_HOST}:5432/orders`;

// Turning verification back on is the safe direction.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "1";

export default { orders, events, service, cache, api, fromConfig, fromEnvironment };
