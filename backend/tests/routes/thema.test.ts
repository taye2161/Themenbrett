import { app } from "../../src/app";
import supertest from "supertest";
import * as ThemaService from "../../src/services/ThemaService";
import { createProf } from "../../src/services/ProfService";
import { createGebiet } from "../../src/services/GebietService";
import { createThema, getThema } from "../../src/services/ThemaService";
import { ProfResource, GebietResource } from "../../src/Resources";
import { supertestWithAuth, performAuthentication } from "../supertestWithAuth";

let betreuer: ProfResource;
let gebiet: GebietResource;

beforeAll(async () => {
        await createProf({
            name: "Test Betreuer",
            campusID: "betreuer01",
            password: "xyzXYZ123!§xxx",
            admin: false
        });

        await performAuthentication("betreuer01", "xyzXYZ123!§xxx");
    });

beforeEach(async () => {
    betreuer = await createProf({
        name: "Test Betreuer",
        campusID: "betreuer_fresh", 
        password: "xyzXYZ123!§xxx",
        admin: true
    });

    gebiet = await createGebiet({
        name: "Web 3",
        verwalter: betreuer.id!,
        public: true
    });
});




test("POST, einfacher Positivtest zum Erstellen eines Themas", async () => {
    const testee = supertestWithAuth(app);
    const response = await testee.post("/api/thema")
        .send({
            titel: "Graphen",
            beschreibung: "Algorithmische Graphentheorie",
            gebiet: gebiet.id,
            betreuer: betreuer.id!
        });

    expect(response.status).toBe(201);
    expect(response.body.titel).toBe("Graphen");
    expect(response.body.beschreibung).toBe("Algorithmische Graphentheorie");
    expect(response.body.gebiet).toBe(gebiet.id);
    expect(response.body.id).toBeDefined();
});

test("GET, einfacher Positivtest zum Abrufen eines Themas", async () => {
    const thema = await createThema({
        titel: "Suchalgorithmen",
        beschreibung: "Breitensuche und Tiefensuche",
        gebiet: gebiet.id!,
        betreuer: betreuer.id!
    });

    const testee = supertestWithAuth(app);
    const response = await testee.get(`/api/thema/${thema.id}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(thema.id);
    expect(response.body.titel).toBe("Suchalgorithmen");
    expect(response.body.beschreibung).toBe("Breitensuche und Tiefensuche");
    expect(response.body.gebiet).toBe(gebiet.id);
});

test("PUT, einfacher Positivtest zum Aktualisieren eines Themas", async () => {
    const thema = await createThema({
        titel: "Datenbanken",
        beschreibung: "Relationale Datenbanken",
        gebiet: gebiet.id!,
        betreuer: betreuer.id!
    });

    await performAuthentication("betreuer_fresh", "xyzXYZ123!§xxx");

    const testee = supertestWithAuth(app);
    const response = await testee.put(`/api/thema/${thema.id}`)
        .send({
            titel: "Datenbanksysteme",
            beschreibung: "Relationale und NoSQL-Datenbanken",
            literatur: "Datenbanken verstehen",
            gebiet: gebiet.id,
            betreuer: betreuer.id!
        });

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(thema.id);
    expect(response.body.titel).toBe("Datenbanksysteme");
    expect(response.body.beschreibung).toBe("Relationale und NoSQL-Datenbanken");
});

test("DELETE, einfacher Positivtest zum Löschen eines Themas", async () => {
    const thema = await createThema({
        titel: "Compilerbau",
        beschreibung: "Lexer und Parser",
        gebiet: gebiet.id!,
        betreuer: betreuer.id!
    });

    await performAuthentication("betreuer_fresh", "xyzXYZ123!§xxx");

    const testee = supertestWithAuth(app);
    const response = await testee.delete(`/api/thema/${thema.id}`);

    expect(response.status).toBe(204);
    await expect(getThema(thema.id!)).rejects.toThrow();
});

test("POST, Fehler wenn das Gebiet nicht existiert", async () => {
    const testee = supertestWithAuth(app);
    const response = await testee.post("/api/thema")
        .send({
            titel: "Nichtexistent",
            beschreibung: "Fehlerhafter Bereich",
            gebiet: "000000000000000000000000",
            betreuer: betreuer.id!
        });

    expect(response.status).toBe(400);
});

test("GET, Fehlerhafte ID liefert 400", async () => {
    const testee = supertestWithAuth(app);
    const response = await testee.get("/api/thema/invalid-id");

    expect(response.status).toBe(400);
});

test("PUT, Fehler wenn Thema nicht existiert", async () => {
    const testee = supertestWithAuth(app);
    const response = await testee.put("/api/thema/000000000000000000000000")
        .send({
            titel: "Irrelevant",
            beschreibung: "Kein Thema vorhanden",
            gebiet: gebiet.id,
            betreuer: betreuer.id!
        });

    expect(response.status).toBe(400);
});

test("DELETE, Fehler wenn Thema nicht existiert", async () => {
    const testee = supertestWithAuth(app);
    const response = await testee.delete("/api/thema/000000000000000000000000");

    expect(response.status).toBe(400);
});
 
test("GET, 404 wenn getThema null zurückgibt", async () => {
    jest.spyOn(ThemaService, "getThema").mockResolvedValue(null as any);

    const testee = supertest(app);
    const response = await testee.get("/api/thema/507f1f77bcf86cd799439011");

    expect(response.status).toBe(404);
});

test("PUT, 404 wenn getThema null zurückgibt", async () => {
    jest.spyOn(ThemaService, "getThema").mockResolvedValue(null as any);

    const testee = supertestWithAuth(app);
    const response = await testee.put("/api/thema/507f1f77bcf86cd799439011")
        .send({
            titel: "Irrelevant",
            beschreibung: "Kein Thema vorhanden",
            gebiet: gebiet.id,
            betreuer: betreuer.id!
        });

    expect(response.status).toBe(404);
});

test("DELETE, 404 wenn getThema null zurückgibt", async () => {
    jest.spyOn(ThemaService, "getThema").mockResolvedValue(null as any);

    const testee = supertestWithAuth(app);
    const response = await testee.delete("/api/thema/507f1f77bcf86cd799439011");

    expect(response.status).toBe(404);
});

test("POST, 400 Fehler bei fehlenden Pflichtfeldern (Validierung)", async () => {
    const testee = supertestWithAuth(app); // Eingeloggt sind wir...
    
    const response = await testee.post("/api/thema")
        .send({
            gebiet: gebiet.id,
            betreuer: betreuer.id!
        });

    expect(response.status).toBe(400);
});