import { f2 } from "./export-2.js";
import { f1 } from "./export-1.js";
import * as eslint from "eslint";
import * as chai from "chai";

eslint.lintFiles([]);
chai.assert.equal(1, 1);
f1();
f2();
