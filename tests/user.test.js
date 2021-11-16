const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");
const { userOne, userOneId, userTwo, setupDatabase } = require("./fixtures/db");

beforeEach(setupDatabase);

test("Should sign up a new user", async () => {
    const response = await request(app)
        .post("/users")
        .send({
            name: "XuanThuy",
            email: "suanthuy12@gmail.com",
            password: "abc123456",
            age: 23,
        })
        .expect(201);

    // Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();

    // Assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: "XuanThuy",
            email: "suanthuy12@gmail.com",
        },
        token: user.tokens[0].token,
    });

    expect(user.password).not.toBe("abc123456");
});

test("Should login an existing user", async () => {
    const response = await request(app)
        .post("/users/login")
        .send({
            email: userOne.email,
            password: userOne.password,
        })
        .expect(200);

    const user = await User.findById(response.body.user._id);
    expect(response.body).toMatchObject({
        user: {
            email: userOne.email,
        },
        token: user.tokens[1].token,
    });
});

test("Should not login an nonexistent user", async () => {
    await request(app)
        .post("/users/login")
        .send({
            email: "andrew@gmail.com",
            password: "abc132456",
        })
        .expect(400);
});

test("Should get profile for user", async () => {
    await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
});

test("Should not get profile for unauthenticated user", async () => {
    await request(app).get("/users/me").send().expect(401);
});

test("Should delete account for user", async () => {
    const response = await request(app)
        .delete("/users/me")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    const user = await User.findById(response.body._id);
    expect(user).toBeNull();
});

test("Should not delete account for unauthenticated user", async () => {
    await request(app).delete("/users/me").send().expect(401);
});

test("Should upload avatar", async () => {
    const response = await request(app)
        .post("/users/me/avatar")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .attach("avatar", "tests/fixtures/profile-pic.jpg")
        .expect(200);

    const user = await User.findById(response.body._id);
    expect(user.avatar).toEqual(expect.any(Buffer));
});

test("Should update valid user fields", async () => {
    const response = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: "Andrew",
            age: 18,
        })
        .expect(200);

    const user = await User.findById(response.body._id);
    expect(user.name).toBe("Andrew");
    expect(user.age).toBe(18);
});

test("Should not update invalid user fields", async () => {
    const response = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: "Hanoi",
        })
        .expect(400);
});
