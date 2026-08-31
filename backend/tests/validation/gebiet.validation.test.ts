import { app } from "../../src/app";
import "restmatcher";
import supertest from "supertest";

test("POST, fehlender Name", async () => {
    const testee = supertest(app);
    const response = await testee.post("/api/gebiet").send({
        verwalter: "507f1f77bcf86cd799439011",
        public: true
    });

    expect(response).toHaveValidationErrorsExactly({
        status: "400",
        body: "name"
    });
});

test("POST, fehlender Verwalter", async () => {
    const testee = supertest(app);
    const response = await testee.post("/api/gebiet").send({
        name: "Test Gebiet",
        public: true
    });

    expect(response).toHaveValidationErrorsExactly({
        status: "400",
        body: "verwalter"
    });
});

test("POST, ungültige Verwalter-ID", async () => {
    const testee = supertest(app);
    const response = await testee.post("/api/gebiet").send({
        name: "Test Gebiet",
        verwalter: "invalid-id",
        public: true
    });

    expect(response).toHaveValidationErrorsExactly({
        status: "400",
        body: "verwalter"
    });
});

test("POST, ungültiges public-Feld", async () => {
    const testee = supertest(app);
    const response = await testee.post("/api/gebiet").send({
        name: "Test Gebiet",
        verwalter: "507f1f77bcf86cd799439011",
        public: "nichtbool"
    });

    expect(response).toHaveValidationErrorsExactly({
        status: "400",
        body: "public"
    });
});

test("GET /:id, fehlerhafte ID liefert Validation-Fehler", async () => {
    const testee = supertest(app);
    const response = await testee.get("/api/gebiet/invalid-id");

    expect(response).toHaveValidationErrorsExactly({
        status: "400",
        params: "id"
    });
});

test("GET /:id/themen, fehlerhafte ID liefert Validation-Fehler", async () => {
    const testee = supertest(app);
    const response = await testee.get("/api/gebiet/invalid-id/themen");

    expect(response).toHaveValidationErrorsExactly({
        status: "400",
        params: "id"
    });
});

test("PUT /:id, inkonsistente Body.id erzeugt Validierungsfehler", async () => {
    const testee = supertest(app);
    const response = await testee.put("/api/gebiet/507f1f77bcf86cd799439011").send({
        id: "507f1f77bcf86cd799439012",
        name: "Änderung",
        verwalter: "507f1f77bcf86cd799439011",
        public: true
    });

    expect(response).toHaveValidationErrorsExactly({
        status: "400",
        body: "id"
    });
});

test("DELETE /:id, fehlerhafte ID liefert Validation-Fehler", async () => {
    const testee = supertest(app);
    const response = await testee.delete("/api/gebiet/invalid-id");

    expect(response).toHaveValidationErrorsExactly({
        status: "400",
        params: "id"
    });
});
