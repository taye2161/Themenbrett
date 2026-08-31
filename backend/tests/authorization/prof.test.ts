import { app } from "../../src/app";
import { createProf, getAlleProfs } from "../../src/services/ProfService";
import * as ProfService from "../../src/services/ProfService";
import supertest from "supertest";
import { supertestWithAuth, performAuthentication } from "../supertestWithAuth";

const adminCredentials = { campusID: "admin01", password: "adminPassword123!" };
const userCredentials = { campusID: "prof01", password: "profPassword123!" };
const otherCredentials = { campusID: "other01", password: "otherPassword123!" };

let adminProf: any;
let normalProf: any;
let otherProf: any;

beforeEach(async () => {
    adminProf = await createProf({
        name: "Herr Admin",
        campusID: adminCredentials.campusID,
        password: adminCredentials.password,
        admin: true
    });

    normalProf = await createProf({
        name: "Normaler Prof",
        campusID: userCredentials.campusID,
        password: userCredentials.password,
        admin: false
    });

    otherProf = await createProf({
        name: "Anderer Prof",
        campusID: otherCredentials.campusID,
        password: otherCredentials.password,
        admin: false
    });
});

test("POST /api/prof, Admin darf einen neuen Prof erstellen", async () => {
    await performAuthentication(adminCredentials.campusID, adminCredentials.password);
    const testee = supertestWithAuth(app);

    const response = await testee.post("/api/prof")
        .send({
            name: "Neuer Kollege",
            campusID: "NK1",
            password: "safePassword123!",
            admin: false
        });

    expect(response.status).toBe(201);
});

test("POST /api/prof, Normaler Prof wird mit 403 abgewiesen", async () => {
    await performAuthentication(userCredentials.campusID, userCredentials.password);
    const testee = supertestWithAuth(app);

    const response = await testee.post("/api/prof")
        .send({
            name: "Illegaler Kollege",
            campusID: "IK1",
            password: "safePassword123!",
            admin: false
        });

    expect(response.status).toBe(403);
});

test("GET /api/prof/alle, Admin darf alle Profs abrufen", async () => {
    await performAuthentication(adminCredentials.campusID, adminCredentials.password);
    const testee = supertestWithAuth(app);

    const response = await testee.get("/api/prof/alle");
    expect(response.status).toBe(200); 
});

test("GET /api/prof/alle, Normaler Prof erhält 403 beim Abruf aller Profs", async () => {
    await performAuthentication(userCredentials.campusID, userCredentials.password);
    const testee = supertestWithAuth(app);

    const response = await testee.get("/api/prof/alle");
    expect(response.status).toBe(403); 
});

test("PUT /api/prof/:id/password, Normaler Prof darf nicht das Passwort eines anderen ändern", async () => {
    const prof = await createProf({
        name: "Prof",
        campusID: "prof05",
        password: "geheim123!",
        admin: false
    });

    await performAuthentication(userCredentials.campusID, userCredentials.password);
    const testee = supertestWithAuth(app);

    const response = await testee.put(`/api/prof/${prof.id}/password`)
        .send({
            id: prof.id,
            oldPassword: "geheim123!",
            newPassword: "geknackt123!"
        });

    expect(response.status).toBe(403); 
});

test("PUT /api/prof/:id/, Normaler Prof darf nicht einen anderen Prof ändern", async () => {
    const prof = await createProf({
        name: "Prof",
        campusID: "prof06",
        password: "geheim123!",
        admin: false
    });

    await performAuthentication(userCredentials.campusID, userCredentials.password);
    const testee = supertestWithAuth(app);

    const response = await testee.put(`/api/prof/${prof.id}`)
        .send({
            id: prof.id,
            oldPassword: "geheim123!",
            newPassword: "geknackt123!"
        });

    expect(response.status).toBe(403); 
});

test("DELETE /api/prof/:id/, Normaler Prof darf nicht einen anderen Prof löschen", async () => {
    const prof = await createProf({
        name: "Prof",
        campusID: "prof07",
        password: "geheim123!",
        admin: false
    });

    await performAuthentication(userCredentials.campusID, userCredentials.password);
    const testee = supertestWithAuth(app);

    const response = await testee.delete(`/api/prof/${prof.id}`)
        .send({
            id: prof.id,
            oldPassword: "geheim123!",
            newPassword: "geknackt123!"
        });

    expect(response.status).toBe(403); 
});

test("PUT /api/prof/:id/password, Benutzer darf sein eigenes Passwort erfolgreich ändern", async () => {
    await performAuthentication(userCredentials.campusID, userCredentials.password);
    const testee = supertestWithAuth(app);

    const response = await testee.put(`/api/prof/${normalProf.id}/password`)
        .send({
            id: normalProf.id,
            oldPassword: userCredentials.password,
            newPassword: "meinNeuesSuperPasswort123!"
        });

    expect(response.status).toBe(200);
    expect(response.body.password).toBeUndefined();
});

test("PUT /api/prof/:id/password, Benutzer wird mit 403 abgelehnt, wenn er ein fremdes Passwort ändern will", async () => {
    await performAuthentication(otherCredentials.campusID, otherCredentials.password);
    const testee = supertestWithAuth(app);

    const response = await testee.put(`/api/prof/${normalProf.id}/password`)
        .send({
            id: normalProf.id,
            oldPassword: "egal",
            newPassword: "hackedPassword123!"
        });

    expect(response.status).toBe(403); 
});

test("PUT /api/prof/:id/password, liefert 400, wenn das alte Passwort falsch eingegeben wurde", async () => {
    await performAuthentication(userCredentials.campusID, userCredentials.password);
    const testee = supertestWithAuth(app);

    const response = await testee.put(`/api/prof/${normalProf.id}/password`)
        .send({
            id: normalProf.id,
            oldPassword: "falsches-passwort",
            newPassword: "neuesPasswort123!"
        });

    expect(response.status).toBe(400); 
});
