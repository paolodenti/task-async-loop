let _options = {};

const setDelay = (delay) => {
    _options.delay = delay;
};

module.exports = async (options) => {
    _options = options;

    // no delay on first run
    let _delay = 0;

    while (_delay >= 0 && (typeof _options.condition === "function" ? _options.condition(_options.data) : true)) {
        // wait for promise fulfillment
        await new Promise((resolve, reject) => {
            // run with delay
            setTimeout(
                () => {
                    if (typeof _options.executer === "function") {
                        try {
                            _options.executer(_options.data, resolve, reject, setDelay);
                        } catch {
                            reject();
                        }
                    } else {
                        resolve();
                    }
                },
                _delay ? _delay : 0
            );
        })
            .then(() => {
                // update iteration delay
                _delay = options.delay;
            })
            .catch(() => {
                // exit loop
                _delay = -1;
            });
    }
};
