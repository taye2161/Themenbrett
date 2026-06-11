import { ThemaResource } from "../Resources";
import { Thema } from "../model/ThemaModel";
import { Gebiet } from "../model/GebietModel";
import { dateToString } from "./ServiceHelper";
import { Types } from "mongoose";

/**
 * Gibt alle Themen in einem Gebiet zurück.
 * Wenn das Gebiet nicht gefunden wurde, wird ein Fehler geworfen.
 */
export async function getAlleThemen(gebietId: string): Promise<ThemaResource[]> {
    const gebiet = await Gebiet.findById(gebietId).exec();
    if (!gebiet) {
        throw new Error("Gebiet wurde nicht gefunden.");
    }

    const themen = await Thema.find({ gebiet: gebiet._id }).exec();
    return themen.map((thema) => ({
        id: thema.id,
        titel: thema.titel,
        beschreibung: thema.beschreibung,
        literatur: thema.literatur,
        abschluss: thema.abschluss,
        status: thema.status,
        betreuer: thema.betreuer.toString(),
        gebiet: thema.gebiet.toString(),
        updatedAt: dateToString(thema.updatedAt)
    }));
}

/**
 * Liefert die ThemaResource mit angegebener ID.
 * Falls kein Thema gefunden wurde, wird ein Fehler geworfen.
 */
export async function getThema(id: string): Promise<ThemaResource> {
    const thema = await Thema.findById(id).exec();
    if (!thema) {
        throw new Error("Thema wurde nicht gefunden.");
    }

    return {
        id: thema.id,
        titel: thema.titel,
        beschreibung: thema.beschreibung,
        literatur: thema.literatur,
        abschluss: thema.abschluss,
        status: thema.status,
        betreuer: thema.betreuer.toString(),
        gebiet: thema.gebiet.toString(),
        updatedAt: dateToString(thema.updatedAt)
    };
}

/**
 * Erzeugt ein Thema.
 * Daten, die berechnet werden aber in der gegebenen Ressource gesetzt sind, werden ignoriert.
 * Falls die Liste geschlossen (closed) ist, wird ein Fehler wird geworfen.
 */
export async function createThema(themaResource: ThemaResource): Promise<ThemaResource> {
    const gebiet = await Gebiet.findById(themaResource.gebiet).exec();
    if (!gebiet) {
        throw new Error("Gebiet wurde nicht gefunden.");
    }
    if (gebiet.closed) {
        throw new Error("Thema kann nicht erstellt werden, da das Gebiet geschlossen ist.");
    }

    const duplicate = await Thema.findOne({
        titel: themaResource.titel,
        betreuer: themaResource.betreuer
    });

    if(duplicate){
        throw new Error("Dieser Betreuer hat bereits ein Thema mit diesem Titel angelegt.");
    }

    const thema = new Thema({
        titel: themaResource.titel,
        beschreibung: themaResource.beschreibung,
        literatur: themaResource.literatur,
        abschluss: themaResource.abschluss,
        gebiet: themaResource.gebiet,
        betreuer: themaResource.betreuer
    });

    await thema.save();

    return {
        id: thema.id,
        titel: thema.titel,
        beschreibung: thema.beschreibung,
        literatur: thema.literatur,
        abschluss: thema.abschluss,
        status: thema.status,
        betreuer: thema.betreuer.toString(),
        gebiet: thema.gebiet.toString(),
        updatedAt: dateToString(thema.updatedAt)
    };
}

/**
 * Updated ein Thema. Es können alle Felder bist auf ID, Gebiet oder Betreuer geändert werden.
 * Aktuell können Themen nicht von einem Gebiet in ein anderes verschoben werden.
 * Auch kann der Betreuer nicht geändert werden.
 * Falls das Gebiet oder Betreuer geändert wurde, wird dies ignoriert.
 */
export async function updateThema(themaResource: ThemaResource): Promise<ThemaResource> {
    const thema = await Thema.findById(themaResource.id).exec();
    if (!thema) {
        throw new Error("Kein Thema mit der ID gefunden.");
    }

    const duplicate = await Thema.findOne({
        titel: themaResource.titel,
        betreuer: thema.betreuer
    }).exec();

    if (duplicate && duplicate.id !== themaResource.id) {
        throw new Error("Die Kombination aus Titel und Betreuer existiert bereits bei einem anderen Thema.");
    }

    thema.titel = themaResource.titel;
    thema.beschreibung = themaResource.beschreibung;
    thema.literatur = themaResource.literatur;
    if (themaResource.abschluss !== undefined && (themaResource.abschluss === 'bsc' || themaResource.abschluss === 'msc')) {
        thema.abschluss = themaResource.abschluss;
    }
    if (themaResource.status !== undefined) {
        thema.status = themaResource.status as "offen" | "reserviert";
    }

    const savedThema = await thema.save();
    return {
        id: savedThema.id,
        titel: savedThema.titel,
        beschreibung: savedThema.beschreibung,
        literatur: savedThema.literatur,
        abschluss: savedThema.abschluss,
        status: savedThema.status,
        betreuer: savedThema.betreuer.toString(),
        gebiet: savedThema.gebiet.toString(),
        updatedAt: dateToString(savedThema.updatedAt)
    };
}

/**
 * Beim Löschen wird das Thema über die ID identifiziert.
 * Falls es nicht gefunden wurde (oder aus
 * anderen Gründen nicht gelöscht werden kann) wird ein Fehler geworfen.
 */
export async function deleteThema(id: string): Promise<void> {
    const themaId = new Types.ObjectId(id);
    const deleteResult = await Thema.deleteOne({ _id: themaId }).exec();
    if (deleteResult.deletedCount !== 1) {
        throw new Error(`No thema with id ${id} deleted, probably id not valid`);
    }
}
