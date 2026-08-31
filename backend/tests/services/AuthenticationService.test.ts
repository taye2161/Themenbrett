import { Prof } from "../../src/model/ProfModel";
import { login } from "../../src/services/AuthenticationService";


const password = "testpassword123";
    
beforeEach(async () => {
        
    await Prof.create({
        name: "Test Prof",
        campusID: "prof-01",
        password: password,
        admin: true
    });
});

test("login sollte bei korrekten Daten ID und Rolle 'a' zurückgeben", async () => {
    const result = await login("prof-01", password);
        
    const dbProf = await Prof.findOne({ campusID: "prof-01" });

    expect(result).not.toBe(false);
    if (result) {
        expect(result.id).toBe(dbProf!.id);
        expect(result.role).toBe("a");
    }
});

test("login sollte bei falscher Campus-ID false zurückgeben", async () => {
    const result = await login("falsche-id", password);
        
    expect(result).toBe(false);
});

test("login sollte bei falschem Passwort false zurückgeben", async () => {
    const result = await login("prof-01", "falsches-passwort");
        
    expect(result).toBe(false);
});