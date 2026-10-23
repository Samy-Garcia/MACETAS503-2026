import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
// Importar CloudinaryConfig asegura que cloudinary.config() ya se ejecutó.
import "./CloudinaryConfig.js";

// Subida específica para fotos de perfil: solo imágenes (el upload general
// también aceptaba PDF y GIF), máximo 5 MB, y carpeta propia en Cloudinary.
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "MACETAS/perfiles",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 600, height: 600, crop: "limit" }],
  },
});

const uploader = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpe?g|png|webp)$/.test(file.mimetype)) return cb(null, true);
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "photo"));
  },
});

// Middleware: sin esto, cualquier error de multer/Cloudinary terminaba en una
// página de error en HTML y el frontend mostraba un mensaje genérico.
export const uploadProfilePhoto = (req, res, next) => {
  uploader.single("photo")(req, res, (err) => {
    if (!err) return next();
    console.log("error al subir la foto de perfil:", err);
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "La foto no puede pesar más de 5 MB." });
      }
      return res.status(400).json({ message: "La foto debe ser una imagen JPG, PNG o WEBP." });
    }
    return res.status(500).json({ message: "No se pudo subir la foto. Intenta de nuevo." });
  });
};

// Borra una foto anterior de Cloudinary sin romper la petición si falla.
export const deleteCloudinaryPhoto = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.log("no se pudo borrar la foto anterior:", err.message);
  }
};
