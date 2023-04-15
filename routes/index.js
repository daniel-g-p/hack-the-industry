import { Router } from "express";

import controller from "../controllers/index.js";

const router = Router();

router.get("/", controller.get);

router.post("/", controller.post);

export default router;
