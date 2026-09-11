// The form dotenv's own readme leads with. The call is visited before the require, so the rule has
// to look at the whole file before deciding.
require("dotenv").config({ override: true });
