var redis 				= require("redis"),
    q 					= require('q'),
    DEFAULT_PORT 		= 6379,
    DEFAULT_EXPIRE_TIME = 600;

module.exports = RedisFlashDataProvider;

function RedisFlashDataProvider(settings) {
    settings = settings || {};
    this.client = redis.createClient(settings.port || DEFAULT_PORT, settings.host || "localhost")
    if (settings.password) {
        this.client.auth(settings.password);
    }

    this.flashVars = {};
}

RedisFlashDataProvider.prototype.previousFlash = function(req, flashId) {
    var self = this,
        get = wrap(self.client.get, self.client);

    return q.when(get(flashId), function(val) {
        return JSON.parse(val);
    });
};

RedisFlashDataProvider.prototype.setter = function(req, flashId) {
    var self = this;
    if (!self.flashVars[flashId]) {
        self.flashVars[flashId] = {};
    }

    return function(data) {
        Object.keys(data).forEach(function(key) {
            self.flashVars[flashId][key] = data[key];
        });
    };
};

RedisFlashDataProvider.prototype.finalize = function(req, resp, flashId) {
    var self = this,
        set = wrap(self.client.set, self.client),
        expire = wrap(self.client.expire, self.client),
        data = self.flashVars[flashId];

    delete self.flashVars[flashId];

    return q.when(set(flashId, JSON.stringify(data)), function(resSet) {
        return q.when(expire(flashId, DEFAULT_EXPIRE_TIME), function(resExp) {
            return resp;
        });
    });
};

RedisFlashDataProvider.prototype.clear = function(req, resp, flashId) {
    this.client.del(flashId);
    return resp;
};

function wrap(nodeAsyncFn, context) {
    return function() {
        var defer = q.defer(),
            args = Array.prototype.slice.call(arguments);

        args.push(function(err, val) {
            if (err !== null) {
                return defer.reject(err);
            }

            return defer.resolve(val);
        });

        nodeAsyncFn.apply(context || {}, args);

        return defer.promise;
    };
}