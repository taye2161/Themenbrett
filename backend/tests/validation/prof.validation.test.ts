import { app } from "../../src/app";
import { createProf } from "../../src/services/ProfService";
import "restmatcher";
import supertest from "supertest";

test("POST, fehlende CampusID", async () => {
    const testee = supertest(app);
    const response = await testee.post("/api/prof").send({
        name: "Mein Prof",
        password: "abcABC123!§",
        admin: false
    });

    expect(response).toHaveValidationErrorsExactly({
        status: "400",
        body: "campusID"
    });
});

test("POST, ungültiges Admin-Feld", async () => {
    const testee = supertest(app);
    const response = await testee.post("/api/prof").send({
        name: "Mein Prof",
        campusID: "MP",
        admin: "notabool",
        password: "abcABC123!§"
    });

    expect(response).toHaveValidationErrorsExactly({
        status: "400",
        body: "admin"
    });
});

test("PUT, fehlende Body-ID", async () => {
    const prof = await createProf({
        name: "Mein Prof",
        campusID: "MP",
        password: "abcABC123!§",
        admin: false
    });

    const testee = supertest(app);
    const response = await testee.put(`/api/prof/${prof.id}`).send({
        name: "Mein Prof Änderung",
        campusID: "MP",
        admin: false
    });

    expect(response).toHaveValidationErrorsExactly({
        status: "400",
        body: "id"
    });
});

test("PUT, Konsistenz ID in Parameter und Body", async () => {
    const prof = await createProf({
        name: "Mein Prof",
        campusID: "MP",
        password: "abcABC123!§",
        admin: false
    });
    const andererProf = await createProf({
        name: "Anderer Prof",
        campusID: "AP",
        password: "abcABC123!§",
        admin: false
    });

    const testee = supertest(app);
    const response = await testee.put(`/api/prof/${prof.id}`).send({
        id: andererProf.id,
        name: "Mein Prof Änderung",
        campusID: "MP",
        admin: false
    });

    expect(response).toHaveValidationErrorsExactly({
        status: "400",
        body: "id",
        params: "id"
    });
});

test("PUT /password, fehlendes neues Passwort", async () => {
    const prof = await createProf({
        name: "Mein Prof",
        campusID: "MP",
        password: "abcABC123!§",
        admin: false
    });

    const testee = supertest(app);
    const response = await testee.put(`/api/prof/${prof.id}/password`).send({
        id: prof.id,
        oldPassword: "abcABC123!§"
    });

    expect(response).toHaveValidationErrorsExactly({
        status: "400",
        body: "newPassword"
    });
});

test("DELETE, keine MongoID", async () => {
    const testee = supertest(app);
    const response = await testee.delete("/api/prof/keineMongoID").send();

    expect(response).toHaveValidationErrorsExactly({
        status: "400",
        params: "id"
    });
});
