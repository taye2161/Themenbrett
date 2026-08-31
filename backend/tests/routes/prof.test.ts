import { app } from "../../src/app";
import { createProf, getAlleProfs } from "../../src/services/ProfService";
import * as ProfService from "../../src/services/ProfService";
import supertest from "supertest";
import { supertestWithAuth, performAuthentication } from "../supertestWithAuth";

beforeAll(async () => {
    await createProf({name: "Admin", campusID: "admin", password: "xyzXYZ123!§xxx", admin: true })
    await performAuthentication("admin", "xyzXYZ123!§xxx");
});

test("POST, einfacher Positivtest", async () => {
    // arrange:
    // nichts zu tun
    
    // act:
    const testee = supertestWithAuth(app);
    const response = await testee.post("/api/prof")
        .send({
            name: "Mein Prof",
            campusID: "MP",
            password: "abcABC123!§",
            admin: false
        });
 
    // assert:
    // Prüfe Response    
    expect(response.status).toBe(201);
    expect(response.body.name).toBe("Mein Prof");
    expect(response.body.campusID).toBe("MP");
    expect(response.body.admin).toBe(false);
    expect(response.body.password).toBeUndefined();
    expect(response.body.id).toBeDefined();
    // Prüfe Datenbank
    const profs = await getAlleProfs();
    // Sie können folgende Zeile für eigene Tests übernehmen, jedoch
    // müssen Sie dann zwingend erklären können, was some bedeutet, wo es definiert wird
    // und was die Argumente sind.
    expect(profs.some(p => p.id === response.body.id)).toBe(true);    
})

test("PUT, einfacher Positivtest", async () => {
    // arrange:
    const profRes = await createProf({
        name: "Mein Prof",
        campusID: "MP",
        password: "abcABC123!§",
        admin: false
    });

    // act:
    const testee = supertestWithAuth(app);
    const response = await testee.put(`/api/prof/${profRes.id}`)
        .send({
            id: profRes.id,
            name: "Anderer Prof",
            campusID: "AP",
            admin: false
        });

    // assert:
    // Prüfe Response
    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Anderer Prof");
    expect(response.body.campusID).toBe("AP");
    expect(response.body.admin).toBe(false);
    expect(response.body.password).toBeUndefined();
    expect(response.body.id).toBe(profRes.id);
    // Prüfe Datenbank
    const profs = await getAlleProfs();
    // Prüfe Datenbank
    // Sie können folgende Zeile für eigene Tests übernehmen, jedoch
    // müssen Sie dann zwingend erklären können, was some bedeutet, wo es definiert wird
    // und was die Argumente sind.
    expect(profs.some(p => p.id === response.body.id && p.name === "Anderer Prof")).toBe(true);
})

test("DELETE, einfacher Positivtest", async () => {
    // arrange:
    const profRes = await createProf({
        name: "Mein Prof",
        campusID: "MP",
        password: "abcABC123!§",
        admin: false
    });

    // act:
    const testee = supertestWithAuth(app);
    const response = await testee.delete(`/api/prof/${profRes.id}`).send();

    // assert:
    // Prüfe Response
    expect(response.status).toBe(204);
    // Prüfe Datenbank
    expect((await getAlleProfs())
        .every(p => p.id !== profRes.id)
    ).toBe(true);
})

// Test für GET /api/prof/alle können selbst geschrieben werden.

test("GET, einfacher Positivtest", async() => {

    const prof1 = await createProf({
        name: "Max Mustermann",
        titel: "Prof. Dr.",
        campusID: "mmu123",
        password: "securepassword1",
        admin: false
    });

    const prof2 = await createProf({
        name: "Erika Mustermann",
        titel: "Prof. Dr. rer. nat.",
        campusID: "emu456",
        password: "securepassword2",
        admin: true
    });

    const testee = supertestWithAuth(app);
    const response = await testee.get('/api/prof/alle');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);

    expect(response.body[0].name).toBe("Max Mustermann");
    expect(response.body[0].campusID).toBe("mmu123");

    expect(response.body[0].password).toBeUndefined();
    expect(response.body[1].password).toBeUndefined();

    expect(response.body[0].id).toBe(prof1.id);
    expect(response.body[1].id).toBe(prof2.id);
});

test("GET /api/prof, sollte 405 zurueckgeben", async () => {
    const testee = supertest(app);
    const response = await testee.get("/api/prof");

    expect(response.status).toBe(405);
    expect(response.headers.allow).toBeDefined();
});

