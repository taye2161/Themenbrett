import { model, Schema, Types } from "mongoose";

export interface IThema {
    titel: string;
    beschreibung: string;
    literatur?: string;
    abschluss: "bsc" | "msc" | "any";
    status: "offen" | "reserviert";
    updatedAt: Date;
    gebiet: Types.ObjectId;
    betreuer: Types.ObjectId;
}

const themaSchema = new Schema<IThema>(
    {
        titel: { type: String, required: true },
        beschreibung: { type: String, required: true },
        literatur: { type: String },
        abschluss: { type: String, enum: ["bsc", "msc", "any"], default: "any" },
        status: { type: String, enum: ["offen", "reserviert"], default: "offen" },
        gebiet: { type: Schema.Types.ObjectId, ref: "Gebiet", required: true },
        betreuer: { type: Schema.Types.ObjectId, ref: "Prof", required: true }
    },
    {
        timestamps: {
            updatedAt: true
        }
    }
);

export const Thema = model("Thema", themaSchema);

export type ThemaDocument = InstanceType<typeof Thema>;