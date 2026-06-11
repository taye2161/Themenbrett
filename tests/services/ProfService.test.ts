import { ProfResource } from "../../src/Resources";
import { createProf, updateProf, deleteProf, changePassword, getAlleProfs } from "../../src/services/ProfService"
import { Prof } from "../../src/model/ProfModel"
import { Thema } from "../../src/model/ThemaModel"
import { Gebiet } from "../../src/model/GebietModel"

const createValidProfRes = (id?: string): ProfResource => ({
        id: id || undefined,
        name: "Max Mustermann",
        titel: "Prof. Dr.",
        campusID: "mmu123",
        password: "secretpassword",
        admin: false
    });

test("sollte einen Prof speichern und kein Passwort zurückgeben", async () => {
    const res = await createProf(createValidProfRes());
            
    expect(res.name).toBe("Max Mustermann");
    expect(res.password).toBeUndefined();
            
    const dbProf = await Prof.findOne({ campusID: "mmu123" }).exec();
    expect(dbProf).toBeDefined();
    expect(dbProf!.password).not.toBe("secretpassword");
});

test("sollte Prof-Daten aktualisieren", async () => {
    const created = await createProf(createValidProfRes());
            
    const updateRes: ProfResource = {
        ...created,
        name: "Maximilian"
    };

    const result = await updateProf(updateRes);

    expect(result.id).toBe(created.id);
    expect(result.name).toBe("Maximilian");
});

test("sollte Fehler werfen bei ungültiger ID", async () => {
    const fakeId = "609276662447990000000000";
    await expect(updateProf({ ...createValidProfRes(), id: fakeId })).rejects.toThrow("cannot update");
});

test("sollte Prof und abhängige Gebiete löschen", async () => {
           
    const profDoc = await Prof.create(createValidProfRes());
            
            
    const gebietDoc = await Gebiet.create({
        name: "Web Engineering",
        verwalter: profDoc._id
    });
            
    await Thema.create({
        titel: "React Hooks",
        beschreibung: "React Hooks im Web Engineering",
        gebiet: gebietDoc._id,
        betreuer: profDoc._id
    });

    await deleteProf(profDoc.id);

            
    const profCheck = await Prof.findById(profDoc.id);
    const gebietCheck = await Gebiet.findOne({ verwalter: profDoc._id });
    const themaCheck = await Thema.findOne({ gebiet: gebietDoc._id });

    expect(profCheck).toBeNull();
    expect(gebietCheck).toBeNull();
    expect(themaCheck).toBeNull();
});

test("sollte Fehler werfen wenn ProfID nicht existiert", async () => {
    const fakeId = "609276662447990000000000";
    await expect(deleteProf(fakeId)).rejects.toThrow();
});

test("sollte Passwort bei korrekter Eingabe ändern", async () => {
    const prof = await Prof.create(createValidProfRes());
            
    const res = await changePassword(prof.id, "secretpassword", "new-password");
    expect(res.name).toBe(prof.name);

    const updatedProf = await Prof.findById(prof.id);
    const isMatch = await updatedProf!.isCorrectPassword("new-password");
    expect(isMatch).toBe(true);
});

test("sollte Fehler werfen bei falschem altem Passwort", async () => {
    const prof = await Prof.create(createValidProfRes());
    await expect(changePassword(prof.id, "wrongOldPassword", "newPassword")).rejects.toThrow();
});

test("sollte alle Profs ohne Passwörter zurückgeben", async () => {
    await Prof.create(createValidProfRes());
    await Prof.create({ ...createValidProfRes(), campusID: "other" });

    const alle = await getAlleProfs();
    expect(alle.length).toBe(2);
    expect(alle[0]).not.toHaveProperty("password");
});