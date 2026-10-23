import express from "express";
import wishListController from "../controller/wishListController.js";

const router = express.Router();

router.route("/mine").get(wishListController.getMyLists);
router.route("/mine/:listId").get(wishListController.getListById);
router.route("/favorites").get(wishListController.getFavoriteIds);
router.route("/toggle").post(wishListController.toggleFavorite);

router.route("/lists")
    .post(wishListController.createList);

router.route("/lists/:listId/toggle")
    .post(wishListController.toggleItemInList);

router.route("/lists/:listId")
    .delete(wishListController.deleteList);

router.route("/lists/:listId/items/:itemId")
    .delete(wishListController.removeItem);

export default router;
