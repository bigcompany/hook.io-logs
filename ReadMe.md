# hook.io-logs

Node.js module that powers the hook.io platform's microservice [logs](https://hook.io/logs)

## Introduction

This module is the component which [hook.io](http://hook.io) to manage small amounts of log entries that users can access with a simple API. Log entries are volatile and will expire over time.

Right now this module is essentially a small wrapper around the `redis` module .

You are encouraged to use this module as-is, or modify it to suite your needs. If you are interested in contributing please let us know!