import { Request, Response, NextFunction } from "express";

const asyncHandler = (requestHandler: (req: Request, res: Response, next: NextFunction) => any) => {
     return (req: Request, res: Response, next: NextFunction) => {
     Promise.resolve(
            requestHandler(req, res, next)    
        ).catch((err) => next(err));
    }
}


// const asynchandler = (fn)=>async () =>{
//      try{
//          await fn(req,res,next);
//      }
//      catch(error){
//         res.status(error.code || 500).json({
//             sucess:false,
//             message:error.message || "Internal Server Error"
//         })
//      }
// }

export  {asyncHandler};