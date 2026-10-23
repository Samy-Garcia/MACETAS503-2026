import mongoose from "mongoose";
import { config } from "./config.js";

// La cadena de conexión ya no está escrita en el código: viene de DB_URI en el .env
const connectDB = mongoose.connect(config.db.uri);

const connection = mongoose.connection;

connection.on("disconnected", () => {
    console.error("Desconectado de MongoDB");
});

connection.once("open", () => {
    console.log("Conectado a MongoDB");
});

connection.on("error", (error) => {
    console.error("Error de conexión a MongoDB:" + error);
});

// index.js espera esta promesa antes de empezar a aceptar peticiones HTTP,
// para que el servidor nunca reciba una request (por ejemplo /me al recargar
// el admin) antes de que Mongo esté realmente listo.
export default connectDB;
