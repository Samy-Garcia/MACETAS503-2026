// Fecha de hoy (YYYY-MM-DD) en la zona horaria de El Salvador, que es donde
// opera la tienda. El servidor puede estar en UTC, y a partir de las 6:00 p.m.
// hora local UTC ya está en el día siguiente.
export const todayInElSalvador = () =>
    new Date().toLocaleDateString("en-CA", { timeZone: "America/El_Salvador" });

// Normaliza lo que llegue (string "YYYY-MM-DD" o ISO completo) a YYYY-MM-DD.
// Devuelve null si no es una fecha válida.
export const toDateOnly = (value) => {
    if (!value) return null;
    const str = String(value).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
    const d = new Date(`${str}T00:00:00Z`);
    if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== str) return null;
    return str;
};
