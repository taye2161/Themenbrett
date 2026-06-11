import express, { Request } from "express";
import { ProfResource } from "../Resources";
import { changePassword, createProf, deleteProf, getAlleProfs, updateProf } from "../services/ProfService";
import { body, matchedData, param, validationResult } from "express-validator";
import { optionalAuthentication, requiresAuthentication } from "./authentication";

export const profRouter = express.Router();

const validate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

profRouter.get("/alle",
    requiresAuthentication,
    async (_req, res) => {
        if (_req.role !== 'a') {
            res.sendStatus(403);
            return;
        }
        const profs = await getAlleProfs();
        res.send(profs); // Default Status 200
    })

profRouter.get("/",
    optionalAuthentication,
    async (_req, res, _next) => {
        res.set("Allow", "POST")
        res.sendStatus(405);
    });

profRouter.get("/:id",
    requiresAuthentication,
    async (_req, res, _next) => {
        res.set("Allow", "PUT, DELETE")
        res.sendStatus(405);
    });

profRouter.post("/",
    body('name').isString().notEmpty().withMessage('Name ist erforderlich'),
    body('campusID').isString().notEmpty().withMessage('CampusID ist erforderlich'),
    body('admin').isBoolean().withMessage('Admin muss true oder false sein'),
    body('titel').optional().isString(),
    body('password').optional().isString(),
    validate,
    requiresAuthentication,
    async (req: Request<{}, {}, ProfResource>, res) => {
        if (req.role !== 'a') {
            res.sendStatus(403); 
            return;
        }
        const profResource = matchedData(req) as ProfResource;
        try {
            const createdProfResource = await createProf(profResource);
            res.status(201).send(createdProfResource);
            return;
        } catch (err) {
            res.sendStatus(400); // etwas schlampig hier, wird später genauer umgesetzt
        }
    });

/** 
 * Alternative zur Erzeugung der Fehler im Handler:
 * mit custom error handler bei Validation: 
 * ```
 * custom(req) => {
 *     if (req.body.id !== req.params.id) {
 *       ...
 *      }
 * }
 *  ```
 * und diese Custom-Validation bei param("id") und body("id") einfügen.
 */
profRouter.put("/:id",
    param('id').custom((value, { req }) => {
        if (value === "alle") {
            return true;
        }
        if (!/^[0-9a-fA-F]{24}$/.test(value)) {
            throw new Error('Ungültige Prof-ID');
        }
        const bodyId = (req.body as { id?: string }).id;
        if (bodyId && bodyId !== value) {
            throw new Error('Body.id stimmt nicht mit URL überein');
        }
        return true;
    }),
    body('id').isString().notEmpty().withMessage('ID ist erforderlich'),
    body('id').custom((value, { req }) => {
        const paramId = (req as Request<{ id: string }>).params.id;
        if (value !== paramId) {
            throw new Error('Body.id stimmt nicht mit URL überein');
        }
        return true;
    }),
    body('name').optional().isString().notEmpty(),
    body('campusID').optional().isString().notEmpty(),
    body('admin').optional().isBoolean().withMessage('Admin muss true oder false sein'),
    body('titel').optional().isString(),
    body('password').optional().isString(),
    validate,
    requiresAuthentication,
    async (req: Request<{ id: string }, {}, ProfResource>, res) => {
        if (req.role !== 'a') {
            res.sendStatus(403);
            return;
        }
        const id = req.params.id;
        if (id === "alle") {
            res.set("Allow", "GET")
            res.sendStatus(405);
            return;
        }

        const profResId = req.body.id;
        if (id !== profResId) {
            res.sendStatus(400); // etwas schlampig hier, wird später genauer umgesetzt
            return;
        }

        const profResource = req.body as ProfResource;
        try {
            const updatedProfResource = await updateProf(profResource)
            res.send(updatedProfResource);
        } catch (err) {
            res.sendStatus(400); // etwas schlampig hier, wird später genauer umgesetzt
        }
    });

profRouter.put("/:id/password",
    param('id').isMongoId().withMessage('Ungültige Prof-ID'),
    body('id').isString().notEmpty().withMessage('ID ist erforderlich'),
    body('oldPassword').isString().notEmpty().withMessage('Altes Passwort ist erforderlich'),
    body('newPassword').isString().notEmpty().withMessage('Neues Passwort ist erforderlich'),
    body('id').custom((value, { req }) => {
        const paramId = (req as Request<{ id: string }>).params.id;
        if (value !== paramId) {
            throw new Error('Body.id stimmt nicht mit URL überein');
        }
        return true;
    }),
    validate,
    requiresAuthentication,
    async (req: Request<{ id: string }, {}, { id: string; oldPassword: string; newPassword: string }>, res) => {

        const { id, oldPassword, newPassword } = req.body;

        const istAdmin = req.role === 'a';
        const istManSelbst = req.profId === id;

        if (!istAdmin && !istManSelbst) {
            res.sendStatus(403);
            return;
        }
        
        try {
            const updatedProfResource = await changePassword(id, oldPassword, newPassword);
            res.send(updatedProfResource);
        } catch (err) {
            res.sendStatus(400); // etwas schlampig hier, wird später genauer umgesetzt
            return;
        }
    });

profRouter.delete("/:id",
    param('id').custom((value) => {
        if (value === "alle") {
            return true;
        }
        if (!/^[0-9a-fA-F]{24}$/.test(value)) {
            throw new Error('Ungültige Prof-ID');
        }
        return true;
    }),
    validate,
    requiresAuthentication,
    async (req: Request<{ id: string }>, res) => {
        if (req.role !== 'a') {
            res.sendStatus(403);
            return;
        }
        const id = req.params.id;
        if (id === "alle") {
            res.set("Allow", "GET")
            res.sendStatus(405);
            return;
        }
        try {
            await deleteProf(id);
            res.sendStatus(204)
        } catch (err) {
            res.sendStatus(404); // vermutlich nicht gefunden, in nächsten Aufgabenblättern genauer behandeln
            return;
        }
    })
