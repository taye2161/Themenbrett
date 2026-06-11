import { model, Schema, Types } from "mongoose";

export interface IGebiet {
    name: string;
    beschreibung?: string;
    public: boolean;
    closed: boolean;
    createdAt: Date;
    verwalter: Types.ObjectId;
}

const gebietSchema = new Schema<IGebiet>(
    {
        name: { type: String, required: true, unique: true },
        beschreibung: { type: String },
        public: { type: Boolean, default: false },
        closed: { type: Boolean, default: false },
        verwalter: { type: Schema.Types.ObjectId, ref: "Prof", required: true }
    },
    {
        timestamps: {
            createdAt: true
        }
    }
);

export const Gebiet = model("Gebiet", gebietSchema);

export type GebietDocument = InstanceType<typeof Gebiet>;