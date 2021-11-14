const express = require("express");
require("../src/db/mongoose");

const userRouter = require("../src/routers/user");
const taskRouter = require("../src/routers/task");

const app = express();
const port = process.env.PORT;

/**
 * express.json() --> make require to an object
 */
app.use(express.json());

app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log("Server is up on port", port);
});

// const User = require("../src/models/user");
// const Task = require("../src/models/task");

// async function main() {
//     const user = await User.findById("618cee3c4dbe3de48bc2f101")
//         .populate("tasks")
//         .exec();
//     console.log(user.tasks);
// }

// main();

// Task Manager App
// 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
