const Consulite = require('consulite');
const ContainerPilot = require(process.env.CONTAINERPILOT_PATH);

const _ = {};

// process intercetor
process.on('SIGHUP', () => {
    console.log('SIGHUP RECEIVED');
    _.refreshAllServices()
});

/**
 * ConsulPilot
 *
 * Returns singleton of module
 * discovers consul using envars CONSUL_HOST CONSUL_PORT or defaults to consul:8500
 *
 * watch services for change, executing function passed, CP will pass (err, { address, port }) to callback;
 * watch(serviceName, callbackFunc);
 */

class ConsulPilot {

    constructor () {
        this._services = {}; // serviceName: { callback, address, port }
    }

    watch (serviceName, callback) {
        console.log('ADDING WATCHER', serviceName);

        const self = this;

        if (!self._services[serviceName]) {
            console.log('SERVICE:', serviceName, 'NOT DEFINED, CREATING');
            self._services[serviceName] = {};
        }

        self._services[serviceName].callback = callback;

        return _.refreshService(serviceName)
            .then(consulService => {
                self._services[serviceName] = consulService;
            });
    }
}

module.exports = new ConsulPilot();


_.refreshAllServices = () => {
    console.log('REFRESHING ALL SERVICES');

    const self = module.exports;
    const services = self._services;

    Object.keys(services).map(serviceName => _.refreshService(serviceName));
}


_.refreshService = (serviceName) => {
    console.log('REFRESHING SERVICE:', serviceName, module.exports._services[serviceName]);

    const service = module.exports._services[serviceName];

    return new Promise(resolve => {
        Consulite.refreshService(serviceName)
            .then(results => {
                const consulService = results[0];
                console.log('RECEIVED NEW INFORMATION', serviceName, consulService);

                if (consulService && consulService.address !== service.address) {
                    console.log('SERVICE:', serviceName, 'HAS NEW ADDRESS');
                    service.address = consulService.address;
                    service.port = consulService.port;

                    _.update(null, serviceName);
                }

                return resolve(service);
            })
            .catch(err => {
                console.log('SERVICE NOT FOUND', serviceName, err);
                service.address = null;
                service.port = null;

                _.update(null, serviceName);

                return resolve(service);
            });
    });
}


_.update = (err, serviceName) => {
    console.log('CALLING:', serviceName, 'CALLBACK');

    const service = module.exports._services[serviceName];

    return service.callback(err, { address: service.address, port: service.port });
}

