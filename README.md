# consul-pilot

[![Build Status](https://travis-ci.org/betastreet/consul-pilot.svg?branch=master)](https://travis-ci.org/betastreet/consul-pilot)

```
const ConsulPilot = require('consul-pilot');

ConsulPilot.watch('database', (err, service) => {
    if (err) console.error(err);

    console.log('New Service Information', service);
});
```
