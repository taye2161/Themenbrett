import { ProfResource } from "../Resources";
import { Types } from "mongoose";
import { Prof } from "../model/ProfModel";
import { Gebiet } from "../model/GebietModel";
import { deleteGebiet } from "./GebietService";

/**
 * Erzeugt einen Prof. Das Passwort darf nicht zurückgegeben werden.
 */
export async function createProf(profResource: ProfResource): Promise<ProfResource> {
    const prof = new Prof ({
        name: profResource.name,
        titel: profResource.titel,
        campusID: profResource.campusID,
        password: profResource.password,
        admin: profResource.admin
    });

    await prof.save();

    return {
        id: prof.id,
        name: prof.name,
        titel: prof.titel,
        campusID: prof.campusID,
        admin: prof.admin
    }
}

/**
 * Updated einen Prof. Beim Update wird der Prof über die id identifiziert.
 * 
 * Diese Funktion ist bereits vorgegeben.
 */
export async function updateProf(profResource: ProfResource): Promise<ProfResource> {
    const prof = await Prof.findById(profResource.id).exec();
    if (!prof) {
        throw new Error(`No prof with id ${profResource.id} found, cannot update`);
    }
    prof.name = profResource.name;
    // Titel ist evtl. leer, daher setzen wir ihn in jedem Fall
    prof.titel = profResource.titel;
    prof.campusID = profResource.campusID;
    prof.admin = profResource.admin;
    if (profResource.password) prof.password = profResource.password;

    const savedProf = await prof.save();
    return {
        id: savedProf.id,
        name: savedProf.name,
        titel: savedProf.titel,
        campusID: savedProf.campusID,
        admin: savedProf.admin,
    };
}

/**
 * Beim Löschen wird der Prof über die ID identifiziert.
 * Falls Prof nicht gefunden wurde (oder aus
 * anderen Gründen nicht gelöscht werden kann) wird ein Fehler geworfen.
 * Wenn der Prof gelöscht wird, müssen auch alle zugehörigen Gebiete und Themen gelöscht werden.
 * 
 * Diese Funktion ist bereits vorgegeben.
 */
export async function deleteProf(id: string): Promise<void> {
    const profId = new Types.ObjectId(id);
    const deleteResult = await Prof.deleteOne({ _id: profId }).exec();
    if (deleteResult.deletedCount !== 1) {
        throw new Error(`No prof with id ${id} deleted, probably id not valid`);
    }

    const gebiete = await Gebiet.find({ verwalter: profId }).exec();
    for (const gebiet of gebiete) {
        try {
            // Verwendung der Service-Funktion, diese löscht dann die Themen mit!
            await deleteGebiet(gebiet.id);
        } catch (err) {
            // Ignorieren wir hier, wir arbeiten nicht mit Transaktionen.
        }
    }
}

/**
 * Ändert das Passwort eines Profs. Das alte Passwort wird zur Verifikation benötigt.
 * Gibt denselben ProfResource zurück wie updateProf (ohne Passwort).
 */
export async function changePassword(id: string, oldPassword: string, newPassword: string): Promise<ProfResource> {
    const prof = await Prof.findById(id);

    if(!prof){
        throw new Error("Professor mit dieser ID nicht vorhanden.");
    }

    const passwortKorrekt = await prof.isCorrectPassword(oldPassword);

    if(!passwortKorrekt){
        throw new Error("Altes Passwort ist nicht korrekt.");
    }

    prof.password = newPassword;

    await prof.save();

    return {
        name: prof.name,
        titel: prof.titel,
        campusID: prof.campusID,
        admin: prof.admin
    }
}

/**
 * Gibt alle Profs zurück, Passwörter werden nicht zurückgegeben.
 * 
 * Diese Funktion ist bereits vorgegeben.
 */
export async function getAlleProfs(): Promise<ProfResource[]> {
    const arrProfs = await Prof.find({}).exec();
    const arrProfRes = arrProfs.map((prof) => ({
        id: prof.id,
        name: prof.name,
        titel: prof.titel,
        campusID: prof.campusID,
        admin: prof.admin,
    }));
    return arrProfRes;
}

