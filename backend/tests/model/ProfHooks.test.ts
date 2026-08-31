import { Prof, IProf, ProfDocument } from "../../src/model/ProfModel";

test('save hook wird abgefangen und passwort gehashed', async () => {
    const prof1 = new Prof({
        name: "Pilgrim",
        campusID: "prof1",
        password: "12345678"
    });

    await prof1.save();
    
    expect(prof1.password).not.toBe("12345678");
    expect(await prof1.isCorrectPassword("12345678")).toBe(true);
});

test("updateOne hook wird gefangen und passwort gehashed", async () => {
    const prof1 = new Prof({
        name: "Pilgrim",
        campusID: "prof1",
        password: "abcd"
    });

    await prof1.save();

    await Prof.updateOne({ campusID: "prof1" }, { password: "12345678" });

    const updatedProf = await Prof.findById(prof1._id);

    if (!updatedProf) {
        throw new Error("Professor wurde nicht gefunden");
    }

    expect(updatedProf.password).not.toBe("12345678");
    expect(await updatedProf.isCorrectPassword("12345678")).toBe(true);
});

test("findOneAndUpdate hook wird gefangen und passwort gehashed", async () => {
    const prof1 = new Prof({
        name: "Pilgrim",
        campusID: "prof01",
        password: "12345678"
    });

    await prof1.save();

    await Prof.findOneAndUpdate({ campusID: "prof01" }, { password: "12345678" });

    const updatedProf = await Prof.findById(prof1._id);

    if (!updatedProf) {
        throw new Error("Professor wurde nicht gefunden");
    }

    console.log(updatedProf.password);
    expect(updatedProf.password).not.toBe("12345678");
    expect(await updatedProf.isCorrectPassword("12345678")).toBe(true);
});

test("isCorrectPassword wirft Fehler, weil Passwort noch nicht gespeichert und gehashed wurde", async () => {
    const prof1 = new Prof({
        name: "Pilgrim",
        campusID: "prof01",
        password: "12345678"
    });

    await expect(prof1.isCorrectPassword("12345678")).rejects.toThrow();
});