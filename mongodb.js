/**
 * CRUD: create read update delete
 */

const { MongoClient, ObjectId } = require("mongodb");

const connectionURL = "mongodb://127.0.0.1:27017";
const databaseName = "task-manager";

// const id = new ObjectId();
// console.log(id.id.length);

MongoClient.connect(
    connectionURL,
    { useNewUrlParser: true },
    (error, client) => {
        if (error) {
            return console.log("Unable to connect to database");
        }

        console.log("Connect successfully");

        const db = client.db(databaseName);

        const deletePromise = db.collection("tasks").deleteOne({
            work: "clean the house",
        });

        deletePromise
            .then((result) => {
                console.log(result);
            })
            .catch((err) => {
                console.log(err);
            });
    }
);
