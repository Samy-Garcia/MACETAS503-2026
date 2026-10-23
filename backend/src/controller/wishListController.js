import jsonwebtoken from "jsonwebtoken";

import { config } from "../../config.js";

import wishlistModel from "../models/wishlist.js";
import postModel from "../models/post.js";
import candleModel from "../models/candles.js";
import otherProductModel from "../models/otherProduct.js";
import comboModel from "../models/combo.js";

const wishListController = {};

const getLoggedClientId = (req) => {
    const token = req.cookies.authCookie;
    if (!token) return null;
    try {
        const decoded = jsonwebtoken.verify(token, config.JWT.secret);
        if (decoded.userType !== "client") return null;
        return decoded.id;
    } catch (err) {
        return null;
    }
};

const PRODUCT_MODELS = { maceta: postModel, vela: candleModel, otro: otherProductModel, combo: comboModel };

// Trae (o crea si no existe) la lista automática/default del cliente,
// la que usa el botón de corazón rápido en el detalle de producto.
const getOrCreateDefaultList = async (clientId) => {
    let list = await wishlistModel.findOne({ clientId, isDefault: true });
    if (!list) {
        list = await wishlistModel.create({ clientId, name: "Mi Wishlist", isDefault: true, items: [] });
    }
    return list;
};

// Junta cada item con los datos reales del producto (nombre, imagen, precio)
const enrichItems = async (items) => {
    return Promise.all(items.map(async (item) => {
        const ProductModel = PRODUCT_MODELS[item.productType];
        const product = ProductModel ? await ProductModel.findById(item.productId).select("name price image stock colorOptions") : null;
        return {
            _id: item._id,
            productId: item.productId,
            productType: item.productType,
            addedAt: item.addedAt,
            product
        };
    }));
};


// GET /api/wishlist/mine — todas las listas del cliente, con conteo y miniaturas
wishListController.getMyLists = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);
        if (!clientId) {
            return res.status(401).json({ message: "Debes iniciar sesión" });
        }

        const lists = await wishlistModel.find({ clientId }).sort({ createdAt: 1 });

        const response = await Promise.all(lists.map(async (list) => {
            const previewItems = await enrichItems(list.items.slice(0, 4));
            return {
                _id: list._id,
                name: list.name,
                isDefault: list.isDefault,
                count: list.items.length,
                previewImages: previewItems.filter(i => i.product?.image).map(i => i.product.image)
            };
        }));

        return res.status(200).json(response);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};


// GET /api/wishlist/mine/:listId — una lista específica, con los productos completos
wishListController.getListById = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);
        if (!clientId) {
            return res.status(401).json({ message: "Debes iniciar sesión" });
        }

        const { listId } = req.params;
        const list = await wishlistModel.findOne({ _id: listId, clientId });

        if (!list) {
            return res.status(404).json({ message: "Lista no encontrada" });
        }

        const items = await enrichItems(list.items);

        return res.status(200).json({
            _id: list._id,
            name: list.name,
            isDefault: list.isDefault,
            items
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};


// POST /api/wishlist/lists — crear una lista nueva con nombre
wishListController.createList = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);
        if (!clientId) {
            return res.status(401).json({ message: "Debes iniciar sesión" });
        }

        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ message: "El nombre de la lista es obligatorio" });
        }

        const newList = await wishlistModel.create({ clientId, name: name.trim(), items: [] });

        return res.status(201).json(newList);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};


// DELETE /api/wishlist/lists/:listId — eliminar una lista completa (no la default)
wishListController.deleteList = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);
        if (!clientId) {
            return res.status(401).json({ message: "Debes iniciar sesión" });
        }

        const { listId } = req.params;
        const list = await wishlistModel.findOne({ _id: listId, clientId });

        if (!list) {
            return res.status(404).json({ message: "Lista no encontrada" });
        }

        if (list.isDefault) {
            return res.status(400).json({ message: "No puedes eliminar tu lista principal" });
        }

        await wishlistModel.findByIdAndDelete(listId);

        return res.status(200).json({ message: "Lista eliminada" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};


// DELETE /api/wishlist/lists/:listId/items/:itemId — quitar un producto de una lista
wishListController.removeItem = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);
        if (!clientId) {
            return res.status(401).json({ message: "Debes iniciar sesión" });
        }

        const { listId, itemId } = req.params;
        const list = await wishlistModel.findOne({ _id: listId, clientId });

        if (!list) {
            return res.status(404).json({ message: "Lista no encontrada" });
        }

        list.items.id(itemId)?.deleteOne();
        await list.save();

        return res.status(200).json({ message: "Producto eliminado de la lista" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};


// GET /api/wishlist/favorites — ids de TODOS los productos guardados en cualquier
// lista del cliente (para pintar el corazón lleno en tarjetas/detalle de producto)
wishListController.getFavoriteIds = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);
        if (!clientId) {
            return res.status(200).json([]); // sin sesión, simplemente no hay favoritos que marcar
        }

        const lists = await wishlistModel.find({ clientId });
        const ids = lists.flatMap(list => list.items.map(item => `${item.productType}-${item.productId}`));

        return res.status(200).json([...new Set(ids)]);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};


// POST /api/wishlist/toggle — el ❤️ rápido: si el producto ya está guardado en
// alguna lista lo quita, si no, lo agrega a la lista default (la crea si no existe).
wishListController.toggleFavorite = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);
        if (!clientId) {
            return res.status(401).json({ message: "Debes iniciar sesión para guardar productos" });
        }

        const { productId, productType } = req.body;
        if (!productId || !productType) {
            return res.status(400).json({ message: "productId y productType son obligatorios" });
        }

        const lists = await wishlistModel.find({ clientId });

        let removedFromAny = false;
        for (const list of lists) {
            const item = list.items.find(i => i.productId.toString() === productId && i.productType === productType);
            if (item) {
                item.deleteOne();
                await list.save();
                removedFromAny = true;
            }
        }

        if (removedFromAny) {
            return res.status(200).json({ inWishlist: false });
        }

        const defaultList = await getOrCreateDefaultList(clientId);
        defaultList.items.push({ productId, productType });
        await defaultList.save();

        return res.status(200).json({ inWishlist: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// POST /api/wishlist/lists/:listId/toggle — agrega/quita un producto de UNA
// lista específica (a diferencia de toggleFavorite, que solo usa la default).
wishListController.toggleItemInList = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);
        if (!clientId) {
            return res.status(401).json({ message: "Debes iniciar sesión" });
        }

        const { listId } = req.params;
        const { productId, productType } = req.body;

        if (!productId || !productType) {
            return res.status(400).json({ message: "productId y productType son obligatorios" });
        }

        const list = await wishlistModel.findOne({ _id: listId, clientId });
        if (!list) {
            return res.status(404).json({ message: "Lista no encontrada" });
        }

        const existingItem = list.items.find(i => i.productId.toString() === productId && i.productType === productType);

        if (existingItem) {
            existingItem.deleteOne();
            await list.save();
            return res.status(200).json({ inList: false });
        }

        list.items.push({ productId, productType });
        await list.save();
        return res.status(200).json({ inList: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export default wishListController;
