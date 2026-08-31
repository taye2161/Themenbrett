import { app } from "../../src/app";
import { createProf } from "../../src/services/ProfService";
import { createGebiet } from "../../src/services/GebietService";
import { ProfResource, GebietResource } from "../../src/Resources";
import "restmatcher";
import supertest from "supertest";

let betreuer: ProfResource;
let gebiet: GebietResource;

beforeEach(async () => {
    betreuer = await createProf({
        name: "Test Prof",
        campusID: "TP123",
        password: "abcABC123!§",
        admin: false
    });

    gebiet = await createGebiet({
        name: "Test Gebiet",
        verwalter: betreuer.id!,
        public: true
    });
});

test("POST, fehlender Titel", async () => {
    const testee = supertest(app);
    const response = await testee.post("/api/thema").send({
        beschreibung: "Beschreibung",
        gebiet: gebiet.id,
        betreuer: betreuer.id!
    });

    expect(response).toHaveValidationErrorsExactly({
        status: "400",
        body: "titel"
    });
});

test("POST, fehlende Beschreibung", async () => {
    const testee = supertest(app);
    const response = await testee.post("/api/thema").send({
        titel: "Graphen",
        gebiet: gebiet.id,
        betreuer: betreuer.id!
    });

    expect(response).toHaveValidationErrorsExactly({
        status: "400",
        body: "beschreibung"
    });
});

test("POST, ungültige Gebiets-ID", async () => {
    const testee = supertest(app);
    const response = await testee.post("/api/thema").send({
        titel: "Graphen",
        beschreibung: "Beschreibung",
        gebiet: "invalid-id",
        betreuer: betreuer.id!
    });

    expect(response).toHaveValidationErrorsExactly({
        status: "400",
        body: "gebiet"
    });
});

test("POST, ungültige Betreuer-ID", async () => {
    const testee = supertest(app);
    const response = await testee.post("/api/thema").send({
        titel: "Graphen",
        beschreibung: "Beschreibung",
        gebiet: gebiet.id,
        betreuer: "invalid-id"
    });

    expect(response).toHaveValidationErrorsExactly({
        status: "400",
        body: "betreuer"
    });
});

test("GET, fehlerhafte ID liefert Validation-Fehler", async () => {
    const testee = supertest(app);
    const response = await testee.get("/api/thema/invalid-id");

    expect(response).toHaveValidationErrorsExactly({
        status: "400",
        params: "id"
    });
});

test("PUT, fehlende ID im Body oder falsche URL-Id", async () => {
    const testee = supertest(app);
    const response = await testee.put("/api/thema/507f1f77bcf86cd799439011").send({
        id: "507f1f77bcf86cd799439012",
        titel: "Graphen",
        beschreibung: "Beschreibung",
        gebiet: gebiet.id,
        betreuer: betreuer.id!
    });

    expect(response).toHaveValidationErrorsExactly({
        status: "400",
        body: "id"
    });
});

test("DELETE, fehlerhafte ID liefert Validation-Fehler", async () => {
    const testee = supertest(app);
    const response = await testee.delete("/api/thema/invalid-id").send();

    expect(response).toHaveValidationErrorsExactly({
        status: "400",
        params: "id"
    });
});
