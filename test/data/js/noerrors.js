import * as chai from "chai";
import * as eslint from "eslint";

import { f1 } from "./export-1.js";
import { f2 } from "./export-2.js";

function add(a, b) {
  return a + b;
}

add(2, 3);

eslint.lintFiles([]);
chai.assert.equal(1, 1);
f1();
f2();
