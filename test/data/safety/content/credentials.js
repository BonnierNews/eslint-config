const orders = "postgres://svc_orders:s3cret-value@orders-db.prod.example.com:5432/orders";
const cluster = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.mongodb.net/app`;
const cache = "redis://:an0ther-s3cret@cache.prod.example.com:6379";
const signingKey = "-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA\n-----END RSA PRIVATE KEY-----";
const connection = { host: "orders-db.prod.example.com", password: "a-real-looking-password" };

class Client {
  password = "another-real-looking-one";
}

export default { orders, cluster, cache, signingKey, connection, Client };
