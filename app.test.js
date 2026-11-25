const { app } = require("./app");
const request = require("supertest");
let createdID;
let user;
let borrowid;
let pending;
let authTokin;
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
  console.log(response.body);
  expect(response.body.id).toBe(validID);
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
  createdID = response.body.id;
  expect(response.statusCode).toBe(201);
});
test("POST /api/books return 400 bad body", async () => {
  const response = await request(app).post("/api/books").send({});
  expect(response.statusCode).toBe(400);
});
test("PUT /api/books update values", async () => {
  const response = await request(app)
    .put(`/api/books/${createdID}`)
    .send({ name: `test${12111}`, author: `test${12111}` });
  expect(response.statusCode).toBe(200);
});
test("PUT /api/books return 400 bad values", async () => {
  const response = await request(app)
    .put(`/api/books/${createdID}`)
    .send({ author: `test${createdID - 1}` });
  expect(response.statusCode).toBe(400);
});
test("PATCH /api/books update one value", async () => {
  const response = await request(app)
    .patch(`/api/books/${createdID}`)
    .send({ author: `test${createdID - 1}` });
  expect(response.statusCode).toBe(200);
});
test("PATCH /api/books update two values", async () => {
  const response = await request(app)
    .patch(`/api/books/${createdID}`)
    .send({ name: `test${createdID}`, author: `test${createdID}` });
  expect(response.statusCode).toBe(200);
});
test("PATCH /api/books 400 bad values", async () => {
  const response = await request(app).patch(`/api/books/${createdID}`).send({});
  expect(response.statusCode).toBe(400);
});
// test("DELETE /api/books/:id return 200", async () => {
//     const response = await request(app).delete(`/api/books/${createdID}`);
//     expect(response.statusCode).toBe(200);
// });
// if some tests failes it might be cuz post test failled i will takle this later
test("GET /api/users return all users", async () => {
  const response = await request(app).get("/api/users");
  expect(response.statusCode).toBe(200);
  expect(Array.isArray(response.body)).toBe(true);
});
test("POST /api/users create a new user", async () => {
  const response = await request(app)
    .post("/api/users")
    .send({
      name: "testuser",
      email: `testuser${Date.now()}@email.com`,
      password: `testuser`,
    });
  expect(response.statusCode).toBe(201);
  user = { email: response.body.email, password: "testuser" };
});
test("POST /api/user login with real data", async () => {
  const response = await request(app).post("/api/user").send(user);
  expect(response.statusCode).toBe(200);
  authTokin = response.body.token;
});
test("PATCH /api/borrowings/:id/return return a book", async () => {
  const reponse = await request(app)
    .patch(`/api/borrowings/57/return`)
    .set("Authorization", `Bearer ${authTokin}`);
  expect(reponse.statusCode).toBe(404);
});
test("POST /api/borrowings create a borrow order", async () => {
  const response = await request(app)
    .post("/api/borrowings")
    .set("Authorization", `Bearer ${authTokin}`)
    .send({ book_id: `${createdID}` });
  console.log(response.body);
  expect(response.statusCode).toBe(201);
  borrowid = response.body.id;
});
test("POST /api/borrowings try to borrow an unexicting book", async () => {
  const response = await request(app)
    .post("/api/borrowings")
    .set("Authorization", `Bearer ${authTokin}`)
    .send({ book_id: `${1}` });
  expect(response.statusCode).toBe(404);
});
test("POST /api/borrowings create a borrow order that is pending", async () => {
  const response = await request(app)
    .post("/api/borrowings")
    .set("Authorization", `Bearer ${authTokin}`)
    .send({ book_id: `${createdID}` });
  pending = response.body.id;
  expect(response.body.status).toBe("pending");
  expect(response.statusCode).toBe(201);
});
test("GET /api/borrowings/:id get a borrowing record", async () => {
  const response = await request(app).get(`/api/borrowings/${borrowid}`);
  expect(response.body.status).toBe("borrowed");
  expect(response.statusCode).toBe(200);
});
test("GET /api/borrowings/:id get a borrowing record with a non exsithing id", async () => {
  const response = await request(app).get(`/api/borrowings/-1`);
  expect(response.statusCode).toBe(404);
});
test("PATCH /api/borrowings/:id/return return a book", async () => {
  const reponse = await request(app)
    .patch(`/api/borrowings/${borrowid}/return`)
    .set("Authorization", `Bearer ${authTokin}`);
  expect(reponse.body.status).toBe("returned");
  expect(reponse.statusCode).toBe(200);
});
test("PATCH /api/borrowings/:id/return with no pending request", async () => {
  const returnpend = await request(app).patch(
    `/api/borrowings/${pending}/return`,
  ).set('Authorization', `Bearer ${authTokin}`);
  const borrow = await request(app)
    .post("/api/borrowings")
    .set("Authorization", `Bearer ${authTokin}`)
    .send({ book_id: `${createdID}` });

  const response = await request(app)
    .patch(`/api/borrowings/${borrow.body.id}/return`)
    .set("Authorization", `Bearer ${authTokin}`);
  expect(returnpend.statusCode).toBe(200);
  expect(borrow.statusCode).toBe(201);
  expect(response.statusCode).toBe(200);
});
