# Task async Loop

**Task Async Loop** is a Node.js module, with no dependencies, that allows you to run sequentially, in an asynchronous loop, any synchronous/asynchronous/promise task.

-   Each loop execution is started when the previous task execution stops.

-   An optional delay can be specified to sleep at the end of each iteration (e.g. for polling tasks).

-   An exit loop condition function can be provided.

-   Iterations can be dynamically stopped during the execution task.

-   Iteration delay can be changed dynamically during task execution.

## Installation

`npm install task-async-loop`

## Usage

```js
const taskAsyncLoop = require("task-async-loop");
taskAsyncLoop(options);
```

where `options` is an object having the following properties:

-   `delay`: delay between each loop, in milliseconds. The first loop has no initial delay.
-   `data`: a shared object between `condition` and `executer` (see below).
-   `condition(data)`: an optional function returning `true` to keep executing the task, `false` to stop iterations. If not defined, the lopp will run forever.
-   `executer(data, next, stop. setDelay)`: an optional function executing a task. If not specified, no action is executed. - `data` - `next` must to be called when the task ends, to get to the next iteration. - `stop` must be called to stop the iteration loop. - `setDelay` can be invoked to set a new delay dynamically.

## Examples

### Loop a synchronous task #1

Logs every second, forever.

```js
const taskAsyncLoop = require("task-async-loop");
taskAsyncLoop({
    delay: 1000,
    executer: (data, next, stop, setDelay) => {
        console.log("loop");

        next(); // keep iterating
    }
});
```

### Loop a synchronous task #2

Logs every second, 10 times.

```js
const taskAsyncLoop = require("task-async-loop");
taskAsyncLoop({
    delay: 1000,
    data: {
        count: 0
    },
    condition: (data) => {
        return data.count++ < 10;
    },
    executer: (data, next, stop, setDelay) => {
        console.log(`loop #${data.count}`);

        next(); // keep iterating
    }
});
```

### Loop a synchronous task #3

Dynamic exit condition

```js
const taskAsyncLoop = require("task-async-loop");
taskAsyncLoop({
    delay: 1000,
    executer: (data, next, stop, setDelay) => {
        const time = new Date().getTime();
        console.log(`loop at ${time}`);

        // random exit condition
        if (time % 4 !== 0) {
            next(); // keep iterating
        } else {
            stop(); // stop iterating
        }
    }
});
```

### Loop a synchronous task #1

Run an async call, sleeping 2 seconds after each execution

```js
const taskAsyncLoop = require("task-async-loop");
taskAsyncLoop({
    delay: 2000,
    executer: (data, next, stop, setDelay) => {
        setTimeout(() => {
            console.log(`loop at ${new Date().getTime()}`);
            next();
        }, Math.random(1000)); // simulate random execution time
    }
});
```

### Loop an asynchronous task #2

Dynamic exit condition

```js
const taskAsyncLoop = require("task-async-loop");
taskAsyncLoop({
    delay: 2000,
    executer: (data, next, stop, setDelay) => {
        setTimeout(() => {
            const time = new Date().getTime();
            console.log(`loop at ${time}`);

            // random exit condition
            if (time % 4 != 0) {
                next(); // keep iterating
            } else {
                stop(); // stop iterating
            }
        }, Math.random(1000));
    }
});
```

### Loop an asynchronous task #3

Dynamic loop delay

```js
const taskAsyncLoop = require("task-async-loop");
taskAsyncLoop({
    executer: (data, next, stop, setDelay) => {
        console.log(`loop at ${new Date().getTime()}`);

        // change loop delay for the next iteration
        setDelay(Math.random(3000));

        setTimeout(() => {
            next(); // keep iterating
        }, 1000);
    }
});
```

### Loop an asynchronous task #4

Error management. Stop iterations upon unexpected error

```js
const taskAsyncLoop = require("task-async-loop");
taskAsyncLoop({
    delay: 2000,
    executer: (data, next, stop, setDelay) => {
        const time = new Date().getTime();
        console.log(`loop at ${time}`);

        setTimeout(() => {
            try {
                // generate random error
                if (time % 4 != 0) {
                    next(); // keep iterating
                } else {
                    throw new Error();
                }
            } catch {
                stop(); // manage unexpected error exiting loop
            }
        }, 1000);
    }
});
```

### Loop a Promise #1

Run promise 10 times, sleeping 1 second after each execution

```js
const taskAsyncLoop = require("task-async-loop");
taskAsyncLoop({
    delay: 1000,
    data: {
        count: 0
    },
    condition: (data) => {
        return data.count++ < 10;
    },
    executer: (data, next, stop, setDelay) => {
        new Promise((resolve, reject) => {
            console.log(`looping with count ${data.count}`);
            resolve();
        }).then(() => {
            next();
        });
    }
});
```

### Loop an Promise #2

Run promise, with 1 second delay, exit on dynamic condition

```js
const taskAsyncLoop = require("task-async-loop");
taskAsyncLoop({
    delay: 1000,
    data: {
        count: 0
    },
    executer: (data, next, stop, setDelay) => {
        new Promise((resolve, reject) => {
            data.count++;
            console.log(`looping with count ${data.count}`);

            if (data.count >= 5) {
                reject(); // or throw new Error()
            } else {
                resolve();
            }
        })
            .then(() => {
                next();
            })
            .catch(() => {
                stop();
            });
    }
});
```

### HTTP Request Polling

Execute a get request every 5 seconds

```js
const taskAsyncLoop = require("task-async-loop");
taskAsyncLoop({
    delay: 5000,
    executer: (data, next, stop, setDelay) => {
        const req = require("https").request(
            {
                hostname: "jsonplaceholder.typicode.com",
                port: 443,
                path: "/todos/1",
                method: "GET"
            },
            (res) => {
                let data = "";

                res.on("data", (chunk) => {
                    data += chunk;
                });

                res.on("end", (d) => {
                    console.log(data);
                    // The whole response has been received. go to next iteration
                    next();
                });
            }
        );

        req.on("error", (error) => {
            console.error(error);
            // got error, stop iterations
            stop();
        });

        req.end();
    }
});
```

## License

MIT License
