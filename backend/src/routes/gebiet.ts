import express, { Request } from "express";
import { GebietResource } from "../Resources";
import { getAlleGebiete, createGebiet, getGebiet, updateGebiet, deleteGebiet } from "../services/GebietService";
import { getAlleThemen } from "../services/ThemaService";
import { body, matchedData, param, validationResult } from "express-validator";
import { IGebiet } from "../model/GebietModel";
import { optionalAuthentication, requiresAuthentication } from "./authentication";

export const gebietRouter = express.Router();

const validate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

gebietRouter.get("/alle", optionalAuthentication,
    async (req, res) => {
        const alleGebiete = await getAlleGebiete();

        console.log("profId:", req.profId);
        console.log("role:", req.role);
        console.log("Alle Gebiete: ", alleGebiete);


        if (req.role === "a") {
            return res.status(200).json(alleGebiete);
        }

        const erlaubteGebiete = alleGebiete.filter(g => {
            console.log(
                g.name,
                "public:", g.public,
                "verwalter:", g.verwalter
            );
            if (g.public == true){
                return true;
            } 

            return g.verwalter === req.profId; 
        });

        console.log("Erlaubte Gebiete: ", erlaubteGebiete);

        res.status(200).send(erlaubteGebiete);
    });

gebietRouter.get('/:id/themen',
    param('id').isMongoId().withMessage('Ungültige Gebiets-ID'),
    validate,
    optionalAuthentication,
    async (req: Request<{ id: string }, {}, IGebiet>, res) => {
        const id = req.params.id;

        try {
            const gebiet = await getGebiet(id);

            if (!gebiet) {
                res.sendStatus(404);
                return;
            }

            if (!gebiet.public && req.role !== "a" && gebiet.verwalter !== req.profId) {
                res.sendStatus(403);
                return;
            }

            const themen = await getAlleThemen(id);

            const darfReservierteSehen =
                req.role === "a" || gebiet.verwalter.toString() === req.profId;

            const sichtbareThemen = themen.filter(thema =>
                thema.status === "offen" || darfReservierteSehen
            );

            res.status(200).send(sichtbareThemen);
        } catch (error) {
            res.sendStatus(400);
        }
    });

gebietRouter.post("/",
    body('name').isString().notEmpty().withMessage('Name ist erforderlich'),
    body('beschreibung').optional().isString(),
    body('public').optional().isBoolean(),
    body('closed').optional().isBoolean(),
    validate,
    requiresAuthentication,
    async (req, res) => {
        if (req.role !== 'a') {
            return res.sendStatus(403);
        }
        const gebietResource = matchedData(req) as GebietResource;
        gebietResource.verwalter = req.profId!;
        try {
            const createdGebiet = await createGebiet(gebietResource);
            res.status(201).send(createdGebiet);
            return;
        } catch (error) {
            res.sendStatus(400);
        }
    });

gebietRouter.get("/:id",
    param('id').isMongoId().withMessage('Ungültige Gebiets-ID'),
    validate,
    optionalAuthentication,
    async (req: Request<{ id: string }>, res: express.Response) => {
        const id = req.params.id;

        try {
            const gebiet = await getGebiet(id);

            if (!gebiet) {
                res.sendStatus(404);
                return;
            }

            if (!gebiet.public && req.role !== "a" && gebiet.verwalter !== req.profId) {
                return res.sendStatus(403);
            }

            res.status(200).send(gebiet)
        } catch (error) {
            res.sendStatus(400);
        }
    });

gebietRouter.put('/:id',
    body('id').optional().custom((value, { req }) => {
        const paramId = (req as Request<{ id: string }>).params?.id;
        if (value && value !== paramId) {
            throw new Error('Body.id stimmt nicht mit URL überein');
        }
        return true;
    }),
    body('name').optional().isString().notEmpty(),
    body('beschreibung').optional().isString(),
    body('public').optional().isBoolean(),
    body('closed').optional().isBoolean(),
    body('verwalter').optional().isMongoId().withMessage('Ungültige Verwalter-ID'),
    validate,
    requiresAuthentication,
    async (req: Request<{ id: string }>, res: express.Response) => {
        const id = req.params.id;
        const newData = req.body as GebietResource;

        try {
            const gebiet = await getGebiet(id);

            if (!gebiet) {
                res.sendStatus(404);
                return;
            }

            if (gebiet.verwalter !== req.profId) {
                return res.sendStatus(403);
            }

            newData.id = id;

            const updatedGebiet = await updateGebiet(newData);
            res.status(200).send(updatedGebiet);


        } catch (error) {
            res.sendStatus(400);
        }
    });

gebietRouter.delete('/:id',
    param('id').isMongoId().withMessage('Ungültige Gebiets-ID'),
    validate,
    requiresAuthentication,
    async (req: Request<{ id: string }>, res: express.Response) => {

        const id = req.params.id;

        try {
            const gebiet = await getGebiet(id);

            if (!gebiet) {
                res.sendStatus(404);
                return;
            }

            if (gebiet.verwalter !== req.profId) {
                return res.sendStatus(403);
            }

            await deleteGebiet(id);
            res.sendStatus(204);
        } catch (error) {
            res.sendStatus(400);
        }
    });


