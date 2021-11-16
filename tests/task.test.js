const request = require("supertest");
const app = require("../src/app");
const Task = require("../src/models/task");
const {
    userOne,
    userOneId,
    userTwo,
    userTwoId,
    taskOne,
    setupDatabase,
} = require("./fixtures/db");

beforeEach(setupDatabase);

test("Should create task for user", async () => {
    const response = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: "Go to sleep",
        })
        .expect(201);

    const task = await Task.findById(response.body._id);
    expect(task).not.toBeNull();
    expect(task.completed).toBe(false);
});

test("Should get task for userOne", async () => {
    const response = await request(app)
        .get("/tasks")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    // toBe or toEqual are OK
    expect(response.body.length).toBe(2);
});

test("Should delete first task from userOne", async () => {
    const response = await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    const task = await Task.findById(response.body._id);
    expect(task).toBeNull();
});

test("Should not delete first task from userTwo", async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404);

    const task = await Task.findById(taskOne._id);
    expect(task).not.toBeNull();
});
