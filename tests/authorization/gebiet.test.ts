import { app } from "../../src/app";
import supertest from "supertest";
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
        name: "Offenes Gebiet",
        verwalter: adminProf.id,
        public: true
    });

    privateGebiet = await createGebiet({
        name: "Privates Gebiet",
        verwalter: adminProf.id,
        public: false
    });
});

test("GET /api/gebiet/alle liefert nur öffentliche Gebiete ohne Authentifizierung", async () => {
    const response = await supertest(app).get("/api/gebiet/alle");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.some((gebiet: any) => gebiet.id === publicGebiet.id)).toBe(true);
    expect(response.body.some((gebiet: any) => gebiet.id === privateGebiet.id)).toBe(false);
});

test("GET /api/gebiet/alle liefert auch private Gebiete für den Verwalter", async () => {
    await performAuthentication(adminCredentials.campusID, adminCredentials.password);
    const testee = supertestWithAuth(app);

    const response = await testee.get("/api/gebiet/alle");

    expect(response.status).toBe(200);
});

test("GET /api/gebiet/:id gibt 403 zurück, wenn ein privates Gebiet von einem anderen Benutzer angefragt wird", async () => {
    await performAuthentication(otherCredentials.campusID, otherCredentials.password);
    const testee = supertestWithAuth(app);

    const response = await testee.get(`/api/gebiet/${privateGebiet.id}`);

    expect(response.status).toBe(403);
});

test("GET /api/gebiet/:id gibt 403 zurück, wenn privat und nicht authentifiziert", async () => {
    const response = await supertest(app).get(`/api/gebiet/${privateGebiet.id}`);

    expect(response.status).toBe(403);
});

test("GET /api/gebiet/:id/themen gibt 403 zurück, wenn ein privates Gebiet von einem anderen Benutzer angefragt wird", async () => {
    await performAuthentication(otherCredentials.campusID, otherCredentials.password);
    const testee = supertestWithAuth(app);

    const response = await testee.get(`/api/gebiet/${privateGebiet.id}/themen`);

    expect(response.status).toBe(403);
});

test("POST /api/gebiet gibt 401 zurück, wenn nicht authentifiziert", async () => {
    const response = await supertest(app)
        .post('/api/gebiet/')
        .send({
            name: "Nicht erlaubt",
            verwalter: adminProf.id,
            public: true
        });

    expect(response.status).toBe(401);
});

test("POST /api/gebiet gibt 403 zurück, wenn ein normaler Benutzer versucht, ein Gebiet zu erstellen", async () => {
    await performAuthentication(userCredentials.campusID, userCredentials.password);
    const testee = supertestWithAuth(app);

    const response = await testee
        .post('/api/gebiet/')
        .send({
            name: "Nicht erlaubtes Gebiet",
            verwalter: normalProf.id,
            public: true
        });

    expect(response.status).toBe(403);
});

test("POST /api/gebiet erlaubt admin Benutzern das Erstellen eines Gebiets", async () => {
    await performAuthentication(adminCredentials.campusID, adminCredentials.password);
    const testee = supertestWithAuth(app);

    const response = await testee
        .post('/api/gebiet/')
        .send({
            name: "Admin Gebiet",
            verwalter: adminProf.id,
            public: true
        });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe("Admin Gebiet");
});

test("PUT /api/gebiet/:id gibt 401 zurück, wenn nicht authentifiziert", async () => {
    const response = await supertest(app)
        .put(`/api/gebiet/${publicGebiet.id}`)
        .send({
            name: "Unerlaubtes Update",
            verwalter: adminProf.id,
            public: true
        });

    expect(response.status).toBe(401);
});

test("PUT /api/gebiet/:id gibt 403 zurück, wenn ein nicht-verwaltender Benutzer versucht, das Gebiet zu ändern", async () => {
    await performAuthentication(otherCredentials.campusID, otherCredentials.password);
    const testee = supertestWithAuth(app);

    const response = await testee
        .put(`/api/gebiet/${publicGebiet.id}`)
        .send({
            name: "Unerlaubtes Update",
            verwalter: adminProf.id,
            public: true
        });

    expect(response.status).toBe(403);
});

test("PUT /api/gebiet/:id erlaubt dem Verwalter, das Gebiet zu ändern", async () => {
    await performAuthentication(adminCredentials.campusID, adminCredentials.password);
    const testee = supertestWithAuth(app);

    const response = await testee
        .put(`/api/gebiet/${publicGebiet.id}`)
        .send({
            id: publicGebiet.id,
            name: "Geändert durch Verwalter",
            verwalter: adminProf.id,
            public: true
        });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Geändert durch Verwalter");
});

test("DELETE /api/gebiet/:id gibt 401 zurück, wenn nicht authentifiziert", async () => {
    const response = await supertest(app).delete(`/api/gebiet/${publicGebiet.id}`);

    expect(response.status).toBe(401);
});

test("DELETE /api/gebiet/:id gibt 403 zurück, wenn ein nicht-verwaltender Benutzer versucht, das Gebiet zu löschen", async () => {
    await performAuthentication(otherCredentials.campusID, otherCredentials.password);
    const testee = supertestWithAuth(app);

    const response = await testee.delete(`/api/gebiet/${publicGebiet.id}`);

    expect(response.status).toBe(403);
});

test("DELETE /api/gebiet/:id erlaubt dem Verwalter, das Gebiet zu löschen", async () => {
    const ownedGebiet = await createGebiet({
        name: "Zu löschendes Gebiet",
        verwalter: adminProf.id,
        public: true
    });

    await performAuthentication(adminCredentials.campusID, adminCredentials.password);
    const testee = supertestWithAuth(app);

    const response = await testee.delete(`/api/gebiet/${ownedGebiet.id}`);

    expect(response.status).toBe(204);
});
