import { NextFunction, Request, Response } from "express";
import { logger } from "../logger";
import { verifyJWT } from "../services/JWTService";

declare global {
    namespace Express {
        export interface Request {
            /**
             * Mongo-ID of currently logged in prof; or undefined, if prof is a guest.
             */
            profId?: string;
            role?: "u" | "a";
        }
    }
}

/**
 * Prüft Authentifizierung und schreibt `profId` und `role' des Profs in den Request.
 * Falls Authentifizierung fehlschlägt, wird ein Fehler (401) gesendet.
 */
export function requiresAuthentication(req: Request, res: Response, next: NextFunction) {
    try {
        const jwtString = req.cookies.access_token;

        if (!jwtString) {
            logger.warn("Authentifizierung fehlgeschlagen: Kein Token im Cookie vorhanden.");
            return res.sendStatus(401);
        }

        const loginResource = verifyJWT(jwtString);

        req.profId = loginResource.id;
        req.role = loginResource.role;

        return next();
        
    } catch (error) {
        logger.warn(`Authentifizierung fehlgeschlagen: Ungültiges oder abgelaufenes Token. ${error}`);
        res.clearCookie("access_token");
        return res.sendStatus(401);
    }
}

/**
 * Prüft Authentifizierung und schreibt `profId` und `role' des Profs in den Request.
 * Falls ein JWT vorhanden ist, wird bei fehlgeschlagener Prüfung ein Fehler gesendet.
 * Ansonsten wird kein Fehler erzeugt.
 */
export function optionalAuthentication(req: Request, res: Response, next: NextFunction) {
    try {
        const jwtString = req.cookies.access_token;

        if(!jwtString){
            return next();
        }

        const loginResource = verifyJWT(jwtString);

        req.profId = loginResource.id;
        req.role = loginResource.role;

        return next();
    } catch (error) {
        logger.warn(`Optionale Authentifizierung fehlgeschlagen: Token war vorhanden, aber ungültig. ${error}`);
        res.clearCookie("access_token");
        return res.sendStatus(401);
    } 
}

