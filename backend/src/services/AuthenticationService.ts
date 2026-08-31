import { Prof } from "../model/ProfModel";

/**
 * Prüft Campus-ID und Passwort, bei Erfolg wird ein Objekt mit 
 * `id` und `role` ("u" für normaler User oder "a" für Admin) 
 * des Profs zurückgegeben
 * 
 * Falls kein Prof mit gegebener Campus-ID existiert oder das Passwort falsch ist, wird nur 
 * `false` zurückgegeben. Aus Sicherheitsgründen wird kein weiterer Hinweis gegeben.
 */
export async function login(campusID: string, password: string): Promise<{ id: string, role: "a" | "u" } | false> {
    try {
        const prof = await Prof.findOne({ campusID });

        if(!prof){
            throw new Error("Kein Prof mit dieser Campus ID gefunden.");
        }

        const passwortKorrekt = await prof.isCorrectPassword(password);

        if(!passwortKorrekt){
            throw new Error("Passwort nicht Korrekt.");
        }

        return {
            id: prof.id,
            role: prof.admin ? 'a' : 'u'
        }
    } catch(error) {
        console.error("Login Error:", error);
        return false;
    }
}