import app from "./app.js";
import connectDB from "./database.js";

// Antes el servidor arrancaba (app.listen) al mismo tiempo que se
// abría la conexión a MongoDB, en paralelo. Eso dejaba una ventana de
// 1-3 segundos (normal con MongoDB Atlas) en la que el backend ya
// aceptaba peticiones pero la base de datos todavía no estaba lista.
//
// Esa ventana se abre CADA VEZ que nodemon reinicia el servidor (o sea,
// muy seguido mientras se está probando/desarrollando). Si el admin
// recargaba la página justo en ese momento, la consulta a /api/loginAdmin/me
// fallaba por la base de datos (no por la sesión), y el frontend
// interpretaba ese error como "no autenticado" y cerraba la sesión, aunque
// la cookie siguiera siendo perfectamente válida.
//
// Ahora esperamos a que Mongo confirme la conexión antes de escuchar en
// el puerto: así nunca hay una ventana en la que el server responda sin
// tener la base de datos lista.
async function main() {
    try {
        await connectDB;

        app.listen(4000, () => {
            console.log("Server on port 4000");
        });
    } catch (error) {
        console.error("No se pudo iniciar el servidor: falló la conexión a MongoDB");
        console.error(error);
        process.exit(1);
    }
}

main();

// Inicia el servidor después de establecer la conexión a la base de datos.