Redis data store provider for the Bogart "Flash" JSGI middleware.

## Example:
```javascript
var bogart = require("bogart"),
  RedisProvider = require("redisDataProvider");

var config = function(show, create, update, destroy) {
  show('/flash', function(req) {
    var existing  = "Existing Flash:"+ req.flash("foo") +"<br />";
    req.flash("foo", Math.random() * 10);
    return bogart.html(existing);
  });
};

var provider = new RedisProvider();
var app = bogart.middleware.Flash({flashDataProvider: provider}, bogart.router(config));
bogart.start(app, {port:1337});
```