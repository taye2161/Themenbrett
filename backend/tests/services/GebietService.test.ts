import { GebietResource } from "../../src/Resources";
import { createGebiet, deleteGebiet, getAlleGebiete, getGebiet, updateGebiet } from "../../src/services/GebietService";
import { Gebiet } from "../../src/model/GebietModel";
import { Prof } from "../../src/model/ProfModel";
import { Thema } from "../../src/model/ThemaModel";

const createValidProf = async (campusID = "mmu123") => {
    return Prof.create({
        name: "Max Mustermann",
        titel: "Prof. Dr.",
        campusID,
        password: "secretpassword",
        admin: false
    });
};

test("sollte nur öffentliche und eigene Gebiete zurückgeben", async () => {
    const prof1 = await createValidProf("mmu123");
    const prof2 = await createValidProf("jdoe456");

    await Gebiet.create({
        name: "Offenes Gebiet",
        beschreibung: "Ein öffentliches Gebiet",
        public: true,
        verwalter: prof2._id
    });

    await Gebiet.create({
        name: "Eigenes Gebiet",
        beschreibung: "Privates Gebiet von Prof1",
        public: false,
        verwalter: prof1._id
    });

    await Gebiet.create({
        name: "Fremdes Gebiet",
        beschreibung: "Privates Gebiet von Prof2",
        public: false,
        verwalter: prof2._id
    });

    const alleGebiete = await getAlleGebiete(prof1.id);

    expect(alleGebiete).toHaveLength(2);
    expect(alleGebiete.map((g) => g.name)).toEqual(expect.arrayContaining(["Offenes Gebiet", "Eigenes Gebiet"]));
    expect(alleGebiete).toEqual(
        expect.arrayContaining([
            expect.objectContaining({ public: true, verwalter: prof2.id }),
            expect.objectContaining({ public: false, verwalter: prof1.id })
        ])
    );
});

test("sollte nur öffentliche Gebiete zurückgeben wenn keine ProfID angegeben ist", async () => {
    const prof = await createValidProf();

    await Gebiet.create({
        name: "Öffentliches Gebiet",
        beschreibung: "Sichtbar für alle",
        public: true,
        verwalter: prof._id
    });

    await Gebiet.create({
        name: "Privates Gebiet",
        beschreibung: "Nur für den Eigentümer",
        public: false,
        verwalter: prof._id
    });

    const gebiete = await getAlleGebiete();
    expect(gebiete).toHaveLength(1);
    expect(gebiete[0].name).toBe("Öffentliches Gebiet");
});

test("sollte ein Gebiet nach ID zurückgeben", async () => {
    const prof = await createValidProf();
    const gebietDoc = await Gebiet.create({
        name: "Testgebiet",
        beschreibung: "Ein Gebiet zum Testen",
        public: false,
        closed: false,
        verwalter: prof._id
    });

    const result = await getGebiet(gebietDoc.id);

    expect(result.name).toBe("Testgebiet");
    expect(result.beschreibung).toBe("Ein Gebiet zum Testen");
    expect(result.verwalter).toBe(prof.id);
    expect(result.createdAt).toBeDefined();
});

test("sollte einen Fehler werfen wenn Gebiet nicht gefunden wird", async () => {
    const fakeId = "609276662447990000000000";
    await expect(getGebiet(fakeId)).rejects.toThrow("Gebiet wurde nicht gefunden.");
});

test("sollte ein Gebiet erstellen", async () => {
    const prof = await createValidProf();
    const payload: GebietResource = {
        name: "Neues Gebiet",
        beschreibung: "Wird über den Service erstellt",
        public: true,
        closed: true,
        verwalter: prof.id
    };

    const result = await createGebiet(payload);

    expect(result.name).toBe("Neues Gebiet");
    expect(result.public).toBe(true);
    expect(result.closed).toBe(true);
    expect(result.verwalter).toBe(prof.id);
    expect(result.createdAt).toBeDefined();

    const dbEntry = await Gebiet.findOne({ name: "Neues Gebiet" }).exec();
    expect(dbEntry).not.toBeNull();
});

test("sollte ein Gebiet aktualisieren", async () => {
    const prof = await createValidProf();
    const gebietDoc = await Gebiet.create({
        name: "Ursprüngliches Gebiet",
        beschreibung: "Vorher",
        public: false,
        closed: false,
        verwalter: prof._id
    });

    const updatePayload: GebietResource = {
        id: gebietDoc.id,
        name: "Geändertes Gebiet",
        beschreibung: "Nachher",
        public: true,
        closed: true,
        verwalter: prof.id
    };

    const result = await updateGebiet(updatePayload);

    expect(result.name).toBe("Geändertes Gebiet");
    expect(result.beschreibung).toBe("Nachher");
    expect(result.public).toBe(true);
    expect(result.closed).toBe(true);
});

test("sollte einen Fehler werfen wenn beim Aktualisieren kein Gebiet existiert", async () => {
    const fakeId = "609276662447990000000000";
    await expect(
        updateGebiet({
            id: fakeId,
            name: "Nicht vorhanden",
            beschreibung: "keine",
            public: false,
            closed: false,
            verwalter: fakeId
        })
    ).rejects.toThrow("Kein Gebiet mit der ID gefunden.");
});

test("sollte Gebiet und zugehörige Themen löschen", async () => {
    const prof = await createValidProf();
    const gebietDoc = await Gebiet.create({
        name: "Löschgebiet",
        beschreibung: "Wird gelöscht",
        public: false,
        closed: false,
        verwalter: prof._id
    });

    await Thema.create({
        titel: "Testthema",
        beschreibung: "Ein Thema für das Gebiet",
        gebiet: gebietDoc._id,
        betreuer: prof._id
    });

    await deleteGebiet(gebietDoc.id);

    const gebietCheck = await Gebiet.findById(gebietDoc.id);
    const themaCheck = await Thema.findOne({ gebiet: gebietDoc._id });

    expect(gebietCheck).toBeNull();
    expect(themaCheck).toBeNull();
});

test("sollte einen Fehler werfen wenn das Gebiet nicht existiert", async () => {
    const fakeId = "609276662447990000000000";
    await expect(deleteGebiet(fakeId)).rejects.toThrow(`No gebiet with id ${fakeId} deleted, probably id not valid`);
});
