import { JwtPayload, sign, verify } from "jsonwebtoken";
import { Prof } from "../model/ProfModel";
import { logger } from "../logger"
import { LoginResource } from "../Resources";

export async function verifyPasswordAndCreateJWT(campusID: string, password: string): Promise<string | undefined> {
    try {
        const prof = await Prof.findOne({ campusID: campusID });

        if (!prof) {
            logger.warn(`Anmeldeversuch fehlgeschlagen: CampusID ${campusID} nicht gefunden.`);
            return undefined;
        }

        const passwortKorrekt = await prof.isCorrectPassword(password);

        if(!passwortKorrekt){
            logger.warn(`Anmeldeversuch fehlgeschlagen: Falsches Passwort für CampusID ${campusID}.`);
            return undefined;
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            logger.error("JWT_SECRET ist nicht in den Umgebungsvariablen definiert!");
            throw new Error("Internal Server Error");
        }

        const payload = {
            sub: prof.id,
            role: prof.admin ? 'a' : 'u'
        };

        const ttl = process.env.JWT_TTL ? parseInt(process.env.JWT_TTL) : 300;

        const token = sign(payload, jwtSecret, {
            expiresIn: ttl,
            algorithm: 'HS256'
        });
    
        logger.info(`Erfolgreicher Login. JWT für CampusID ${campusID} erstellt.`);
        return token;

    } catch (error) {
        logger.error(`Fehler in verifyPasswordAndCreateJWT: ${error}`);
        return undefined;
    }
}

export function verifyJWT(jwtString: string | undefined): LoginResource {
    try {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            logger.error("JWT_SECRET ist nicht in den Umgebungsvariablen definiert!");
            throw new Error("Internal Server Error");
        }

        if(!jwtString){
            logger.error("JWT ist nicht gueltig");
            throw new Error("Internal Server Error");
        }

        const payload = verify(jwtString, jwtSecret) as any;

        return {
            id: payload.sub,
            role: payload.role, 
            exp: payload.exp    
        };
    } catch (error) {
        logger.error(`Fehler in verifyJWT: ${error}`);
        throw error;
    }
}
