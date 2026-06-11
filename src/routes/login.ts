import express, { Request } from "express";
import { body, matchedData, param, validationResult } from "express-validator";
import { verifyPasswordAndCreateJWT, verifyJWT } from "../services/JWTService";
import { logger } from "../logger";

export const loginRouter = express.Router();

loginRouter.post('/', 
    [
        body("campusID")
            .isString().withMessage("CampusID muss ein String sein")
            .trim()
            .notEmpty().withMessage("CampusID darf nicht leer sein"),
        body("password")
            .isString().withMessage("Passwort muss ein String sein")
            .notEmpty().withMessage("Passwort darf nicht leer sein")
    ],
    async (req: any, res: any) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const jwtString = await verifyPasswordAndCreateJWT(req.body.campusID, req.body.password);
            if(!jwtString){
                res.sendStatus(401);
                return;
            }

            const loginResource = verifyJWT(jwtString);

            const cookieAblaufDatum = new Date(loginResource.exp * 1000);

            res.cookie("access_token", jwtString, {
                httpOnly: true,
                expires: cookieAblaufDatum,
                sameSite: 'none',
                secure: true
            });

            res.status(201).json(loginResource);
        } catch (error) {
            logger.error(`Fehler im POST /api/login Router: ${error}`);
            res.sendStatus(500);
        }
    });

loginRouter.get('/', (req, res) => {
    try {
        console.log("ROUTER EMPFÄNGT COOKIES:", req.cookies);

        const token = req.cookies.access_token;

        if (!token) {
            console.log("KEIN TOKEN GEFUNDEN, SENDE FALSE");
            res.status(401).json(false);
            return;
        }

        try {
            const loginResource = verifyJWT(token);
            console.log("VERIFIZIERTE LOGIN RESOURCE:", loginResource);
            res.status(200).json(loginResource);
            return;
        } catch (validationError) {
            console.log("TOKEN UNGÜLTIG, LÖSCHE COOKIE");
            res.clearCookie('access_token');
            res.status(401).json(false);
            return;
        }

    } catch (error) {
        logger.error(`Fehler im GET /api/login Router: ${error}`);
        res.sendStatus(500);
    }
});

loginRouter.delete('/', 
    async (req, res) => {
        try {
            res.clearCookie("access_token", {
                httpOnly: true,
                secure: true,
                sameSite: 'none'
            });

            res.sendStatus(204);
        } catch (error) {
            logger.error(`Fehler im DELETE /api/login Router: ${error}`);
            res.sendStatus(500);
        }
    }
)