import {model, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IProf {
    name: string;
    titel?: string;
    campusID: string;
    password: string;
    admin: boolean;
}

interface IProfMethods {
    isCorrectPassword(candidate: string): Promise<boolean>;
}

type ProfModel = Model<IProf, {}, IProfMethods>;

const profSchema = new Schema<IProf, ProfModel, IProfMethods>({
    name: { type: String, required: true },
    titel: { type: String },
    campusID: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    admin: { type: Boolean, default: false }
});

profSchema.pre('save', async function() {
    if(this.isModified('password')){
        const hashedPassword = await bcrypt.hash(this.password, 10);
        this.password = hashedPassword;
    }
});

profSchema.pre(["findOneAndUpdate", "updateOne"], async function(){
    const update = this.getUpdate();

    if(!update){
        return;
    }

    if('password' in update){
        update.password = await bcrypt.hash(update.password, 10);
    }
});

profSchema.method("isCorrectPassword", async function(candidate: string){
    if(this.password.slice(0, 4) != "$2a$" && this.password.slice(0, 4) != "$2b$"){
        throw new Error("Passwort wurde noch nicht gehashed");
    }

    return await bcrypt.compare(candidate, this.password);
});

export const Prof = model("Prof", profSchema);

export type ProfDocument = InstanceType<typeof Prof>;