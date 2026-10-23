import {Schema, model} from "mongoose";

  const plantsSchema = new Schema({
    name: { type: String},
    // Cuidados separados por categoría (antes era un solo bloque de texto)
    careLight: { type: String },
    careWater: { type: String },
    careSoil: { type: String },
    careTemperature: { type: String },
    size: { type: String},
    price: { type: Number},
    stock: { type: Number},
    image: { type: String},
       
},{
    timestamps: true,
    strict: false
});

export default model("Plants", plantsSchema);