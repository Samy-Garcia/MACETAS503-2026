import configModel from "../models/config.js";
import { v2 as cloudinary } from "cloudinary";

//array de funciones
const configController = {};

//GET
configController.getConfig = async (req, res) => {
    try {
        const config = await configModel.find();

        // Validación: Verificar si existen configuraciones en la base de datos
        if (!config || config.length === 0) {
            return res.status(404).json({
                message: "No hay configuraciones registradas"
            });
        }

        return res.status(200).json(config);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error interno del servidor"
        });
    }
};

//INSERT
configController.createConfig = async (req, res) => {
    try {
        const {
            stockMin,
            temporarilyOutOfStock,
            storeLat,
            storeLng,
            pricePerKm,
            announcementText,
            shippingMode,
            fixedShippingCost,
            freeShippingMinAmount
        } = req.body;

        // Validación: Verificar que el stockMin sea obligatorio
        if (stockMin === undefined || stockMin === null) {
            return res.status(400).json({
                message: "El stock mínimo es obligatorio"
            });
        }

        // Validación: Verificar que el stockMin sea un número entero mayor o igual a 0
        if (!Number.isInteger(Number(stockMin)) || stockMin < 0) {
            return res.status(400).json({
                message: "El stock mínimo debe ser un número entero mayor o igual a 0"
            });
        }

        // Validación: Verificar que temporarilyOutOfStock sea un booleano válido
        if (temporarilyOutOfStock === undefined || temporarilyOutOfStock === null) {
            return res.status(400).json({
                message: "El estado de agotamiento temporal es obligatorio"
            });
        }

        // Validación: Verificar que temporarilyOutOfStock sea un booleano
        if (typeof temporarilyOutOfStock !== 'boolean') {
            return res.status(400).json({
                message: "El estado de agotamiento temporal debe ser un valor booleano (true/false)"
            });
        }

        // Validación: Verificar que storeLat y storeLng sean obligatorios
        if (storeLat === undefined || storeLat === null || storeLng === undefined || storeLng === null) {
            return res.status(400).json({
                message: "La ubicación de la tienda (storeLat y storeLng) es obligatoria"
            });
        }

        // Validación: Verificar que storeLat y storeLng sean números válidos
        if (typeof storeLat !== 'number' || typeof storeLng !== 'number') {
            return res.status(400).json({
                message: "storeLat y storeLng deben ser números"
            });
        }

        // Validación: Verificar que pricePerKm sea obligatorio
        if (pricePerKm === undefined || pricePerKm === null) {
            return res.status(400).json({
                message: "El precio por km es obligatorio"
            });
        }

        // Validación: Verificar que pricePerKm sea un número mayor o igual a 0
        if (typeof pricePerKm !== 'number' || pricePerKm < 0) {
            return res.status(400).json({
                message: "El precio por km debe ser un número mayor o igual a 0"
            });
        }

        // Validación: shippingMode debe ser "fixed" o "perKm" si se proporciona
        if (shippingMode !== undefined && !["fixed", "perKm"].includes(shippingMode)) {
            return res.status(400).json({
                message: "El modo de envío debe ser 'fixed' o 'perKm'"
            });
        }

        // Validación: fixedShippingCost debe ser un número >= 0 si se proporciona
        if (fixedShippingCost !== undefined && (typeof fixedShippingCost !== 'number' || fixedShippingCost < 0)) {
            return res.status(400).json({
                message: "El costo fijo de envío debe ser un número mayor o igual a 0"
            });
        }

        // Validación: freeShippingMinAmount debe ser un número >= 0 o null
        if (
            freeShippingMinAmount !== undefined &&
            freeShippingMinAmount !== null &&
            (typeof freeShippingMinAmount !== 'number' || freeShippingMinAmount < 0)
        ) {
            return res.status(400).json({
                message: "El monto mínimo para envío gratis debe ser un número mayor o igual a 0"
            });
        }

        // Validación: Verificar que no exista ya una configuración (solo debe haber una)
        const existingConfig = await configModel.findOne();
        if (existingConfig) {
            return res.status(400).json({
                message: "Ya existe una configuración. Use el método de actualización en lugar de crear una nueva"
            });
        }

        const newConfig = new configModel({
            stockMin,
            temporarilyOutOfStock,
            storeLat,
            storeLng,
            pricePerKm,
            announcementText: announcementText || "",
            shippingMode: shippingMode || "perKm",
            fixedShippingCost: fixedShippingCost || 0,
            freeShippingMinAmount: freeShippingMinAmount ?? null
        });

        await newConfig.save();

        return res.status(201).json({
            message: "Configuración creada exitosamente",
            config: newConfig
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error interno del servidor"
        });
    }
};

