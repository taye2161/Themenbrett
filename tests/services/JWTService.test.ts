import dotenv from "dotenv";
dotenv.config();

import { verifyPasswordAndCreateJWT, verifyJWT } from "../../src/services/JWTService";
import { Prof } from "../../src/model/ProfModel";

const createValidProf = async (campusID = "prof01") => {
    return Prof.create({
        name: "Max Mustermann",
        titel: "Prof. Dr.",
        campusID,
        password: "secretpassword",
        admin: false
    });
};


test("gibt gueltiges JWT zurueck wenn Prof existiert und Passwort stimmt", async () => {
    const prof = await createValidProf();

    const token = verifyPasswordAndCreateJWT("prof01", prof.password);

    expect(token).toBeDefined();
});

test("sollte undefined zurueckgeben wenn die campusID nicht existiert", async () => {
    const token = await verifyPasswordAndCreateJWT("gibtsNicht", "secretpassword");

    expect(token).toBeUndefined();
});

test("sollte undefined zurueckgeben wenn das Passwort falsch ist", async () => {
    const prof = await createValidProf();

    const token = await verifyPasswordAndCreateJWT("prof01", "falschesPasswort");

    expect(token).toBeUndefined();
});

test("sollte gueltiges token erfolgreich verifizieren und eine LoginResource zurueckgeben", async () => {
    const prof = await createValidProf();

    const token = await verifyPasswordAndCreateJWT("prof01", "secretpassword");
    expect(token).toBeDefined();

    const resource = verifyJWT(token);

    expect(resource).toBeDefined();
    expect(resource.id).toBe(prof.id);
    expect(resource.role).toBe("u");
    expect(typeof resource.exp).toBe("number");
});

test("sollte Fehler werfen bei ungueltigem Token", async () => {
    const ungueltigesToken = "abcdefgh";

    expect(() => {
        verifyJWT(ungueltigesToken);
    }).toThrow();
});

test("sollte einen Fehler werfen, wenn kein Token (undefined) übergeben wird", async () => {
    expect(() => {
        verifyJWT(undefined)
    }).toThrow();
});

test("sollte einen Fehler werfen, wenn das Token mit einem anderen Secret signiert wurde", async () => {
    await createValidProf();
    
    const token = await verifyPasswordAndCreateJWT("prof01", "secretpassword");
    expect(token).toBeDefined();

    const originalSecret = process.env.JWT_SECRET;
    try {
        process.env.JWT_SECRET = "falsches-secret";

        expect(() => {
            verifyJWT(token);
        }).toThrow();

    } finally {
        process.env.JWT_SECRET = originalSecret;
    }
});

test("sollte einen Fehler werfen, wenn das Token abgelaufen ist", async () => {
    await createValidProf();

    const originalJwtTTL = process.env.JWT_TTL;

    try {
        process.env.JWT_TTL = "-10";

        const abgelaufenesToken = await verifyPasswordAndCreateJWT("prof01", "secretpassword");

        expect(abgelaufenesToken).toBeDefined();
        
        expect(() => verifyJWT(abgelaufenesToken)).toThrow();
    } finally {
        process.env.JWT_TTL = originalJwtTTL;
    }
});
