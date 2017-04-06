const debug = require('debug')('ConsulPilot');
const Consulite = require('consulite');

const _ = {};


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
        debug('ADDING WATCHER', serviceName);

        const self = this;

        if (!self._services[serviceName]) {
            debug('SERVICE:', serviceName, 'NOT DEFINED, CREATING');
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
    debug('REFRESHING ALL SERVICES');

    const self = module.exports;
    const services = self._services;

    return Promise.all(
        Object.keys(services)
            .map(serviceName => _.refreshService(serviceName))
    );
}


_.refreshService = (serviceName) => {
    debug('REFRESHING SERVICE:', serviceName, module.exports._services[serviceName]);

    const service = module.exports._services[serviceName];

    return new Promise((resolve, reject) => {
        Consulite.refreshService(serviceName)
            .then(results => {
                const consulService = results[0];
                debug('RECEIVED NEW INFORMATION', serviceName, consulService);

                if (consulService && consulService.address && consulService.address !== service.address) {
                    debug('SERVICE:', serviceName, 'HAS NEW ADDRESS');
                    service.address = consulService.address;
                    service.port = consulService.port;

                    _.update(null, serviceName);
                }

                return resolve(service);
            })
            .catch(err => {
                debug('SERVICE NOT FOUND', serviceName, err);
                service.address = null;
                service.port = null;

                _.update(null, serviceName);

                return reject({ error: 'SERVICE_NOT_FOUND', serviceName });
            });
    });
}


_.update = (err, serviceName) => {
    debug('CALLING:', serviceName, 'CALLBACK');

    const service = module.exports._services[serviceName];

    return service.callback(err, { address: service.address, port: service.port });
}


_.signal = () => {
    debug('SIGHUP RECEIVED');
    return _.refreshAllServices().catch((err) => {
        console.log('error consul-pilot:', err);
    });
}


// process intercetor
process.on('SIGHUP', _.signal);



// expose everything for the tests
if (process.env.NODE_ENV === 'test') {
    module.exports._ = _;
}