test("GET /api/prof/:id, sollte 405 zurueckgeben", async () => {
    const prof = await createProf({
        name: "Test Prof",
        campusID: "test123",
        password: "password123",
        admin: false
    });

    const testee = supertestWithAuth(app);
    const response = await testee.get(`/api/prof/${prof.id}`);

    expect(response.status).toBe(405);
    expect(response.headers.allow).toBeDefined();
});

test("PUT /api/prof/alle, sollte 405 zurueckgeben", async () => {
    const testee = supertestWithAuth(app);
    const response = await testee.put("/api/prof/alle")
        .send({
            id: "alle",
            name: "Illegal",
            campusID: "ill",
            admin: false
        });

    expect(response.status).toBe(405);
    expect(response.headers.allow).toBeDefined();
});

test("PUT /api/prof/:id mit mismatched ID, sollte 400 zurueckgeben", async () => {
    const prof = await createProf({
        name: "Test Prof",
        campusID: "test456",
        password: "password123",
        admin: false
    });

    const testee = supertest(app);
    const response = await testee.put(`/api/prof/${prof.id}`)
        .send({
            id: "507f1f77bcf86cd799439011",
            name: "Mismatched",
            campusID: "mismatch",
            admin: false
        });

    expect(response.status).toBe(400);
});

test("PUT /api/prof/:id/password, einfacher Positivtest", async () => {
    const prof = await createProf({
        name: "Test Prof",
        campusID: "test789",
        password: "oldPassword123!",
        admin: false
    });

    const testee = supertestWithAuth(app);
    const response = await testee.put(`/api/prof/${prof.id}/password`)
        .send({
            id: prof.id,
            oldPassword: "oldPassword123!",
            newPassword: "newPassword456!"
        });

    expect(response.status).toBe(200);
    expect(response.body.password).toBeUndefined();
});

test("PUT /api/prof/:id/password, Fehler bei falscher ID", async () => {
    const testee = supertestWithAuth(app);
    const response = await testee.put("/api/prof/507f1f77bcf86cd799439011/password")
        .send({
            id: "507f1f77bcf86cd799439011",
            oldPassword: "anyPassword",
            newPassword: "newPassword456!"
        });

    expect(response.status).toBe(400);
});

test("DELETE /api/prof/alle, sollte 405 zurueckgeben", async () => {
    const testee = supertestWithAuth(app);
    const response = await testee.delete("/api/prof/alle");

    expect(response.status).toBe(405);
    expect(response.headers.allow).toBeDefined();
});

test("DELETE /api/prof/:id, Fehler wenn nicht gefunden", async () => {
    const testee = supertestWithAuth(app);
    const response = await testee.delete("/api/prof/507f1f77bcf86cd799439011");

    expect(response.status).toBe(404);
});

test("POST, Fehler wenn createProf schlaegt fehl", async () => {
    jest.spyOn(ProfService, "createProf").mockRejectedValue(new Error("DB Error"));

    const testee = supertestWithAuth(app);
    const response = await testee.post("/api/prof")
        .send({
            name: "Fehler Prof",
            campusID: "err",
            password: "password",
            admin: false
        });

    expect(response.status).toBe(400);
});

test("PUT, Fehler wenn updateProf schlaegt fehl", async () => {
    const prof = await createProf({
        name: "Test Prof",
        campusID: "test_put_err",
        password: "password",
        admin: false
    });

    jest.spyOn(ProfService, "updateProf").mockRejectedValue(new Error("DB Error"));

    const testee = supertestWithAuth(app);
    const response = await testee.put(`/api/prof/${prof.id}`)
        .send({
            id: prof.id,
            name: "Updated Prof",
            campusID: "updated",
            admin: false
        });

    expect(response.status).toBe(400);
});

afterEach(() => {
    jest.restoreAllMocks();
});

test("POST, 401 Fehler wenn nicht authentifiziert", async () => {
    const testee = supertest(app); 
    const response = await testee.post("/api/prof").send({ name: "Gast", campusID: "G", password: "123", admin: false });
    expect(response.status).toBe(401);
});

test("DELETE, 401 Fehler wenn nicht authentifiziert", async () => {
    const testee = supertest(app); 
    const response = await testee.delete("/api/prof/507f1f77bcf86cd799439011");
    expect(response.status).toBe(401);
});

