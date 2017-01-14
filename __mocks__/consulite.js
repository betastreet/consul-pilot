module.exports = {
    refreshService
};

function refreshService(serviceName) {
    const info = {
        address: '0.0.0.0', 
        port: 3000,
    };

    return new Promise((resolve, reject) => {
        if (serviceName === 'err') {
            return reject([info]);
        }

        return resolve([info]);
    });
}
