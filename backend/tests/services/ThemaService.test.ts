import { ThemaResource } from "../../src/Resources";
import { createThema, deleteThema, getAlleThemen, getThema, updateThema } from "../../src/services/ThemaService";
import { Thema } from "../../src/model/ThemaModel";
import { Gebiet } from "../../src/model/GebietModel";
import { Prof } from "../../src/model/ProfModel";

const createValidProf = async (campusID = "mmu123") => {
    return Prof.create({
        name: "Max Mustermann",
        titel: "Prof. Dr.",
        campusID,
        password: "secretpassword",
        admin: false
    });
};

test("sollte alle Themen eines Gebietes zurückgeben", async () => {
    const prof = await createValidProf();
    const gebiet = await Gebiet.create({
        name: "Testgebiet",
        beschreibung: "Gebiet für Themen",
        public: true,
        verwalter: prof._id
    });

    await Thema.create({
        titel: "Thema 1",
        beschreibung: "Erstes Thema",
        abschluss: "bsc",
        gebiet: gebiet._id,
        betreuer: prof._id
    });

    await Thema.create({
        titel: "Thema 2",
        beschreibung: "Zweites Thema",
        abschluss: "msc",
        gebiet: gebiet._id,
        betreuer: prof._id
    });

    const themen = await getAlleThemen(gebiet.id);

    expect(themen).toHaveLength(2);
    expect(themen.map((t) => t.titel)).toEqual(expect.arrayContaining(["Thema 1", "Thema 2"]));
});

test("sollte Fehler werfen wenn Gebiet für getAlleThemen nicht existiert", async () => {
    const fakeId = "609276662447990000000000";
    await expect(getAlleThemen(fakeId)).rejects.toThrow("Gebiet wurde nicht gefunden.");
});

test("sollte ein Thema nach ID zurückgeben", async () => {
    const prof = await createValidProf();
    const gebiet = await Gebiet.create({
        name: "Gebiet A",
        verwalter: prof._id
    });

    const thema = await Thema.create({
        titel: "Bestes Thema",
        beschreibung: "Beschreibung",
        abschluss: "any",
        gebiet: gebiet._id,
        betreuer: prof._id
    });

    const result = await getThema(thema.id);
    expect(result.id).toBe(thema.id);
    expect(result.titel).toBe("Bestes Thema");
    expect(result.gebiet).toBe(gebiet.id);
    expect(result.updatedAt).toBeDefined();
});

test("sollte Fehler werfen wenn Thema nicht gefunden wird", async () => {
    const fakeId = "609276662447990000000000";
    await expect(getThema(fakeId)).rejects.toThrow("Thema wurde nicht gefunden.");
});

test("sollte ein Thema erstellen", async () => {
    const prof = await createValidProf();
    const gebiet = await Gebiet.create({
        name: "Gebiet B",
        verwalter: prof._id
    });

    const payload: ThemaResource = {
        titel: "Neues Thema",
        beschreibung: "Beschreibbar",
        literatur: "Literatur",
        abschluss: "bsc",
        status: "offen",
        betreuer: prof.id,
        gebiet: gebiet.id
    };

    const result = await createThema(payload);
    expect(result.titel).toBe("Neues Thema");
    expect(result.literatur).toBe("Literatur");
    expect(result.status).toBe("offen");
    expect(result.gebiet).toBe(gebiet.id);
    expect(result.updatedAt).toBeDefined();

    const dbThema = await Thema.findOne({ titel: "Neues Thema" }).exec();
    expect(dbThema).not.toBeNull();
});

test("sollte Fehler werfen wenn Gebiet für createThema nicht existiert", async () => {
    const fakeId = "609276662447990000000000";
    await expect(
        createThema({
            titel: "Thema X",
            beschreibung: "X",
            abschluss: "msc",
            betreuer: fakeId,
            gebiet: fakeId
        })
    ).rejects.toThrow("Gebiet wurde nicht gefunden.");
});

test("sollte Fehler werfen wenn Thema in geschlossenem Gebiet erstellt wird", async () => {
    const prof = await createValidProf();
    const gebiet = await Gebiet.create({
        name: "Geschlossenes Gebiet",
        closed: true,
        verwalter: prof._id
    });

    await expect(
        createThema({
            titel: "Geschlossenes Thema",
            beschreibung: "Kann nicht erstellt werden",
            abschluss: "bsc",
            betreuer: prof.id,
            gebiet: gebiet.id
        })
    ).rejects.toThrow("Thema kann nicht erstellt werden, da das Gebiet geschlossen ist.");
});

