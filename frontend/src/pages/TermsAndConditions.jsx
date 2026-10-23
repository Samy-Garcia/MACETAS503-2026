import { useEffect } from "react";
import Footer from "../components/Footer";

export default function TermsAndConditions() {
    useEffect(() => {
        document.title = "Términos y Condiciones | Macetas503";
    }, []);

    return (
        <div className="w-full min-h-screen bg-page font-sans antialiased text-zinc-800 selection:bg-primary-700/10 selection:text-primary-700">

            {/* ================= CONTENIDO ================= */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

                {/* ENCABEZADO */}
                <div className="flex flex-col gap-5 text-left mb-12">
                    <h1 className="text-4xl font-bold text-zinc-900 tracking-tight">
                        Términos y Condiciones
                    </h1>

                    <p className="text-sm text-zinc-600 leading-relaxed font-normal">
                        Bienvenido a Macetas503. Estos términos y condiciones establecen
                        las reglas aplicables al uso de nuestro sitio web, la compra de
                        nuestros productos y los servicios ofrecidos a través de nuestra
                        plataforma.
                    </p>

                    <p className="text-sm text-zinc-600 leading-relaxed font-normal">
                        Te recomendamos leer cuidadosamente esta información antes de
                        utilizar nuestro sitio o realizar una compra.
                    </p>

                    <p className="text-xs text-zinc-400">
                        Última actualización: 11 de agosto de 2026
                    </p>
                </div>

                {/* ================= TÉRMINOS ================= */}
                <div className="flex flex-col gap-10">

                    {/* 1 */}
                    <section>
                        <h2 className="text-2xl font-bold text-zinc-800 tracking-tight border-b border-zinc-100 pb-2 mb-4">
                            1. Aceptación de los términos
                        </h2>

                        <p className="text-sm text-zinc-600 leading-relaxed">
                            Al acceder y utilizar el sitio web de Macetas503, crear una
                            cuenta o realizar una compra, aceptas estos Términos y
                            Condiciones. Si no estás de acuerdo con alguno de ellos, te
                            recomendamos no utilizar nuestros servicios.
                        </p>
                    </section>

                    {/* 2 */}
                    <section>
                        <h2 className="text-2xl font-bold text-zinc-800 tracking-tight border-b border-zinc-100 pb-2 mb-4">
                            2. Uso del sitio web
                        </h2>

                        <p className="text-sm text-zinc-600 leading-relaxed">
                            El sitio web de Macetas503 está destinado a proporcionar
                            información sobre nuestros productos y permitir a los usuarios
                            realizar compras de manera digital.
                        </p>

                        <p className="text-sm text-zinc-600 leading-relaxed mt-3">
                            El usuario se compromete a utilizar la plataforma de forma
                            responsable y únicamente para fines legítimos. No está permitido
                            intentar acceder sin autorización a sistemas, cuentas o
                            información de otros usuarios, introducir código malicioso o
                            realizar actividades que puedan afectar el funcionamiento o
                            seguridad del sitio.
                        </p>
                    </section>

                    {/* 3 */}
                    <section>
                        <h2 className="text-2xl font-bold text-zinc-800 tracking-tight border-b border-zinc-100 pb-2 mb-4">
                            3. Registro y cuenta de usuario
                        </h2>

                        <p className="text-sm text-zinc-600 leading-relaxed">
                            Algunas funciones de la plataforma pueden requerir la creación de
                            una cuenta. El usuario deberá proporcionar información verdadera,
                            completa y actualizada.
                        </p>

                        <p className="text-sm text-zinc-600 leading-relaxed mt-3">
                            El usuario es responsable de mantener la confidencialidad de sus
                            credenciales de acceso y de cualquier actividad realizada desde
                            su cuenta.
                        </p>
                    </section>

                    {/* 4 */}
                    <section>
                        <h2 className="text-2xl font-bold text-zinc-800 tracking-tight border-b border-zinc-100 pb-2 mb-4">
                            4. Productos
                        </h2>

                        <p className="text-sm text-zinc-600 leading-relaxed">
                            Macetas503 procura que las imágenes, descripciones,
                            características y demás información de los productos sean lo más
                            precisas posible.
                        </p>

                        <p className="text-sm text-zinc-600 leading-relaxed mt-3">
                            Sin embargo, pueden existir pequeñas diferencias entre las
                            fotografías mostradas en el sitio y el producto recibido debido
                            a factores como iluminación, configuración de pantalla,
                            materiales, fabricación artesanal o características naturales de
                            las plantas.
                        </p>

                        <p className="text-sm text-zinc-600 leading-relaxed mt-3">
                            La disponibilidad de los productos puede cambiar sin previo
                            aviso.
                        </p>
                    </section>

                    {/* 5 */}
                    <section>
                        <h2 className="text-2xl font-bold text-zinc-800 tracking-tight border-b border-zinc-100 pb-2 mb-4">
                            5. Precios
                        </h2>

                        <p className="text-sm text-zinc-600 leading-relaxed">
                            Los precios mostrados en el sitio corresponden a los productos
                            disponibles al momento de su publicación y pueden cambiar sin
                            previo aviso.
                        </p>

                        <p className="text-sm text-zinc-600 leading-relaxed mt-3">
                            Los costos de envío u otros cargos adicionales serán mostrados
                            durante el proceso de compra cuando correspondan.
                        </p>

                        <p className="text-sm text-zinc-600 leading-relaxed mt-3">
                            En caso de detectarse un error evidente en el precio o
                            información de un producto, Macetas503 podrá verificar la
                            información antes de procesar el pedido.
                        </p>
                    </section>

                    {/* 6 */}
                    <section>
                        <h2 className="text-2xl font-bold text-zinc-800 tracking-tight border-b border-zinc-100 pb-2 mb-4">
                            6. Pedidos y compras
                        </h2>

                        <p className="text-sm text-zinc-600 leading-relaxed">
                            Antes de confirmar una compra, el cliente deberá revisar que los
                            productos seleccionados, cantidades, información de contacto y
                            dirección de entrega sean correctos.
                        </p>

                        <p className="text-sm text-zinc-600 leading-relaxed mt-3">
                            Una vez enviado el pedido, Macetas503 podrá comunicarse con el
                            cliente para confirmar información necesaria para procesar o
                            entregar la compra.
                        </p>
                    </section>

                    {/* 7 */}
                    <section>
                        <h2 className="text-2xl font-bold text-zinc-800 tracking-tight border-b border-zinc-100 pb-2 mb-4">
                            7. Métodos de pago
                        </h2>

                        <p className="text-sm text-zinc-600 leading-relaxed">
                            Los métodos de pago disponibles serán aquellos que se encuentren
                            habilitados en la plataforma al momento de realizar la compra.
                        </p>

                        <p className="text-sm text-zinc-600 leading-relaxed mt-3">
                            El pedido podrá considerarse confirmado una vez que el pago haya
                            sido validado o que se haya confirmado el método de pago
                            correspondiente.
                        </p>
                    </section>

                    {/* 8 */}
                    <section>
                        <h2 className="text-2xl font-bold text-zinc-800 tracking-tight border-b border-zinc-100 pb-2 mb-4">
                            8. Envíos y entregas
                        </h2>

                        <p className="text-sm text-zinc-600 leading-relaxed">
                            Las entregas se realizarán de acuerdo con las zonas y condiciones
                            disponibles durante el proceso de compra.
                        </p>

                        <p className="text-sm text-zinc-600 leading-relaxed mt-3">
                            Los tiempos de entrega proporcionados son estimaciones y pueden
                            verse afectados por factores externos como tráfico, condiciones
                            climáticas, disponibilidad del producto, dificultades para
                            localizar la dirección u otras circunstancias fuera del control
                            de Macetas503.
                        </p>

                        <p className="text-sm text-zinc-600 leading-relaxed mt-3">
                            El cliente deberá proporcionar una dirección correcta y procurar
                            que exista una persona disponible para recibir el pedido cuando
                            sea necesario.
                        </p>
                    </section>

                    {/* 9 */}
                    <section>
                        <h2 className="text-2xl font-bold text-zinc-800 tracking-tight border-b border-zinc-100 pb-2 mb-4">
                            9. Cambios y devoluciones
                        </h2>

                        <p className="text-sm text-zinc-600 leading-relaxed">
                            Las solicitudes relacionadas con cambios, devoluciones o
                            inconvenientes con un pedido deberán comunicarse a Macetas503 a
                            través de nuestros canales oficiales de atención.
                        </p>

                        <p className="text-sm text-zinc-600 leading-relaxed mt-3">
                            Para evaluar una solicitud, podremos solicitar información como
                            número de pedido, fotografías, videos, fecha de compra y una
                            descripción del inconveniente.
                        </p>

                        <p className="text-sm text-zinc-600 leading-relaxed mt-3">
                            Cada caso será evaluado de acuerdo con la naturaleza del
                            producto, las circunstancias del caso y las políticas vigentes.
                        </p>
                    </section>

                    {/* 10 */}
                    <section>
                        <h2 className="text-2xl font-bold text-zinc-800 tracking-tight border-b border-zinc-100 pb-2 mb-4">
                            10. Plantas y productos naturales
                        </h2>

                        <p className="text-sm text-zinc-600 leading-relaxed">
                            Debido a que las plantas son seres vivos, pueden presentar
                            diferencias naturales en tamaño, forma, color, cantidad de hojas
                            y apariencia.
                        </p>

                        <p className="text-sm text-zinc-600 leading-relaxed mt-3">
                            Las recomendaciones de cuidado proporcionadas por Macetas503
                            tienen carácter informativo. El desarrollo y estado de una planta
                            depende de factores como iluminación, temperatura, humedad,
                            ubicación, riego y condiciones ambientales.
                        </p>
                    </section>

                    {/* 11 */}
                    <section>
                        <h2 className="text-2xl font-bold text-zinc-800 tracking-tight border-b border-zinc-100 pb-2 mb-4">
                            11. Promociones y descuentos
                        </h2>

                        <p className="text-sm text-zinc-600 leading-relaxed">
                            Las promociones, descuentos y códigos promocionales pueden estar
                            sujetos a fechas de vigencia, disponibilidad, productos
                            participantes, cantidades limitadas u otras condiciones
                            específicas.
                        </p>

                        <p className="text-sm text-zinc-600 leading-relaxed mt-3">
                            Salvo que se indique expresamente lo contrario, las promociones
                            no son necesariamente acumulables entre sí.
                        </p>
                    </section>

                    {/* 12 */}
                    <section>
                        <h2 className="text-2xl font-bold text-zinc-800 tracking-tight border-b border-zinc-100 pb-2 mb-4">
                            12. Programa de fidelización
                        </h2>

                        <p className="text-sm text-zinc-600 leading-relaxed">
                            Si Macetas503 ofrece un programa de puntos o recompensas, su uso
                            estará sujeto a las condiciones específicas comunicadas dentro de
                            la plataforma.
                        </p>

                        <p className="text-sm text-zinc-600 leading-relaxed mt-3">
                            Los puntos y recompensas pueden estar sujetos a condiciones de
                            acumulación, vencimiento, canje, disponibilidad y modificaciones.
                        </p>
                    </section>

                    {/* 13 */}
                    <section>
                        <h2 className="text-2xl font-bold text-zinc-800 tracking-tight border-b border-zinc-100 pb-2 mb-4">
                            13. Propiedad intelectual
                        </h2>

                        <p className="text-sm text-zinc-600 leading-relaxed">
                            Los logotipos, nombres comerciales, fotografías, diseños, textos,
                            gráficos, interfaces y demás contenido presente en el sitio
                            pertenecen a Macetas503 o son utilizados con la autorización
                            correspondiente.
                        </p>

                        <p className="text-sm text-zinc-600 leading-relaxed mt-3">
                            No está permitido copiar, modificar, distribuir o utilizar estos
                            contenidos con fines comerciales sin autorización previa.
                        </p>
                    </section>

                    {/* 14 */}
                    <section>
                        <h2 className="text-2xl font-bold text-zinc-800 tracking-tight border-b border-zinc-100 pb-2 mb-4">
                            14. Privacidad
                        </h2>

                        <p className="text-sm text-zinc-600 leading-relaxed">
                            La información proporcionada por los usuarios podrá utilizarse
                            para procesar pedidos, gestionar entregas, brindar atención al
                            cliente, mantener la seguridad de la plataforma y proporcionar
                            los servicios solicitados.
                        </p>

                        <p className="text-sm text-zinc-600 leading-relaxed mt-3">
                            El tratamiento de información personal se realizará de acuerdo
                            con las políticas de privacidad aplicables.
                        </p>
                    </section>

                    {/* 15 */}
                    <section>
                        <h2 className="text-2xl font-bold text-zinc-800 tracking-tight border-b border-zinc-100 pb-2 mb-4">
                            15. Enlaces y servicios de terceros
                        </h2>

                        <p className="text-sm text-zinc-600 leading-relaxed">
                            El sitio puede utilizar servicios externos, como plataformas de
                            pago, mapas, redes sociales u otras herramientas necesarias para
                            proporcionar determinadas funcionalidades.
                        </p>

                        <p className="text-sm text-zinc-600 leading-relaxed mt-3">
                            Estos servicios pueden contar con sus propios términos y
                            políticas, por lo que su utilización estará sujeta también a las
                            condiciones establecidas por sus respectivos proveedores.
                        </p>
                    </section>

                    {/* 16 */}
                    <section>
                        <h2 className="text-2xl font-bold text-zinc-800 tracking-tight border-b border-zinc-100 pb-2 mb-4">
                            16. Disponibilidad del sitio
                        </h2>

                        <p className="text-sm text-zinc-600 leading-relaxed">
                            Macetas503 procurará mantener disponible el sitio web y sus
                            servicios. Sin embargo, pueden producirse interrupciones por
                            mantenimiento, actualizaciones, problemas técnicos, fallos de
                            terceros, conectividad u otras circunstancias.
                        </p>
                    </section>

                    {/* 17 */}
                    <section>
                        <h2 className="text-2xl font-bold text-zinc-800 tracking-tight border-b border-zinc-100 pb-2 mb-4">
                            17. Limitación de responsabilidad
                        </h2>

                        <p className="text-sm text-zinc-600 leading-relaxed">
                            Macetas503 procurará brindar información precisa y prestar sus
                            servicios de manera adecuada. Sin embargo, no será responsable por
                            situaciones ocasionadas por circunstancias que se encuentren
                            fuera de su control razonable, como interrupciones de servicios
                            externos, problemas de conectividad, condiciones climáticas,
                            retrasos de terceros o información incorrecta proporcionada por
                            el cliente.
                        </p>

                        <p className="text-sm text-zinc-600 leading-relaxed mt-3">
                            Esta disposición no pretende excluir ni limitar derechos o
                            responsabilidades que no puedan ser excluidos o limitados de
                            acuerdo con la legislación aplicable.
                        </p>
                    </section>

                    {/* 18 */}
                    <section>
                        <h2 className="text-2xl font-bold text-zinc-800 tracking-tight border-b border-zinc-100 pb-2 mb-4">
                            18. Modificación de los términos
                        </h2>

                        <p className="text-sm text-zinc-600 leading-relaxed">
                            Macetas503 podrá actualizar estos Términos y Condiciones cuando
                            sea necesario debido a cambios en sus servicios, procesos,
                            funcionalidades o requisitos aplicables.
                        </p>

                        <p className="text-sm text-zinc-600 leading-relaxed mt-3">
                            La versión vigente será la publicada en esta página. Por ello,
                            recomendamos revisar periódicamente estos términos.
                        </p>
                    </section>

                    {/* 19 */}
                    <section>
                        <h2 className="text-2xl font-bold text-zinc-800 tracking-tight border-b border-zinc-100 pb-2 mb-4">
                            19. Legislación aplicable
                        </h2>

                        <p className="text-sm text-zinc-600 leading-relaxed">
                            Estos Términos y Condiciones se interpretarán de conformidad con
                            las leyes y disposiciones aplicables en la República de
                            El Salvador, sin perjuicio de los derechos que correspondan a
                            los consumidores conforme a la legislación vigente.
                        </p>
                    </section>

                    {/* 20 */}
                    <section>
                        <h2 className="text-2xl font-bold text-zinc-800 tracking-tight border-b border-zinc-100 pb-2 mb-4">
                            20. Contacto
                        </h2>

                        <p className="text-sm text-zinc-600 leading-relaxed">
                            Si tienes preguntas, comentarios o necesitas asistencia
                            relacionada con una compra o con estos términos, puedes
                            comunicarte con Macetas503 mediante nuestros canales oficiales
                            de atención.
                        </p>
                    </section>

                    {/* Aviso */}
                    <div className="mt-2 p-5 bg-primary-700/5 border border-primary-700/10 rounded-lg">
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            <span className="font-semibold text-primary-700">
                                Nota importante:
                            </span>{" "}
                            Estos Términos y Condiciones constituyen un modelo informativo
                            para el sitio web de Macetas503. Se recomienda que el documento
                            sea revisado y adaptado por un profesional legal antes de
                            utilizarse como documento definitivo, especialmente en relación
                            con las obligaciones aplicables al comercio electrónico y los
                            derechos del consumidor en El Salvador.
                        </p>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}

