import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import { config } from "../../config.js";

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudinary_name,
  api_key: config.cloudinary.cloudinary_api_key,
  api_secret: config.cloudinary.cloudinary_api_secret,
});

// configurar como gaurdar las imágenes en Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "MACETAS", // Carpeta en Cloudinary donde se guardarán las imágenes
    allowed_formats: ["jpg", "jpeg", "png", "gif", "pdf"], // Formatos permitidos
  },
});

// Configuración de Multer para manejar la subida de archivos
const upload = multer({ storage });

export default upload;