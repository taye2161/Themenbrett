import express, { Request } from "express";
import { createThema, deleteThema, getThema, updateThema } from "../services/ThemaService";
import { ThemaResource } from "../Resources";
import { body, matchedData, param, validationResult } from "express-validator";
import { optionalAuthentication, requiresAuthentication } from "./authentication";
import { getGebiet } from "../services/GebietService";

export const themaRouter = express.Router();

const validate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

themaRouter.post('/',
    body('titel').isString().notEmpty().withMessage('Titel ist erforderlich'),
    body('beschreibung').isString().notEmpty().withMessage('Beschreibung ist erforderlich'),
    body('literatur').optional().isString(),
    body('abschluss').optional().isString(),
    body('status').optional().isString(),
    body('betreuer').isMongoId().withMessage('Ungültige Betreuer-ID'),
    body('gebiet').isMongoId().withMessage('Ungültige Gebiets-ID'),
    validate,
    requiresAuthentication,
    async (req: Request<{}, {}, ThemaResource>, res) => {
        const themaResource = matchedData(req) as ThemaResource;
        try {
            const gebiet = await getGebiet(themaResource.gebiet);
            if (!gebiet) {
                return res.sendStatus(400); 
            }

            if (!gebiet.public && gebiet.verwalter !== req.profId) {
                return res.sendStatus(403);
            }

            themaResource.betreuer = req.profId!;

            const createdThema = await createThema(themaResource);
            res.status(201).send(createdThema);
        } catch (error) {
            res.sendStatus(400);
        }
    });

themaRouter.get('/:id',
    param('id').isMongoId().withMessage('Ungültige Thema-ID'),
    validate,
    optionalAuthentication,
    async (req: Request<{ id: string }>, res) => {
        const id = req.params.id;

        try {
            const thema = await getThema(id);

            if(!thema) {
                res.sendStatus(404);
                return;
            }

            const gebiet = await getGebiet(thema.gebiet);
            if (!gebiet) {
                return res.sendStatus(404);
            }

            if (!gebiet.public) {
                const istVerwalter = gebiet.verwalter === req.profId;
                const istBetreuer = thema.betreuer === req.profId;

                if (!istVerwalter && !istBetreuer) {
                    return res.sendStatus(403); 
                }
            }

            res.status(200).send(thema);
        } catch (error) {
            res.sendStatus(400);
        }
    });

themaRouter.put('/:id',
    param('id').isMongoId().withMessage('Ungültige Thema-ID'),
    body('id').optional().custom((value, { req }) => {
        const paramId = (req as Request<{ id: string }>).params.id;
        if (value && value !== paramId) {
            throw new Error('Body.id stimmt nicht mit URL überein');
        }
        return true;
    }),
    body('titel').optional().isString().notEmpty(),
    body('beschreibung').optional().isString().notEmpty(),
    body('literatur').optional().isString(),
    body('abschluss').optional().isString(),
    body('status').optional().isString(),
    body('betreuer').optional().isMongoId().withMessage('Ungültige Betreuer-ID'),
    body('gebiet').optional().isMongoId().withMessage('Ungültige Gebiets-ID'),
    validate,
    requiresAuthentication,
    async (req: Request<{ id: string }, {}, ThemaResource>, res) => {
        const id = req.params.id;
        const newData = req.body as ThemaResource;

        try {
            const thema = await getThema(id);

            if(!thema) {
                res.sendStatus(404);
                return;
            }

            const gebiet = await getGebiet(thema.gebiet);
            if (!gebiet) {
                return res.sendStatus(404);
            }

            const istVerwalter = gebiet.verwalter === req.profId;
            const istBetreuer = thema.betreuer === req.profId;

            if (!istVerwalter && !istBetreuer) {
                return res.sendStatus(403);
            }

            newData.id = id;

            const updatedThema = await updateThema(newData);
            res.status(200).send(updatedThema);
        } catch (error) {
            res.sendStatus(400);
        }
    });

themaRouter.delete('/:id',
    param('id').isMongoId().withMessage('Ungültige Thema-ID'),
    validate,
    requiresAuthentication,
    async (req: Request<{ id: string }>, res) => {
        const id = req.params.id;
        try {
            const thema = await getThema(id);

            if(!thema) {
                res.sendStatus(404);
                return;
            }

            const gebiet = await getGebiet(thema.gebiet);
            if (!gebiet) {
                return res.sendStatus(404);
            }

            const istVerwalter = gebiet.verwalter === req.profId;
            const istBetreuer = thema.betreuer === req.profId;

            if (!istVerwalter && !istBetreuer) {
                return res.sendStatus(403);
            }

            await deleteThema(id);
            res.sendStatus(204);
        } catch (error) {
            res.sendStatus(400);
        }
    });