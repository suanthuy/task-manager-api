const {
    fahrenheitToCelsius,
    celsiusToFahrenheit,
    add,
} = require("../src/math");

test("Should convert 32 F to 0 C ", () => {
    const temp = fahrenheitToCelsius(32);
    expect(temp).toBe(0);
});

test("Should convert 0 C to 32 F ", () => {
    const temp = celsiusToFahrenheit(0);
    expect(temp).toBe(32);
});

test("Should add two number", (done) => {
    add(1, 2).then((sum) => {
        expect(sum).toBe(3);
        done();
    });
});

test("Should add two number", async () => {
    const sum = await add(1, 2);
    expect(sum).toBe(3);
});