//UPDATE
configController.updateConfig = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            stockMin,
            temporarilyOutOfStock,
            storeLat,
            storeLng,
            pricePerKm,
            announcementText,
            shippingMode,
            fixedShippingCost,
            freeShippingMinAmount,
            socialMedia,
            theme
        } = req.body;

        // Validación: Verificar que el ID sea un string válido
        if (!id || typeof id !== 'string') {
            return res.status(400).json({
                message: "El ID de la configuración no es válido"
            });
        }

        // Validación: Verificar que al menos un campo esté siendo actualizado
        if (
            stockMin === undefined &&
            temporarilyOutOfStock === undefined &&
            storeLat === undefined &&
            storeLng === undefined &&
            pricePerKm === undefined &&
            announcementText === undefined &&
            shippingMode === undefined &&
            fixedShippingCost === undefined &&
            freeShippingMinAmount === undefined &&
            socialMedia === undefined &&
            theme === undefined
        ) {
            return res.status(400).json({
                message: "Debe proporcionar al menos un campo para actualizar"
            });
        }

        // Validación: Verificar que el stockMin sea un número entero mayor o igual a 0 si se proporciona
        if (stockMin !== undefined && (!Number.isInteger(Number(stockMin)) || stockMin < 0)) {
            return res.status(400).json({
                message: "El stock mínimo debe ser un número entero mayor o igual a 0"
            });
        }

        // Validación: Verificar que temporarilyOutOfStock sea un booleano si se proporciona
        if (temporarilyOutOfStock !== undefined && typeof temporarilyOutOfStock !== 'boolean') {
            return res.status(400).json({
                message: "El estado de agotamiento temporal debe ser un valor booleano (true/false)"
            });
        }

        // Validación: Verificar que storeLat y storeLng sean números si se proporcionan
        if (storeLat !== undefined && typeof storeLat !== 'number') {
            return res.status(400).json({
                message: "storeLat debe ser un número"
            });
        }

        if (storeLng !== undefined && typeof storeLng !== 'number') {
            return res.status(400).json({
                message: "storeLng debe ser un número"
            });
        }

        // Validación: Verificar que pricePerKm sea un número mayor o igual a 0 si se proporciona
        if (pricePerKm !== undefined && (typeof pricePerKm !== 'number' || pricePerKm < 0)) {
            return res.status(400).json({
                message: "El precio por km debe ser un número mayor o igual a 0"
            });
        }

        // Validación: Verificar que announcementText sea un texto corto si se proporciona
        if (announcementText !== undefined && (typeof announcementText !== 'string' || announcementText.length > 200)) {
            return res.status(400).json({
                message: "El mensaje del banner debe ser un texto de máximo 200 caracteres"
            });
        }

        // Validación: shippingMode debe ser "fixed" o "perKm" si se proporciona
        if (shippingMode !== undefined && !["fixed", "perKm"].includes(shippingMode)) {
            return res.status(400).json({
                message: "El modo de envío debe ser 'fixed' o 'perKm'"
            });
        }

        // Validación: fixedShippingCost debe ser un número >= 0 si se proporciona
        if (fixedShippingCost !== undefined && (typeof fixedShippingCost !== 'number' || fixedShippingCost < 0)) {
            return res.status(400).json({
                message: "El costo fijo de envío debe ser un número mayor o igual a 0"
            });
        }

        // Validación: freeShippingMinAmount debe ser un número >= 0 o null
        if (
            freeShippingMinAmount !== undefined &&
            freeShippingMinAmount !== null &&
            (typeof freeShippingMinAmount !== 'number' || freeShippingMinAmount < 0)
        ) {
            return res.status(400).json({
                message: "El monto mínimo para envío gratis debe ser un número mayor o igual a 0"
            });
        }

        // Validación: socialMedia debe ser un objeto si se proporciona (no
        // se valida el formato exacto de cada URL, solo que sean texto)
        if (socialMedia !== undefined) {
            if (typeof socialMedia !== 'object' || socialMedia === null || Array.isArray(socialMedia)) {
                return res.status(400).json({
                    message: "socialMedia debe ser un objeto con instagram/facebook/tiktok"
                });
            }
            for (const key of ['instagram', 'facebook', 'tiktok']) {
                if (socialMedia[key] !== undefined && typeof socialMedia[key] !== 'string') {
                    return res.status(400).json({
                        message: `El enlace de ${key} debe ser texto`
                    });
                }
            }
        }

        // Validación: theme debe ser un objeto con primaryColor (hex) y/o
        // darkMode (booleano) si se proporciona. logoUrl/logoPublicId NO se
        // actualizan aquí -- eso pasa por el endpoint de subida de logo.
        if (theme !== undefined) {
            if (typeof theme !== 'object' || theme === null || Array.isArray(theme)) {
                return res.status(400).json({
                    message: "theme debe ser un objeto con primaryColor y/o darkMode"
                });
            }
            if (theme.primaryColor !== undefined && !/^#[0-9A-Fa-f]{6}$/.test(theme.primaryColor)) {
                return res.status(400).json({
                    message: "primaryColor debe ser un color hexadecimal válido (ej: #064225)"
                });
            }
            if (theme.backgroundColor !== undefined && !/^#[0-9A-Fa-f]{6}$/.test(theme.backgroundColor)) {
                return res.status(400).json({
                    message: "backgroundColor debe ser un color hexadecimal válido (ej: #fcfdfc)"
                });
            }
            if (theme.surfaceColor !== undefined && !/^#[0-9A-Fa-f]{6}$/.test(theme.surfaceColor)) {
                return res.status(400).json({
                    message: "surfaceColor debe ser un color hexadecimal válido (ej: #ffffff)"
                });
            }
            if (theme.darkMode !== undefined && typeof theme.darkMode !== 'boolean') {
                return res.status(400).json({
                    message: "darkMode debe ser un valor booleano (true/false)"
                });
            }
            if (theme.mode !== undefined && !["default", "personalizado", "festivo"].includes(theme.mode)) {
                return res.status(400).json({
                    message: "mode debe ser 'default', 'personalizado' o 'festivo'"
                });
            }
            // Lista de claves válidas duplicada aquí solo para validar (los
            // colores/emoji de cada festividad viven en el frontend, en
            // utils/festivos.js -- el backend no necesita conocerlos).
            const FESTIVOS_VALIDOS = ["navidad", "anonuevo", "sanvalentin", "diamadre", "halloween", "independencia"];
            if (theme.festivoKey !== undefined && theme.festivoKey !== "" && !FESTIVOS_VALIDOS.includes(theme.festivoKey)) {
                return res.status(400).json({
                    message: "festivoKey no reconocido"
                });
            }
        }

        // Validación: Verificar que la configuración exista
        const configExists = await configModel.findById(id);
        if (!configExists) {
            return res.status(404).json({
                message: "Configuración no encontrada"
            });
        }

        // theme se combina con lo que ya existía (para no borrar logoUrl al
        // guardar solo el color, por ejemplo) en vez de reemplazarlo entero.
        const updateData = {
            stockMin,
            temporarilyOutOfStock,
            storeLat,
            storeLng,
            pricePerKm,
            announcementText,
            shippingMode,
            fixedShippingCost,
            freeShippingMinAmount,
            socialMedia
        };
        if (theme !== undefined) {
            const themeActual = configExists.theme || {};
            updateData.theme = {
                primaryColor: theme.primaryColor ?? themeActual.primaryColor ?? "#064225",
                backgroundColor: theme.backgroundColor ?? themeActual.backgroundColor ?? "#fcfdfc",
                surfaceColor: theme.surfaceColor ?? themeActual.surfaceColor ?? "#ffffff",
                darkMode: theme.darkMode ?? themeActual.darkMode ?? false,
                mode: theme.mode ?? themeActual.mode ?? "default",
                festivoKey: theme.festivoKey ?? themeActual.festivoKey ?? "",
                logoUrl: themeActual.logoUrl ?? "",
                logoPublicId: themeActual.logoPublicId ?? ""
            };
        }

        const updatedConfig = await configModel.findByIdAndUpdate(id, updateData, { new: true });

        return res.status(200).json({
            message: "Configuración actualizada exitosamente",
            config: updatedConfig
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error interno del servidor"
        });
    }
};

