import nock from "nock";

nock.enableNetConnect();
nock.enableNetConnect("");
nock.enableNetConnect(/.*/);

// A real allow list is the point of the rule, so this one is left alone.
nock.enableNetConnect(/(localhost|127\.0\.0\.1):\d+/);
