Redis provider(s) for the Bogart "Flash" JSGI middleware.

## Example:
```javascript
var bogart = require("bogart"),
  providers = require("bogart-flash-redis");

var config = function(show, create, update, destroy) {
  show('/flash', function(req) {
    var existing  = "Existing Flash:"+ req.flash("foo") +"<br />";
    req.flash("foo", Math.random() * 10);
    return bogart.html(existing);
  });
};

var DataProvider = providers.DataProvider;
var flashConfig = {
  options: {},
  flashDataProvider: new DataProvider()
};
var app = bogart.middleware.Flash(flashConfig, bogart.router(config));
bogart.start(app, {port:1337});
```