//DELETE
configController.deleteConfig = async (req, res) => {
    try {
        const { id } = req.params;

        // Validación: Verificar que el ID sea un string válido
        if (!id || typeof id !== 'string') {
            return res.status(400).json({
                message: "El ID de la configuración no es válido"
            });
        }

        // Validación: Verificar que la configuración exista antes de eliminar
        const configExists = await configModel.findById(id);
        if (!configExists) {
            return res.status(404).json({
                message: "Configuración no encontrada"
            });
        }

        const deletedConfig = await configModel.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Configuración eliminada exitosamente",
            config: deletedConfig
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error interno del servidor"
        });
    }
};

// AGREGAR imágenes del carrusel del inicio (hasta 6 en total, sumando las
// que ya existían). El middleware de multer/cloudinary (upload.array) ya
// dejó los archivos subidos en req.files antes de llegar aquí.
configController.addHeroImages = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "Debes seleccionar al menos una imagen" });
        }

        const configExists = await configModel.findById(id);
        if (!configExists) {
            return res.status(404).json({ message: "Configuración no encontrada" });
        }

        const existentes = configExists.heroImages || [];
        if (existentes.length + req.files.length > 6) {
            return res.status(400).json({
                message: `Máximo 6 imágenes en el carrusel. Ya tienes ${existentes.length}, solo puedes agregar ${6 - existentes.length} más.`
            });
        }

        const nuevas = req.files.map(file => ({ url: file.path, public_id: file.filename }));

        const updatedConfig = await configModel.findByIdAndUpdate(
            id,
            { $push: { heroImages: { $each: nuevas } } },
            { new: true }
        );

        return res.status(200).json({
            message: "Imágenes agregadas exitosamente",
            config: updatedConfig
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// QUITAR una imagen del carrusel (borra también el archivo real en Cloudinary)
configController.removeHeroImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { public_id } = req.body;

        if (!public_id) {
            return res.status(400).json({ message: "Falta el public_id de la imagen a eliminar" });
        }

        const configExists = await configModel.findById(id);
        if (!configExists) {
            return res.status(404).json({ message: "Configuración no encontrada" });
        }

        await cloudinary.uploader.destroy(public_id);

        const updatedConfig = await configModel.findByIdAndUpdate(
            id,
            { $pull: { heroImages: { public_id } } },
            { new: true }
        );

        return res.status(200).json({
            message: "Imagen eliminada exitosamente",
            config: updatedConfig
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// ACTUALIZAR el texto superpuesto de una imagen del carrusel (título,
// subtítulo, texto y link del botón "Comprar ahora"). No toca la imagen en
// sí, solo el texto que se muestra encima.
configController.updateHeroImage = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            public_id,
            imagePositionX, imagePositionY, imageZoom,
            title, titleFontFamily, titlePositionX, titlePositionY,
            subtitle, subtitleFontFamily, subtitlePositionX, subtitlePositionY,
            buttons
        } = req.body;

        if (!public_id) {
            return res.status(400).json({ message: "Falta el public_id de la imagen a actualizar" });
        }

        // Validación básica: buttons debe ser un arreglo si se manda
        if (buttons !== undefined && !Array.isArray(buttons)) {
            return res.status(400).json({ message: "buttons debe ser un arreglo" });
        }

        const configExists = await configModel.findById(id);
        if (!configExists) {
            return res.status(404).json({ message: "Configuración no encontrada" });
        }

        const imagen = (configExists.heroImages || []).find(img => img.public_id === public_id);
        if (!imagen) {
            return res.status(404).json({ message: "Imagen no encontrada en el carrusel" });
        }

        const updatedConfig = await configModel.findOneAndUpdate(
            { _id: id, "heroImages.public_id": public_id },
            {
                $set: {
                    "heroImages.$.imagePositionX": imagePositionX ?? 50,
                    "heroImages.$.imagePositionY": imagePositionY ?? 50,
                    "heroImages.$.imageZoom": imageZoom ?? 100,
                    "heroImages.$.title": title ?? "",
                    "heroImages.$.titleFontFamily": titleFontFamily ?? "",
                    "heroImages.$.titlePositionX": titlePositionX ?? 50,
                    "heroImages.$.titlePositionY": titlePositionY ?? 35,

                    "heroImages.$.subtitle": subtitle ?? "",
                    "heroImages.$.subtitleFontFamily": subtitleFontFamily ?? "",
                    "heroImages.$.subtitlePositionX": subtitlePositionX ?? 50,
                    "heroImages.$.subtitlePositionY": subtitlePositionY ?? 50,

                    "heroImages.$.buttons": (buttons || []).map(b => ({
                        text: b.text ?? "",
                        link: b.link ?? "",
                        fontFamily: b.fontFamily ?? "",
                        positionX: b.positionX ?? 50,
                        positionY: b.positionY ?? 65
                    }))
                }
            },
            { new: true }
        );

        return res.status(200).json({
            message: "Texto de la imagen actualizado exitosamente",
            config: updatedConfig
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// REORDENAR las imágenes del carrusel (el admin las mueve con flechas
// arriba/abajo; el frontend manda el arreglo completo ya en el nuevo orden)
configController.reorderHeroImages = async (req, res) => {
    try {
        const { id } = req.params;
        const { publicIds } = req.body;

        if (!Array.isArray(publicIds) || publicIds.length === 0) {
            return res.status(400).json({ message: "Debes enviar el nuevo orden de las imágenes" });
        }

        const configExists = await configModel.findById(id);
        if (!configExists) {
            return res.status(404).json({ message: "Configuración no encontrada" });
        }

        const actuales = configExists.heroImages || [];

        // Validación: el orden nuevo debe tener exactamente las mismas imágenes
        // que ya existen, solo cambia el orden (no se agregan ni quitan aquí)
        const idsActuales = actuales.map(img => img.public_id).sort();
        const idsNuevos = [...publicIds].sort();
        if (JSON.stringify(idsActuales) !== JSON.stringify(idsNuevos)) {
            return res.status(400).json({ message: "El orden enviado no coincide con las imágenes actuales" });
        }

        const reordenadas = publicIds.map(pid => actuales.find(img => img.public_id === pid));

        const updatedConfig = await configModel.findByIdAndUpdate(
            id,
            { heroImages: reordenadas },
            { new: true }
        );

        return res.status(200).json({
            message: "Orden actualizado exitosamente",
            config: updatedConfig
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// AGREGAR un punto de recogida en tienda (dirección donde el cliente puede
// pasar a recoger su pedido cuando la emprendedora no puede llevarlo).
configController.addPickupLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, address, lat, lng } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "El nombre del punto de recogida es obligatorio" });
        }
        if (!address || !address.trim()) {
            return res.status(400).json({ message: "La dirección es obligatoria" });
        }
        if (lat !== undefined && lat !== null && typeof lat !== 'number') {
            return res.status(400).json({ message: "lat debe ser un número" });
        }
        if (lng !== undefined && lng !== null && typeof lng !== 'number') {
            return res.status(400).json({ message: "lng debe ser un número" });
        }

        const configExists = await configModel.findById(id);
        if (!configExists) {
            return res.status(404).json({ message: "Configuración no encontrada" });
        }

        const updatedConfig = await configModel.findByIdAndUpdate(
            id,
            {
                $push: {
                    pickupLocations: {
                        name: name.trim(),
                        address: address.trim(),
                        lat: lat ?? undefined,
                        lng: lng ?? undefined,
                        isActive: true
                    }
                }
            },
            { new: true }
        );

        return res.status(201).json({
            message: "Punto de recogida agregado exitosamente",
            config: updatedConfig
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// ACTUALIZAR un punto de recogida (nombre, dirección, coordenadas y/o si
// está activo -- se puede desactivar temporalmente sin borrarlo, por
// ejemplo si esa sucursal cierra unos días).
configController.updatePickupLocation = async (req, res) => {
    try {
        const { id, locationId } = req.params;
        const { name, address, lat, lng, isActive } = req.body;

        const configExists = await configModel.findById(id);
        if (!configExists) {
            return res.status(404).json({ message: "Configuración no encontrada" });
        }

        const location = configExists.pickupLocations.id(locationId);
        if (!location) {
            return res.status(404).json({ message: "Punto de recogida no encontrado" });
        }

        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({ message: "El nombre del punto de recogida no puede quedar vacío" });
            }
            location.name = name.trim();
        }
        if (address !== undefined) {
            if (!address.trim()) {
                return res.status(400).json({ message: "La dirección no puede quedar vacía" });
            }
            location.address = address.trim();
        }
        if (lat !== undefined) location.lat = lat;
        if (lng !== undefined) location.lng = lng;
        if (isActive !== undefined) {
            if (typeof isActive !== 'boolean') {
                return res.status(400).json({ message: "isActive debe ser un valor booleano (true/false)" });
            }
            location.isActive = isActive;
        }

        await configExists.save();

        return res.status(200).json({
            message: "Punto de recogida actualizado exitosamente",
            config: configExists
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// ELIMINAR un punto de recogida
configController.removePickupLocation = async (req, res) => {
    try {
        const { id, locationId } = req.params;

        const configExists = await configModel.findById(id);
        if (!configExists) {
            return res.status(404).json({ message: "Configuración no encontrada" });
        }

        const location = configExists.pickupLocations.id(locationId);
        if (!location) {
            return res.status(404).json({ message: "Punto de recogida no encontrado" });
        }

        location.deleteOne();
        await configExists.save();

        return res.status(200).json({
            message: "Punto de recogida eliminado exitosamente",
            config: configExists
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export default configController;

// SUBIR/REEMPLAZAR el logo del sitio. Si ya había uno, se borra el anterior
// en Cloudinary para no dejar archivos huérfanos.
configController.updateThemeLogo = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({ message: "Debes seleccionar una imagen para el logo" });
        }

        const configExists = await configModel.findById(id);
        if (!configExists) {
            return res.status(404).json({ message: "Configuración no encontrada" });
        }

        const logoAnteriorId = configExists.theme?.logoPublicId;

        const updatedConfig = await configModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    "theme.logoUrl": req.file.path,
                    "theme.logoPublicId": req.file.filename
                }
            },
            { new: true }
        );

        if (logoAnteriorId) {
            await cloudinary.uploader.destroy(logoAnteriorId);
        }

        return res.status(200).json({
            message: "Logo actualizado exitosamente",
            config: updatedConfig
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// QUITAR el logo personalizado (vuelve a usar el logo por defecto del código)
configController.removeThemeLogo = async (req, res) => {
    try {
        const { id } = req.params;

        const configExists = await configModel.findById(id);
        if (!configExists) {
            return res.status(404).json({ message: "Configuración no encontrada" });
        }

        const logoPublicId = configExists.theme?.logoPublicId;
        if (logoPublicId) {
            await cloudinary.uploader.destroy(logoPublicId);
        }

        const updatedConfig = await configModel.findByIdAndUpdate(
            id,
            { $set: { "theme.logoUrl": "", "theme.logoPublicId": "" } },
            { new: true }
        );

        return res.status(200).json({
            message: "Logo eliminado exitosamente",
            config: updatedConfig
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};