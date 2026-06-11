import { Thema } from "../../src/model/ThemaModel";
import { Prof } from "../../src/model/ProfModel";
import { Gebiet } from "../../src/model/GebietModel";
import { Types } from "mongoose";

let profId: Types.ObjectId;
let gebietId: Types.ObjectId;

beforeAll( async () => {
    
    const prof = await Prof.create({
        name: "Mustermann",
        campusID: "admin01",
        password: "1234",
        admin: true
    });

    profId = prof._id as Types.ObjectId;

    const gebiet = await Gebiet.create({
        name: "Software Engineering",
        verwalter: profId
    });

    gebietId = gebiet._id as Types.ObjectId;

    await Thema.init();
});

test("richtige default values", async () => {
    const thema = await Thema.create({
        titel: "MERN Stack",
        beschreibung: "Entwicklung von Client-Server Programmen mit der MERN Stack",
        gebiet: gebietId,
        betreuer: profId
    });

    expect(thema.abschluss).toBe("any");
    expect(thema.status).toBe("offen");
});

test("fehler wenn eine oder mehrere required properties fehlen", async () => {
    const thema1 = new Thema({
        titel: "MERN Stack",
        gebiet: gebietId,
        betreuer: profId
    });

    const thema2 = new Thema({
        gebiet: gebietId,
        betreuer: profId
    });

    await expect(thema1.save()).rejects.toThrow();
    await expect(thema2.save()).rejects.toThrow();
});

test("fehler bei ungueltigen IDs", async () => {
    const thema1 = new Thema({
        titel: "MERN Stack",
        beschreibung: "Entwicklung von Client-Server Programmen mit der MERN Stack",
        gebiet: "ungueltig",
        betreuer: profId
    });

    const thema2 = new Thema({
        titel: "MEAN Stack",
        beschreibung: "Entwicklung von Client-Server Programmen mit der MEAN Stack",
        gebiet: "ungueltig",
        betreuer: "ungueltig"
    });

    await expect(thema1.save()).rejects.toThrow();
    await expect(thema2.save()).rejects.toThrow();
});

test("updatedAt soll bei Aenderung aktualisiert werden", async () => {
    const thema = await Thema.create({
        titel: "MERN Stack",
        beschreibung: "Entwicklung von Client-Server Programmen mit der MERN Stack",
        gebiet: gebietId,
        betreuer: profId
    });

    const erstesUpdate = thema.updatedAt;

    await new Promise(resolve => setTimeout(resolve, 100));

    thema.titel = "geaenderter Titel";
    await thema.save();

    const zweitesUpdate = thema.updatedAt;

    expect(zweitesUpdate.getTime()).toBeGreaterThan(erstesUpdate.getTime());
});