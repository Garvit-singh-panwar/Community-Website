import express from "express";
import { storage } from "../config/cloudnary.js";
import multer from "multer";

// middlewares
import { auth, studentCheck } from "../middlewares/auth.middleware.js";

// controllers
import { deleteResource, getResourceById, searchResource, uploadResource } from "../controllers/resource.controller.js";

const upload = multer({storage});

const resourceRouter = express.Router();

// routers
resourceRouter.get("/search", auth, searchResource );
resourceRouter.get("/:id" ,auth,getResourceById );
resourceRouter.post("/" , auth , studentCheck , upload.single('file') , uploadResource);
resourceRouter.delete("/:id" , auth , studentCheck , deleteResource);

export default resourceRouter;