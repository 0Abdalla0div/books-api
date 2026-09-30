const { createapp } = require("./app");
const request = require("supertest");
let app;
let createdID;
beforeAll(async () => {
  app = await createapp();
});

test("GET /api/books returns books", async () => {
  const response = await request(app).get("/api/books");
  expect(response.statusCode).toBe(200);
  expect(Array.isArray(response.body)).toBe(true);
});
test("GET /api/books/:id return exact id", async () => {
  const allbooks = await request(app).get("/api/books");
  const validID = allbooks.body[0].id;
  const response = await request(app).get(`/api/books/${validID}`);
  expect(response.statusCode).toBe(200);
  expect(response.body[0].id).toBe(validID);
});
test("GET /api/books/:id returns 404 for a non exsiting book", async () => {
  const response = await request(app).get("/api/books/9999");
  expect(response.statusCode).toBe(404);
});
test("GET /api/books?name&author return an non empty array", async () => {
  const allbooks = await request(app).get("/api/books");
  const validname = allbooks.body[0].name;
  const validauthor = allbooks.body[0].author;
  const response = await request(app).get(
    `/api/books?name=${validname}&author=${validauthor}`,
  );
  expect(response.statusCode).toBe(200);
  expect(Array.isArray(response.body)).toBe(true);
});
test("POST /api/books create a new book", async () => {
  const response = await request(app)
    .post("/api/books")
    .send({ name: "testBook", author: "testAuthor" });
  expect(response.statusCode).toBe(201);
  createdID = response.body.id;
});
test("POST /api/books return 400 bad body", async () => {
  const response = await request(app).post("/api/books").send({});
  expect(response.statusCode).toBe(400);
});
test("PUT /api/books update values", async () => {
  const response = await request(app)
    .put(`/api/books/${createdID}`)
    .send({ name: "test2", author: "test2" });
  expect(response.statusCode).toBe(200);
});
test("PUT /api/books return 400 bad values", async () => {
  const response = await request(app)
    .put(`/api/books/${createdID}`)
    .send({ author: "test3" });
  expect(response.statusCode).toBe(400);
});
test("PATCH /api/books update one value", async () => {
  const response = await request(app)
    .patch(`/api/books/${createdID}`)
    .send({ author: "test4" });
  expect(response.statusCode).toBe(200);
});
test("PATCH /api/books update two values", async () => {
  const response = await request(app)
    .patch(`/api/books/${createdID}`)
    .send({ name: "test5", author: "test5" });
  expect(response.statusCode).toBe(200);
});
test("PATCH /api/books 400 bad values", async () => {
  const response = await request(app).patch(`/api/books/${createdID}`).send({});
  expect(response.statusCode).toBe(400);
});
test("DELETE /api/books/:id return 200", async () => {
    const response = await request(app).delete(`/api/books/${createdID}`);
    expect(response.statusCode).toBe(200);
});
// if some tests failes it might be cuz post test failled i will takle this later
