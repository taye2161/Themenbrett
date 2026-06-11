import { app } from "../../src/app";
import supertest from "supertest";
import * as GebietService from "../../src/services/GebietService";
import * as ThemaService from "../../src/services/ThemaService";
import { createGebiet, getAlleGebiete, getGebiet } from "../../src/services/GebietService";
import { createProf } from "../../src/services/ProfService";
import { GebietResource, ProfResource } from "../../src/Resources";
import { createThema } from "../../src/services/ThemaService";
import { supertestWithAuth, performAuthentication } from "../supertestWithAuth";

let prof1: ProfResource;
let gebiet1: GebietResource;
let gebiet2: GebietResource;

beforeAll(async() => {
    prof1 = await createProf({
        name: "Sven Graupner",
        campusID: "sgra",
        password: "password",
        admin: true
    });

    gebiet1 = await createGebiet({
        name: "Web 1",
        verwalter: prof1.id!,
        public: true
    });

    gebiet2 = await createGebiet({
        name: "Web 2",
        verwalter: prof1.id!,
        public: true
    });

    await performAuthentication("sgra", "password");
});

test("GET, einfacher Positivtest zum Zugreifen auf alle Objekte", async() => {

    const testee = supertest(app);
    const response = await testee.get('/api/gebiet/alle');

    expect(response.statusCode).toBe(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(2);

    expect(response.body[0].name).toBe("Web 1");
    expect(response.body[1].name).toBe("Web 2");

    expect(response.body[0].id).toBe(gebiet1.id);
    expect(response.body[1].id).toBe(gebiet2.id);
});

test("POST, einfacher Positivtest zum erstellen von neuen Objekten", async() => {

    const testee = supertestWithAuth(app);
    const response = await testee.post('/api/gebiet/')
        .send({
            name: "Web 3",
            verwalter: prof1.id,
            public: true
        });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe("Web 3");
    expect(response.body.verwalter).toBe(prof1.id);
    expect(response.body.public).toBe(true);
});

test("GET, einfacher Positivtest zum Zugreifen auf Daten", async() => {
    const meinTestGebiet = await createGebiet({
        name: "SE 2",
        verwalter: prof1.id!, // ID aus dem beforeAll
        public: true
    });

    const testee = supertest(app);
    const response = await testee.get(`/api/gebiet/${meinTestGebiet.id}`);

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("SE 2");
    expect(response.body.verwalter).toBe(prof1.id);
    expect(response.body.public).toBe(true);
});

test("PUT, einfacher Positivtest zum aendern von Daten", async() => {
    const gebietZumUpdaten = await createGebiet({
        name: "modul 3",
        verwalter: prof1.id!,
        public: true
    });

    const geänderteDaten = {
        name: "modul 2",
        verwalter: prof1.id!,
        public: true,
    };
    
    const testee = supertestWithAuth(app);
    const response = await testee.put(`/api/gebiet/${gebietZumUpdaten.id}`)
        .send(geänderteDaten);

    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe("modul 2");
});

test("DELETE, einfacher Positivtest zum loeschen von Objekten", async() => {
    const gebietZumLoeschen = await createGebiet({
        name: "modul 4",
        verwalter: prof1.id!,
        public: true
    });

    const testee = supertestWithAuth(app);
    const response = await testee.delete(`/api/gebiet/${gebietZumLoeschen.id}`);

    expect(response.statusCode).toBe(204);
    expect(async() => { await getGebiet(gebietZumLoeschen.id!) }).rejects.toThrow()
});

test("GET, einfacher Positivtest zum Zurueckgeben aller Themen eines Gebiets", async() => {
    const lokalerProf = await createProf({
        name: "Sven Graupner",
        campusID: "sgra_test", 
        password: "password",
        admin: true
    });

    const gebietMitThemen = await createGebiet({
        name: "DSA_Einzigartig", 
        verwalter: lokalerProf.id!,
        public: true
    });

    const thema1 = await createThema({
        titel: "BFS",
        beschreibung: "Eine der kuerzeste Wege Verfahren",
        gebiet: gebietMitThemen.id!, 
        betreuer: lokalerProf.id!    
    });

    const thema2 = await createThema({
        titel: "DFS",
        beschreibung: "Eine der kuerzeste Wege Verfahren",
        gebiet: gebietMitThemen.id!, 
        betreuer: lokalerProf.id!    
    });

    const testee = supertest(app);
    const response = await testee.get(`/api/gebiet/${gebietMitThemen.id}/themen`);

    expect(response.statusCode).toBe(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);

    expect(response.body[0].titel).toBe("BFS");
    expect(response.body[1].titel).toBe("DFS");
});

afterEach(() => {
    jest.restoreAllMocks();
});

test("POST, Fehler wenn createGebiet schlaegt fehl", async() => {
    jest.spyOn(GebietService, "createGebiet").mockRejectedValue(new Error("DB Error"));

    const testee = supertestWithAuth(app);
    const response = await testee.post('/api/gebiet/')
        .send({
            name: "Fehler Gebiet",
            verwalter: prof1.id,
            public: true
        });

    expect(response.status).toBe(400);
});

test("GET /:id, 404 wenn gebiet nicht existiert", async() => {
    jest.spyOn(GebietService, "getGebiet").mockResolvedValue(null as any);

    const testee = supertest(app);
    const response = await testee.get("/api/gebiet/507f1f77bcf86cd799439011");

    expect(response.status).toBe(404);
});

test("GET /:id, 400 bei Exception", async() => {
    jest.spyOn(GebietService, "getGebiet").mockRejectedValue(new Error("DB Error"));

    const testee = supertest(app);
    const response = await testee.get("/api/gebiet/507f1f77bcf86cd799439011");

    expect(response.status).toBe(400);
});

test("PUT /:id, 404 wenn gebiet nicht existiert", async() => {
    jest.spyOn(GebietService, "getGebiet").mockResolvedValue(null as any);

    const testee = supertestWithAuth(app);
    const response = await testee.put("/api/gebiet/507f1f77bcf86cd799439011")
        .send({
            name: "Updated",
            verwalter: prof1.id,
            public: true
        });

    expect(response.status).toBe(404);
});

test("PUT /:id, 400 bei Exception", async() => {
    jest.spyOn(GebietService, "getGebiet").mockResolvedValue(null as any).mockResolvedValueOnce({
        id: "test",
        name: "Test",
        verwalter: prof1.id!,
        public: true
    } as any);

    jest.spyOn(GebietService, "updateGebiet").mockRejectedValue(new Error("DB Error"));

    const testee = supertestWithAuth(app);
    const response = await testee.put("/api/gebiet/507f1f77bcf86cd799439011")
        .send({
            name: "Updated",
            verwalter: prof1.id,
            public: true
        });

    expect(response.status).toBe(400);
});

test("DELETE /:id, 404 wenn gebiet nicht existiert", async() => {
    jest.spyOn(GebietService, "getGebiet").mockResolvedValue(null as any);

    const testee = supertestWithAuth(app);
    const response = await testee.delete("/api/gebiet/507f1f77bcf86cd799439011");

    expect(response.status).toBe(404);
});

test("DELETE /:id, 400 bei Exception", async() => {
    jest.spyOn(GebietService, "getGebiet").mockResolvedValue({
        id: "test",
        name: "Test",
        verwalter: prof1.id!,
        public: true
    } as any);

    jest.spyOn(GebietService, "deleteGebiet").mockRejectedValue(new Error("DB Error"));

    const testee = supertestWithAuth(app);
    const response = await testee.delete("/api/gebiet/507f1f77bcf86cd799439011");

    expect(response.status).toBe(400);
});

test("GET /:id/themen, 404 wenn gebiet nicht existiert", async() => {
    jest.spyOn(GebietService, "getGebiet").mockResolvedValue(null as any);

    const testee = supertest(app);
    const response = await testee.get("/api/gebiet/507f1f77bcf86cd799439011/themen");

    expect(response.status).toBe(404);
});

test("GET /:id/themen, 400 bei Exception", async() => {
    jest.spyOn(GebietService, "getGebiet").mockRejectedValue(new Error("DB Error"));

    const testee = supertest(app);
    const response = await testee.get("/api/gebiet/507f1f77bcf86cd799439011/themen");

    expect(response.status).toBe(400);
});

test("POST, 401 wenn nicht authentifiziert", async() => {
    const testee = supertest(app);
    const response = await testee.post('/api/gebiet/').send({ name: "Kein Zutritt", verwalter: prof1.id, public: true });
    expect(response.status).toBe(401);
});

test("PUT, 401 wenn nicht authentifiziert", async() => {
    const testee = supertest(app);
    const response = await testee.put(`/api/gebiet/${gebiet1.id}`).send({ name: "Hack Versuch", verwalter: prof1.id, public: true });
    expect(response.status).toBe(401);
});

test("DELETE, 401 wenn nicht authentifiziert", async() => {
    const testee = supertest(app);
    const response = await testee.delete(`/api/gebiet/${gebiet1.id}`);
    expect(response.status).toBe(401);
});
