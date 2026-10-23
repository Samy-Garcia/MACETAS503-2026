import {Schema, model} from "mongoose";

  const servicesSchema = new Schema({
    name: { type: String},
    description: { type: String},  
    price: { type: Number},
   
},{
    timestamps: true,
    strict: false
});

export default model("Services", servicesSchema);