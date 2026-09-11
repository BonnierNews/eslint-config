import stayput from "@bonniernews/stayput";

process.env.STAYPUT_ALLOW = "orders-db.prod.example.com";
globalThis.process.env.STAYPUT_DISABLE = "I_UNDERSTAND_THE_RISK";
process.env["STAYPUT_DENY"] = "cache.prod.example.com";
process.env.ALLOW_TEST_ENV_OVERRIDE = "1";

stayput.enable({ allow: [ "orders-db.prod.example.com" ] });
