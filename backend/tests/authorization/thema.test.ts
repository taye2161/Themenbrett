import { app } from "../../src/app";
import supertest from "supertest";
import { createThema } from "../../src/services/ThemaService";
import { createGebiet } from "../../src/services/GebietService";
import { createProf } from "../../src/services/ProfService";
import { supertestWithAuth, performAuthentication } from "../supertestWithAuth";

const adminCredentials = { campusID: "admin01", password: "adminPassword123!" };
const userCredentials = { campusID: "user01", password: "userPassword123!" };
const otherCredentials = { campusID: "other01", password: "otherPassword123!" };

let adminProf: any;
let normalProf: any;
let otherProf: any;
let publicGebiet: any;
let privateGebiet: any;

beforeEach(async () => {
    adminProf = await createProf({
        name: "Admin Benutzer",
        campusID: adminCredentials.campusID,
        password: adminCredentials.password,
        admin: true
    });

    normalProf = await createProf({
        name: "Normaler Benutzer",
        campusID: userCredentials.campusID,
        password: userCredentials.password,
        admin: false
    });

    otherProf = await createProf({
        name: "Anderer Benutzer",
        campusID: otherCredentials.campusID,
        password: otherCredentials.password,
        admin: false
    });

    publicGebiet = await createGebiet({
        name: "Öffentliches Gebiet",
        verwalter: adminProf.id,
        public: true
    });

    privateGebiet = await createGebiet({
        name: "Privates Gebiet",
        verwalter: adminProf.id,
        public: false
    });
});

test("POST /api/thema gibt 401 zurück, wenn nicht authentifiziert", async () => {
    const response = await supertest(app)
        .post('/api/thema/')
        .send({
            titel: "Neues Thema",
            beschreibung: "Beschreibung",
            gebiet: publicGebiet.id,
            betreuer: normalProf.id
        });

    expect(response.status).toBe(401);
});

test("POST /api/thema gibt 403 zurück, wenn ein anderes privates Gebiet genutzt wird", async () => {
    await performAuthentication(userCredentials.campusID, userCredentials.password);
    const testee = supertestWithAuth(app);

    const response = await testee
        .post('/api/thema/')
        .send({
            titel: "Privates Thema",
            beschreibung: "Nicht erlaubt",
            gebiet: privateGebiet.id,
            betreuer: normalProf.id
        });

    expect(response.status).toBe(403);
});

test("POST /api/thema erlaubt einen normalen Benutzer für öffentliches Gebiet", async () => {
    await performAuthentication(userCredentials.campusID, userCredentials.password);
    const testee = supertestWithAuth(app);

    const response = await testee
        .post('/api/thema/')
        .send({
            titel: "Offenes Thema",
            beschreibung: "Beschreibung",
            gebiet: publicGebiet.id,
            betreuer: normalProf.id
        });

    expect(response.status).toBe(201);
    expect(response.body.titel).toBe("Offenes Thema");
    expect(response.body.betreuer).toBe(normalProf.id);
});

test("GET /api/thema/:id gibt 403 zurück, wenn ein privates Thema von einem Fremden abgefragt wird", async () => {
    await performAuthentication(adminCredentials.campusID, adminCredentials.password);
    const thema = await createThema({
        titel: "Privates Admin Thema",
        beschreibung: "Nur Verwalter/Betreuer",
        gebiet: privateGebiet.id,
        betreuer: adminProf.id
    });

    await performAuthentication(otherCredentials.campusID, otherCredentials.password);
    const testee = supertestWithAuth(app);

    const response = await testee.get(`/api/thema/${thema.id}`);

    expect(response.status).toBe(403);
});

test("GET /api/thema/:id erlaubt dem Betreuer privaten Zugriff", async () => {
    await performAuthentication(adminCredentials.campusID, adminCredentials.password);
    const thema = await createThema({
        titel: "Betreuer Thema",
        beschreibung: "Betreuer Zugriff",
        gebiet: privateGebiet.id,
        betreuer: adminProf.id
    });

    const testee = supertestWithAuth(app);
    const response = await testee.get(`/api/thema/${thema.id}`);

    expect(response.status).toBe(200);
    expect(response.body.titel).toBe("Betreuer Thema");
});

test("GET /api/thema/:id erlaubt dem Verwalter privaten Zugriff", async () => {
    await performAuthentication(adminCredentials.campusID, adminCredentials.password);
    const thema = await createThema({
        titel: "Verwalter Thema",
        beschreibung: "Verwalter Zugriff",
        gebiet: privateGebiet.id,
        betreuer: adminProf.id
    });

    const response = await supertestWithAuth(app).get(`/api/thema/${thema.id}`);

    expect(response.status).toBe(200);
});

test("PUT /api/thema/:id gibt 403 zurück, wenn weder Betreuer noch Verwalter sind", async () => {
    await performAuthentication(adminCredentials.campusID, adminCredentials.password);
    const thema = await createThema({
        titel: "Nicht änderbares Thema",
        beschreibung: "Nur bestimmte Benutzer",
        gebiet: privateGebiet.id,
        betreuer: adminProf.id
    });

    await performAuthentication(otherCredentials.campusID, otherCredentials.password);
    const testee = supertestWithAuth(app);

    const response = await testee.put(`/api/thema/${thema.id}`)
        .send({
            id: thema.id,
            titel: "Unerlaubte Änderung"
        });

    expect(response.status).toBe(403);
});

test("DELETE /api/thema/:id gibt 403 zurück, wenn weder Betreuer noch Verwalter sind", async () => {
    await performAuthentication(adminCredentials.campusID, adminCredentials.password);
    const thema = await createThema({
        titel: "Nicht löschbares Thema",
        beschreibung: "Nur bestimmte Benutzer",
        gebiet: privateGebiet.id,
        betreuer: adminProf.id
    });

    await performAuthentication(otherCredentials.campusID, otherCredentials.password);
    const testee = supertestWithAuth(app);

    const response = await testee.delete(`/api/thema/${thema.id}`);

    expect(response.status).toBe(403);
});

test("DELETE /api/thema/:id erlaubt dem Betreuer das Thema zu löschen", async () => {
    await performAuthentication(adminCredentials.campusID, adminCredentials.password);
    const thema = await createThema({
        titel: "Löschbares Thema",
        beschreibung: "Betreuer darf löschen",
        gebiet: privateGebiet.id,
        betreuer: adminProf.id
    });

    const response = await supertestWithAuth(app).delete(`/api/thema/${thema.id}`);

    expect(response.status).toBe(204);
});