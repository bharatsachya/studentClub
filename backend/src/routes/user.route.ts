import {Router} from 'express';
import {loginUser, registerUser,logoutUser,refreshAcessToken} from '../controllers/user.controller.js';
import { upload } from '../middleware/multer.middleware';
import { verifyJWT } from '../middleware/auth.middleware';
const router = Router();

router.post("/register",
  upload.fields([
      {
        name:'avatar',
        maxCount:1
      },
      {
         name:'coverImage',
         maxCount:1
      }
  ]),
  registerUser
);



router.route("/hello").get((req, res)=>{
  res.send("Hello from user route");
})

router.route('/login').post(loginUser)

router.route('/logout').post(verifyJWT,logoutUser)

router.route('/refresh-token').post(refreshAcessToken)

export default router;