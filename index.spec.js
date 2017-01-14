/* global define it should */

const ConsulPilot = require('consul-pilot');
const address = '0.0.0.0';
const port = 3000;

beforeEach(() => {
    ConsulPilot._services = [];
});

/***/ 
it('should be able to refresh specific services', () => {
    ConsulPilot.watch('test', () => true);
    
    return ConsulPilot._.refreshService('test')
        .then(res => {
            expect(res.address).toBe(address);
            expect(res.port).toBe(port);
        });
}); /***/


/***/
it('should be able to refresh even bad services', () => {
    ConsulPilot.watch('err', () => true);

    return ConsulPilot._.refreshService('err')
        .catch(res => {
            expect(res.address).toBe(null);
            expect(res.port).toBe(null);
        });
}); /***/


/***/
it('should be able to create watchers', done => {
    ConsulPilot.watch('test', done);

    return ConsulPilot._.refreshService('test')
        .then(res => {
            expect(res.address).toBe(address);
            expect(res.port).toBe(port);
        });
}); /***/


/***/
it('should be able to refresh all services', () => {
    ConsulPilot.watch('test', () => true);
    ConsulPilot.watch('test2', () =>  true);

    return ConsulPilot._.refreshAllServices()
        .then(res => {
            expect(res[0].callback).toBeDefined();
            expect(res[0].address).toBe(address);
            expect(res[0].port).toBe(port);
        });
}); /***/


/***/
it('', () => {
    ConsulPilot.watch('test', () => true);

    return ConsulPilot._.signal()
        .then(results => {
            expect(results[0].callback).toBeDefined();
            expect(results[0].address).toBe(address);
            expect(results[0].port).toBe(port);
        });
}); /***/
