import announcementBarModel from "../models/announcementBar.js";

const announcementBarController = {};

// GET /api/announcement-bars — todos los banners guardados (admin, para la
// pantalla de gestión)
announcementBarController.getAll = async (req, res) => {
    try {
        const bars = await announcementBarModel.find().sort({ createdAt: -1 });
        return res.status(200).json(bars);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// GET /api/announcement-bars/active — el único banner activo ahora mismo
// (público, lo usa el Navbar de la tienda). Si no hay ninguno activo,
// devuelve null y el frontend usa su mensaje de respaldo.
announcementBarController.getActive = async (req, res) => {
    try {
        const bar = await announcementBarModel.findOne({ active: true });
        return res.status(200).json(bar || null);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// POST /api/announcement-bars — crear un banner nuevo
announcementBarController.create = async (req, res) => {
    try {
        const { text, backgroundColor, textColor, animation, active } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: "El texto del banner es obligatorio" });
        }

        // Si este se marca activo, se desactivan todos los demás -- solo
        // uno puede estar activo al mismo tiempo.
        if (active) {
            await announcementBarModel.updateMany({}, { active: false });
        }

        const bar = await announcementBarModel.create({
            text: text.trim(),
            backgroundColor,
            textColor,
            animation,
            active: !!active
        });

        return res.status(201).json(bar);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// PUT /api/announcement-bars/:id — editar un banner (texto, colores,
// animación, y/o activarlo)
announcementBarController.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { text, backgroundColor, textColor, animation, active } = req.body;

        const bar = await announcementBarModel.findById(id);
        if (!bar) {
            return res.status(404).json({ message: "Banner no encontrado" });
        }

        if (text !== undefined) {
            if (!text.trim()) {
                return res.status(400).json({ message: "El texto del banner es obligatorio" });
            }
            bar.text = text.trim();
        }
        if (backgroundColor !== undefined) bar.backgroundColor = backgroundColor;
        if (textColor !== undefined) bar.textColor = textColor;
        if (animation !== undefined) bar.animation = animation;

        if (active !== undefined) {
            if (active) {
                // Desactiva todos los demás antes de activar este
                await announcementBarModel.updateMany({ _id: { $ne: id } }, { active: false });
            }
            bar.active = !!active;
        }

        await bar.save();

        return res.status(200).json(bar);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// DELETE /api/announcement-bars/:id
announcementBarController.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const bar = await announcementBarModel.findByIdAndDelete(id);

        if (!bar) {
            return res.status(404).json({ message: "Banner no encontrado" });
        }

        return res.status(200).json({ message: "Banner eliminado exitosamente" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export default announcementBarController;

//nota: Este controlador maneja las operaciones CRUD para los banners de anuncios en la aplicación. Incluye métodos para obtener todos los banners, obtener el banner activo, crear un nuevo banner, actualizar un banner existente y eliminar un banner. Además, asegura que solo un banner pueda estar activo a la vez.