test("sollte Fehler werfen bei duplicate Thema für den gleichen Betreuer", async () => {
    const prof = await createValidProf();
    const gebiet = await Gebiet.create({
        name: "Gebiet C",
        verwalter: prof._id
    });

    await Thema.create({
        titel: "Gleiches Thema",
        beschreibung: "Schon vorhanden",
        abschluss: "bsc",
        gebiet: gebiet._id,
        betreuer: prof._id
    });

    await expect(
        createThema({
            titel: "Gleiches Thema",
            beschreibung: "Duplikat",
            abschluss: "msc",
            betreuer: prof.id,
            gebiet: gebiet.id
        })
    ).rejects.toThrow("Dieser Betreuer hat bereits ein Thema mit diesem Titel angelegt.");
});

test("sollte ein Thema aktualisieren", async () => {
    const prof = await createValidProf();
    const gebiet = await Gebiet.create({
        name: "Gebiet D",
        verwalter: prof._id
    });

    const thema = await Thema.create({
        titel: "Thema Alt",
        beschreibung: "Alt",
        literatur: "Alt Literatur",
        abschluss: "any",
        gebiet: gebiet._id,
        betreuer: prof._id
    });

    const updated = await updateThema({
        id: thema.id,
        titel: "Thema Neu",
        beschreibung: "Neu",
        literatur: "Neu Literatur",
        abschluss: "msc",
        status: "reserviert",
        betreuer: prof.id,
        gebiet: gebiet.id
    });

    expect(updated.titel).toBe("Thema Neu");
    expect(updated.beschreibung).toBe("Neu");
    expect(updated.literatur).toBe("Neu Literatur");
    expect(updated.abschluss).toBe("msc");
    expect(updated.status).toBe("reserviert");
});

test("sollte Fehler werfen wenn beim Aktualisieren kein Thema existiert", async () => {
    const fakeId = "609276662447990000000000";
    await expect(
        updateThema({
            id: fakeId,
            titel: "Nicht existierend",
            beschreibung: "keine",
            abschluss: "bsc",
            status: "offen",
            betreuer: fakeId,
            gebiet: fakeId
        })
    ).rejects.toThrow("Kein Thema mit der ID gefunden.");
});

test("sollte Fehler werfen wenn ein anderes Thema mit gleichem Titel und Betreuer existiert", async () => {
    const prof = await createValidProf();
    const gebiet = await Gebiet.create({
        name: "Gebiet E",
        verwalter: prof._id
    });

    const themaA = await Thema.create({
        titel: "Thema A",
        beschreibung: "A",
        abschluss: "msc",
        gebiet: gebiet._id,
        betreuer: prof._id
    });

    const themaB = await Thema.create({
        titel: "Thema B",
        beschreibung: "B",
        abschluss: "bsc",
        gebiet: gebiet._id,
        betreuer: prof._id
    });

    await expect(
        updateThema({
            id: themaB.id,
            titel: "Thema A",
            beschreibung: "B aktualisiert",
            abschluss: "any",
            status: "offen",
            betreuer: prof.id,
            gebiet: gebiet.id
        })
    ).rejects.toThrow("Die Kombination aus Titel und Betreuer existiert bereits bei einem anderen Thema.");
});

test("sollte ein Thema löschen", async () => {
    const prof = await createValidProf();
    const gebiet = await Gebiet.create({
        name: "Gebiet F",
        verwalter: prof._id
    });

    const thema = await Thema.create({
        titel: "Löschthema",
        beschreibung: "Wird gelöscht",
        abschluss: "any",
        gebiet: gebiet._id,
        betreuer: prof._id
    });

    await deleteThema(thema.id);
    const check = await Thema.findById(thema.id);
    expect(check).toBeNull();
});

test("sollte Fehler werfen wenn das Thema nicht existiert", async () => {
    const fakeId = "609276662447990000000000";
    await expect(deleteThema(fakeId)).rejects.toThrow(`No thema with id ${fakeId} deleted, probably id not valid`);
});
