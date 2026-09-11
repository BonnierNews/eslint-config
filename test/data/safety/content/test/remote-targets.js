const orders = "postgres://orders-db.prod.example.com:5432/orders";
const cluster = "mongodb+srv://cluster0.mongodb.net/app";
const cache = `redis://cache.prod.example.com:6379/${process.env.CACHE_INDEX}`;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const client = { node: "https://search.example.com", tls: { rejectUnauthorized: false } };

export default { orders, cluster, cache, client };
