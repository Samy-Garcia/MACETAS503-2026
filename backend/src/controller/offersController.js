import offersModel from "../models/offers.js";
import postModel from "../models/post.js";
import candleModel from "../models/candles.js";
import otherProductModel from "../models/otherProduct.js";

const offersController = {};

// Según el tipo, busca en la colección real correspondiente
const getProductModel = (productType) => {
    if (productType === "maceta") return postModel;
    if (productType === "vela") return candleModel;
    if (productType === "otro") return otherProductModel;
    return null;
};

// Junta cada oferta con los datos reales (nombre, imagen, precio, stock) del
// producto al que apunta, y calcula el precio ya con el descuento aplicado.
const enrichOffer = async (offer) => {
    const ProductModel = getProductModel(offer.productType);
    if (!ProductModel) return { ...offer.toObject(), product: null };

    const product = await ProductModel.findById(offer.productId);

    if (!product) {
        // El producto fue eliminado pero la oferta sigue existiendo
        return { ...offer.toObject(), product: null, discountedPrice: null };
    }

    const price = Number(product.price) || 0;
    const discountedPrice = Number((price - (price * offer.discountPercentage) / 100).toFixed(2));

    return {
        ...offer.toObject(),
        product: {
            _id: product._id,
            name: product.name,
            image: product.image,
            price,
            stock: product.stock
        },
        discountedPrice
    };
};

//GET
offersController.getAll = async (req, res) => {
    try {
        const offers = await offersModel.find();
        const enriched = await Promise.all(offers.map(enrichOffer));
        res.status(200).json(enriched);
    } catch (error) {
        console.log("error" + error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

//POST
offersController.create = async (req, res) => {
    try {
        const { productId, productType, discountPercentage, status } = req.body;

        //================ VALIDACIONES =================

        if (!productId || !productType || discountPercentage === undefined || discountPercentage === null || discountPercentage === '') {
            return res.status(400).json({ message: "El producto y el porcentaje de descuento son obligatorios" });
        }

        if (!["maceta", "vela", "otro"].includes(productType)) {
            return res.status(400).json({ message: "Tipo de producto inválido" });
        }

        if (isNaN(discountPercentage) || discountPercentage <= 0 || discountPercentage > 100) {
            return res.status(400).json({ message: "El descuento debe ser un número entre 1 y 100" });
        }

        const ProductModel = getProductModel(productType);
        const productExists = await ProductModel.findById(productId);

        if (!productExists) {
            return res.status(404).json({ message: "El producto seleccionado no existe" });
        }

        //===============================================

        const newOffer = new offersModel({
            productId,
            productType,
            discountPercentage,
            status: status !== undefined ? status : true
        });

        await newOffer.save();

        const enriched = await enrichOffer(newOffer);

        res.status(201).json({ message: "Oferta creada exitosamente", offer: enriched });
    } catch (error) {
        console.log("error" + error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

//DELETE
offersController.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const offerToDelete = await offersModel.findById(id);

        if (!offerToDelete) {
            return res.status(404).json({ message: "Oferta no encontrada" });
        }

        await offersModel.findByIdAndDelete(id);
        res.status(200).json({ message: "Oferta eliminada exitosamente" });
    } catch (error) {
        console.log("error" + error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

//PUT
offersController.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { productId, productType, discountPercentage, status } = req.body;

        const offerToUpdate = await offersModel.findById(id);

        if (!offerToUpdate) {
            return res.status(404).json({ message: "Oferta no encontrada" });
        }

        if (productType && !["maceta", "vela", "otro"].includes(productType)) {
            return res.status(400).json({ message: "Tipo de producto inválido" });
        }

        if (discountPercentage !== undefined && (isNaN(discountPercentage) || discountPercentage <= 0 || discountPercentage > 100)) {
            return res.status(400).json({ message: "El descuento debe ser un número entre 1 y 100" });
        }

        const finalProductType = productType || offerToUpdate.productType;
        const finalProductId = productId || offerToUpdate.productId;

        if (productId || productType) {
            const ProductModel = getProductModel(finalProductType);
            const productExists = await ProductModel.findById(finalProductId);
            if (!productExists) {
                return res.status(404).json({ message: "El producto seleccionado no existe" });
            }
        }

        const updatedData = {
            productId: finalProductId,
            productType: finalProductType,
            discountPercentage: discountPercentage !== undefined ? discountPercentage : offerToUpdate.discountPercentage,
            status: status !== undefined ? status : offerToUpdate.status
        };

        const updatedOffer = await offersModel.findByIdAndUpdate(id, updatedData, { new: true });
        const enriched = await enrichOffer(updatedOffer);

        return res.status(200).json({ message: "Oferta actualizada exitosamente", offer: enriched });
    } catch (error) {
        console.log("error" + error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

export default offersController;
