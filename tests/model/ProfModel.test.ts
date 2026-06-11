import { Prof } from "../../src/model/ProfModel";

test("richtige default values", async () => {
    const prof = new Prof({
        name: "Mustermann",
        campusID: "prof01",
        password: "1234"
    });

    expect(prof.admin).toBe(false);
});

test("fehler wenn eine oder mehrere required values fehlen", async () => {
    const prof = new Prof({
        name: "Mustermann",
        campusID: "prof01"
    });

    const prof2 = new Prof({
        name: "Musterfrau"
    });

    await expect(prof.save()).rejects.toThrow();
    await expect(prof2.save()).rejects.toThrow();
});

test("fehler wenn unique constraint nicht eingehalten wird", async () => {
    const prof = await Prof.create({
        name: "Mustermann",
        campusID: "prof01",
        password: "1234"
    });

    const prof2 = new Prof({
        name: "Musterfrau",
        campusID: "prof01",
        password: "5678"
    });

    await expect(prof2.save()).rejects.toThrow();
});



