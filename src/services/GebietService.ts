import { profile } from "node:console";
import { Gebiet, GebietDocument } from "../model/GebietModel";
import { GebietResource } from "../Resources";
import { dateToString, stringToDate } from "./ServiceHelper";
import { Types } from "mongoose";
import { Thema } from "../model/ThemaModel";
import { deleteThema } from "./ThemaService";

/**
 * Gibt alle Gebiete zurück, die für einen Prof sichtbar sind. Dies sind:
 * - alle öffentlichen (public) Gebiete
 * - alle eigenen Gebiete, dies ist natürlich nur möglich, wenn die profId angegeben ist.
 */
export async function getAlleGebiete(profId?: string): Promise<GebietResource[]> {
      const publicGebiete = await Gebiet.find({ public: true }).exec();

      let profGebiete: GebietDocument[] = [];

      if(profId){
            profGebiete = await Gebiet.find({
                  verwalter: profId,
                  public: false   
            });
      }

      const alleGebiete = [...publicGebiete, ...profGebiete];

      return alleGebiete.map((gebiet) => ({
            id: gebiet.id,
            name: gebiet.name,
            beschreibung: gebiet.beschreibung,
            public: gebiet.public,
            closed: gebiet.closed,
            createdAt: dateToString(gebiet.createdAt),
            verwalter: gebiet.verwalter.toString()
      }));
}

/**
 * Liefert das Gebiet mit angegebener ID.
 * Falls kein Gebiet gefunden wurde, wird ein Fehler geworfen.
 */
export async function getGebiet(id: string): Promise<GebietResource> {
    const gebiet = await Gebiet.findById(id).exec();

    if(!gebiet){
      throw new Error("Gebiet wurde nicht gefunden.");
    }

    return {
      name: gebiet.name,
      beschreibung: gebiet.beschreibung,
      public: gebiet.public,
      closed: gebiet.closed,
      createdAt: dateToString(gebiet.createdAt),
      verwalter: gebiet.verwalter.toString()
    }
}

/**
 * Erzeugt das Gebiet.
 */
export async function createGebiet(gebietResource: GebietResource): Promise<GebietResource> {
      const gebiet = new Gebiet({
            name: gebietResource.name,
            beschreibung: gebietResource.beschreibung,
            public: gebietResource.public,
            closed: gebietResource.closed,
            createdAt: gebietResource.createdAt,
            verwalter: gebietResource.verwalter
      });

      await gebiet.save()

      return {
            id: gebiet.id,
            name: gebiet.name,
            beschreibung: gebiet.beschreibung,
            public: gebiet.public,
            closed: gebiet.closed,
            createdAt: dateToString(gebiet.createdAt),
            verwalter: gebiet.verwalter.toString()
      }
}

/**
 * Ändert die Daten eines Gebiets.
 * Aktuell können nur folgende Daten geändert werden:
 *       name, beschreibung, public, closed.
 * Falls andere Daten geändert werden, wird dies ignoriert.
 */
export async function updateGebiet(gebietResource: GebietResource): Promise<GebietResource> {
      const gebiet = await Gebiet.findById(gebietResource.id);

      if(!gebiet){
            throw new Error("Kein Gebiet mit der ID gefunden.");
      }

      gebiet.name = gebietResource.name;
      gebiet.beschreibung = gebietResource.beschreibung;
      if(gebietResource.public !== undefined){
            gebiet.public = gebietResource.public;
      }
      if(gebietResource.closed !== undefined){
            gebiet.closed = gebietResource.closed;
      }
      
      const savedGebiet = await gebiet.save();

      return {
            name: savedGebiet.name,
            beschreibung: savedGebiet.beschreibung,
            public: savedGebiet.public,
            closed: savedGebiet.closed,
            createdAt: dateToString(savedGebiet.createdAt),
            verwalter: savedGebiet.verwalter.toString()
      }


}

/**
 * Beim Löschen wird das Gebiet über die ID identifiziert.
 * Dabei werden auch alle Themen in dem Gebiet gelöscht.
 * 
 * Falls ein Gebiet nicht gefunden wurde oder aus anderen Gründen nicht gelöscht werden kann,
 * wird ein Fehler geworfen.
 */
export async function deleteGebiet(id: string): Promise<void> {
      const gebietId = new Types.ObjectId(id);
      const deleteResult = await Gebiet.deleteOne({ _id: gebietId }).exec();
      if (deleteResult.deletedCount !== 1) {
            throw new Error(`No gebiet with id ${id} deleted, probably id not valid`);
      }

      const themen = await Thema.find({ gebiet: gebietId }).exec();
      for(const thema of themen){
            try{
                  await deleteThema(thema.id);
            } catch(err){
                  console.error(err);
            }
      }
}
