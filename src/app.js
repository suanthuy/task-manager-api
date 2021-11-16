const express = require("express");
require("../src/db/mongoose");

const userRouter = require("../src/routers/user");
const taskRouter = require("../src/routers/task");

const app = express();

/**
 * express.json() --> make require to an object
 */
app.use(express.json());

app.use(userRouter);
app.use(taskRouter);

// const User = require("../src/models/user");
// const Task = require("../src/models/task");

// async function main() {
//     const user = await User.findById("618cee3c4dbe3de48bc2f101")
//         .populate("tasks")
//         .exec();
//     console.log(user.tasks);
// }

// main();

module.exports = app;
