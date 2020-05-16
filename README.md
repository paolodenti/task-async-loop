# Task async Loop

**Task Async Loop** is a Node.js module that allows you to run sequentially, in an asynchronous loop, any synchronous/asynchronous/promise based task.

-   Each loop execution is started when the previous execution stops, in strict sequence.

-   An optional delay can be specified to sleep at the end of each iteration (e.g. for polling tasks).

-   An exit loop condition function can be provided.

-   Loop can be dynamically interrupted during the execution task.

-   Sleep time after each iteration can be changed dynamically during task execution.

## Installation

`npm install task-async-loop`

## Dependencies

None.

## Usage

```js
const taskAsyncLoop = require("task-async-loop");
taskAsyncLoop(options);
```

where `options` is an object having the following properties:

-   `delay`: delay between each loop, in milliseconds. The first loop has no initial delay.
-   `data`: a shared object between `condition` and `executer` (see below).
-   `condition(data)`: an optional function returning a boolean value:
    -   `true` to keep executing the task (default value if `condition` is not defined, therefore looping forever).
    -   `false` to stop iterations.
-   `executer(data, next, stop. setDelay)`: an optional function executing a task. If not specified, no action is executed.
    -   `data` the shared object
    -   `next` must to be called when the task ends, to get to the next iteration.
    -   `stop` must be called to stop the iteration loop.
    -   `setDelay` can be invoked to set a new delay dynamically.

## Examples

### Loop a synchronous task #1

Logs every second, forever.

```js
const taskAsyncLoop = require("task-async-loop");
taskAsyncLoop({
    delay: 1000,
    executer: (data, next, stop, setDelay) => {
        console.log("loop");

        next(); // continue iteration
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

        next(); // continue iteration
    }
});
```

### Loop a synchronous task #3

Dynamic loop exit condition

```js
const taskAsyncLoop = require("task-async-loop");
taskAsyncLoop({
    delay: 1000,
    executer: (data, next, stop, setDelay) => {
        const time = new Date().getTime();
        console.log(`loop at ${time}`);

        // simulate exit condition
        if (time % 4 !== 0) {
            next(); // continue iteration
        } else {
            stop(); // exit iteration
        }
    }
});
```

### Loop an asynchronous task #1

Run an async call, sleeping 2 seconds after each execution

```js
const taskAsyncLoop = require("task-async-loop");
taskAsyncLoop({
    delay: 2000,
    executer: (data, next, stop, setDelay) => {
        setTimeout(() => {
            console.log(`loop at ${new Date().getTime()}`);
            next();
        }, Math.random() * 3000); // simulate random execution time
    }
});
```

### Loop an asynchronous task #2

Dynamic loop exit condition

```js
const taskAsyncLoop = require("task-async-loop");
taskAsyncLoop({
    delay: 2000,
    executer: (data, next, stop, setDelay) => {
        setTimeout(() => {
            const time = new Date().getTime();
            console.log(`loop at ${time}`);

            // simulate exit condition
            if (time % 4 != 0) {
                next(); // continue iteration
            } else {
                stop(); // exit iteration
            }
        }, Math.floor(Math.random() * 1000));
    }
});
```

### Loop an asynchronous task #3

Dynamic sleep after each iteration

```js
const taskAsyncLoop = require("task-async-loop");
taskAsyncLoop({
    executer: (data, next, stop, setDelay) => {
        setTimeout(() => {
            console.log(`loop at ${new Date().getTime()}`);

            // change loop delay for the next iteration
            setDelay(Math.floor(Math.random() * 5000));

            next(); // continue iteration
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
        setTimeout(() => {
            const time = new Date().getTime();
            console.log(`loop at ${time}`);

            try {
                // generate random error
                if (time % 4 != 0) {
                    next(); // continue iteration
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

### Loop a Promise #2

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

Loop over ah http get request, with 5 seconds sleep between each request.

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
