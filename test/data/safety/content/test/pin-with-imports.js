import nock from "nock";

process.env.NODE_CONFIG_ENV = "test";

nock.disableNetConnect();
