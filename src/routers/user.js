const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const { sendWelcomeEmail, sendDeleteEmail } = require("../emails/account");

const router = new express.Router();
const upload = multer({
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, callback) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return callback(new Error("Please upload jpg/jpeg/png file"));
        }

        callback(undefined, true);
    },
});

router.post("/users", async (req, res) => {
    const user = new User(req.body);

    try {
        // await no need here -->
        sendWelcomeEmail(user.email, user.name);

        await user.save();
        res.status(201).send({ user });
    } catch (err) {
        res.status(400).send(err);
    }
});

router.post("/users/login", async (req, res) => {
    try {
        const user = await User.findByCredentials(
            req.body.email,
            req.body.password
        );
        const token = await user.generateAuthToken();

        res.send({ user, token });
    } catch (err) {
        res.status(400).send({ error: "User not found" });
    }
});

router.post("/users/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();

        res.send();
    } catch (error) {
        res.status(500).send();
    }
});

router.post("/users/logout-all", auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();

        res.send();
    } catch (error) {
        res.status(500).send();
    }
});

router.get("/users/me", auth, async (req, res) => {
    res.send(req.user);
});

router.patch("/users/me", auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowUpdate = ["name", "email", "password", "age"];
    const isValidOperation = updates.every((update) => {
        return allowUpdate.includes(update);
    });

    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid update!" });
    }

    try {
        updates.forEach((update) => (req.user[update] = req.body[update]));
        await req.user.save();

        // const user = await User.findByIdAndUpdate(_id, req.body, {
        //     new: true,
        //     runValidators: true,
        // });

        res.status(200).send(req.user);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.delete("/users/me", auth, async (req, res) => {
    try {
        sendDeleteEmail(req.user.email, req.user.name);
        await req.user.remove();
        res.status(200).send(req.user);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.post(
    "/users/me/avatar",
    auth,
    upload.single("avatar"),
    async (req, res) => {
        // sharp to resize the picture
        const buffer = await sharp(req.file.buffer)
            .resize({ width: 250, height: 250 })
            .png()
            .toBuffer();

        req.user.avatar = buffer;

        await req.user.save();
        res.status(200).send(req.user);
    },
    (err, req, res, next) => {
        res.status(400).send({ error: err.message });
    }
);

router.get("/users/:id/avatar", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
            throw new Error();
        }

        // Set the response that return a image
        res.set("Content-Type", "image/png");

        res.send(user.avatar);
    } catch (error) {
        res.status(404).send("Avatar not found");
    }
});

router.delete(
    "/users/me/avatar",
    auth,
    async (req, res) => {
        req.user.avatar = undefined;
        await req.user.save();
        res.status(200).send(req.user);
    },
    (err, req, res, next) => {
        res.status(400).send({ error: err.message });
    }
);

module.exports = router;
