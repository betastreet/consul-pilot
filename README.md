# consul-pilot

```
const ConsulPilot = require('consul-pilot');

ConsulPilot.watch('database', (err, service) => {
    if (err) console.error(err);

    console.log('New Service Information', service);
});
```
