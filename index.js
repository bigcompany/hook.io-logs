var log = {};
module['exports'] = log;

var logSubcriberClient;
var MAX_LOGS_PER_HOOK = 50;
var redis = require("redis");
var client;

log.start = function (opts) {

  client = redis.createClient(opts.port, opts.host);
  client.auth(opts.password);

  logSubcriberClient = redis.createClient(opts.port, opts.host);
  logSubcriberClient.auth(opts.password)

  // TODO: better error handling and client setup/teardown
  client.on("error", function (err) {
      console.log("Error: " + err);
  });

  // TODO: better error handling and client setup/teardown
  logSubcriberClient.on("error", function (err) {
      console.log("Error: " + err);
  });
}

log.flush = function (endpoint, cb) {
  client.del("/hook" + endpoint + "/logs", function(err, results){
    // show logs in reverse order
    return cb(err, results);
  });
};

log.recent = function (endpoint, cb) {
  // gets the most recent logs for endpoint
  client.lrange("/hook" + endpoint + "/logs", 0, MAX_LOGS_PER_HOOK, function(err, results){
    // show logs in reverse order
    results = results.reverse();
    return cb(err, results);
  });
};

log.stream = function (outputStream){
  // tails the most recent log entries for user
};

log.push = function push (endpoint, entry, cb) {
  // Before adding a new entry we must check if endpoint has exceeded MAX_LOGS_PER_HOOK
  // if so, then pop the last item from the list before adding a new item
  log._count("/hook" + endpoint + "/logs", function(err, res){
    if (err) {
      return cb(err);
    }
    if (res >= MAX_LOGS_PER_HOOK) {
      // console.log("Max log entries hit!");
      return removeLastEntry();
    } else {
      return addEntry();
    }
  });

  function addEntry () {
    // add entry to set
    client.rpush("/hook" + endpoint + "/logs", JSON.stringify(entry), function (err, res){
      if (err) {
        return cb(err);
      }
      // console.log('attempting to publish', "/hook" + endpoint + "/logs")
      logSubcriberClient.publish("/hook" + endpoint + "/logs", JSON.stringify(entry));
    });
  };

  function removeLastEntry () {
    client.lpop("/hook" + endpoint + "/logs", function (err, result){
      if (err) {
        return cb(err);
      }
      addEntry();
    });
  };

};

// gets the amount of logs currently keyed to endpoint
log._count = function (endpoint, cb) {
  client.llen(endpoint, function (err, res){
    if (err) {
      return cb(err);
    }
    cb(null, res);
  })
};