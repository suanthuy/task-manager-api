const express = require("express");
const auth = require("../middleware/auth");
const Task = require("../models/task");
const User = require("../models/user");
const router = new express.Router();

router.post("/tasks", auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id,
    });

    try {
        await task.save();
        res.status(201).send(task);
    } catch (error) {
        res.status(400).send(err);
    }
});

/**
 * GET /tasks?completed=true or false
 * GET /task?limit=10&skip=0
 * GET /task?sortBy=createdAt-desc
 */
router.get("/tasks", auth, async (req, res) => {
    try {
        // const task = await Task.find({ owner: req.user._id });
        // res.status(200).send(task);

        const match = {};
        const sort = {};

        if (req.query.completed) {
            match.completed = req.query.completed === "true";
        }

        if (req.query.sortBy) {
            const part = req.query.sortBy.split("-");
            sort[part[0]] = part[1] === "desc" ? -1 : 1;
        }

        const user = await User.findById(req.user._id)
            .populate({
                path: "tasks",
                match,
                options: {
                    limit: parseInt(req.query.limit),
                    skip: parseInt(req.query.skip),
                    sort,
                },
            })
            .exec();
        res.status(200).send(user.tasks);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get("/tasks/:id", auth, async (req, res) => {
    try {
        const _id = req.params.id;
        const task = await User.findById({ _id, owner: req.user._id });
        if (!task) {
            return res.status(404).send();
        }

        res.status(200).send(task);
    } catch (error) {
        res.status(500).send(err);
    }
});

router.patch("/tasks/:id", auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowUpdate = ["description", "completed"];
    const isValidOperation = updates.every((update) => {
        return allowUpdate.includes(update);
    });

    if (!isValidOperation) {
        res.status(400).send({ error: "Invalid update" });
    }

    try {
        const task = await Task.findOne({
            _id: req.params.id,
            owner: req.user._id,
        });

        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
        //     new: true,
        //     runValidators: true,
        // });

        if (!task) {
            return res.status(404).send();
        }

        updates.forEach((update) => {
            task[update] = req.body[update];
        });
        await task.save();
        res.status(200).send(task);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.delete("/tasks/:id", auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id,
        });

        if (!task) {
            return res.status(404).send();
        }

        res.status(200).send(task);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
