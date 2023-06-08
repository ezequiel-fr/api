import { Router } from "express"
import userDB from "./controllers.routes.js";

const router = Router(); 

router.get('/', (req, res) => res.status(200).send("Server is running"));
router.use('/api/v0.1/db', userDB) 

export default router
