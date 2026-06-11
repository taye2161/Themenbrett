import { Types } from "mongoose";
import { Gebiet } from "../../src/model/GebietModel";
import { Prof } from "../../src/model/ProfModel";

let profId: Types.ObjectId;

beforeAll( async () => {
    const prof = await Prof.create({
        name: "Mustermann",
        campusID: "admin01",
        password: "1234",
        admin: true
    });
    profId = prof._id as Types.ObjectId;
});

test("richtige default values", async () => {
    const gebiet = new Gebiet({
        name: "Software Engineering",
        verwalter: profId
    });

    expect(gebiet.public).toBe(false);
    expect(gebiet.closed).toBe(false);
});

test("fehler wenn name(required) fehlt", async () => {
    const gebiet = new Gebiet({
        verwalter: profId
    });

    await expect(gebiet.save()).rejects.toThrow();
});

test("fehler wenn unique constraint nicht eingehalten wird", async () => {
    const gebiet = await Gebiet.create({
        name: "Software Engineering",
        verwalter: profId
    });

    const doppelt = new Gebiet({
        name: "Software Engineering",
        verwalter: profId
    })

    await expect(doppelt.save()).rejects.toThrow();
});

test("fehler wenn verwalter keine gueltige ID hat", async () => {
    const gebiet = new Gebiet({
        name: "Software Engineering",
        verwalter: "ungueltig"
    });

    await expect(gebiet.save()).rejects.toThrow();
});

test("soll automatisch createdAt Datum setzen", async () => {
    const gebiet = await Gebiet.create({
        name: "Software Engineering",
        verwalter: profId
    });

    expect(gebiet.createdAt).toBeDefined();
    expect(gebiet.createdAt instanceof Date).toBe(true);
});

