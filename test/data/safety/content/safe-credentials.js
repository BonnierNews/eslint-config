const local = "postgres://orders:orders@localhost:5432/orders_test";
const service = "mongodb://root:example@mongo:27017/app_test";

// A documentation example on a real looking host: recognised by the placeholder user and password.
const documented = "postgres://username:password@db.example.com:5432/orders";

// Prose in a secret shaped property, which is what a message catalogue or a schema looks like.
const copy = { secret: "The shared secret is set per environment" };

// Short fixture values and placeholders are not credentials.
const fixture = { host: "localhost", password: "test" };
const short = { password: "abc123" };
const template = { password: "<your-password>" };

export default { local, service, documented, copy, fixture, short, template };
