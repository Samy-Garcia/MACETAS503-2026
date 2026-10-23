const OSRM_BASE_URL = "https://router.project-osrm.org";

export const obtenerRuta = async (req, res) => {
  try {
    const { origen, destino } = req.query;

    if (!origen || !destino) {
      return res.status(400).json({
        error: 'Debes enviar los parámetros "origen" y "destino" en formato lng,lat',
      });
    }

    const url = `${OSRM_BASE_URL}/route/v1/driving/${origen};${destino}?overview=full&geometries=geojson`;

    const respuestaOSRM = await fetch(url);
    const data = await respuestaOSRM.json();

    if (data.code !== "Ok") {
      return res.status(400).json({ error: "No se pudo calcular la ruta", detalle: data });
    }

    const ruta = data.routes[0];

    res.json({
      distanciaMetros: ruta.distance,
      duracionSegundos: ruta.duration,
      geometria: ruta.geometry,
    });
  } catch (error) {
    console.error("Error calculando ruta:", error);
    res.status(500).json({ error: "Error interno al calcular la ruta" });
  }
};
