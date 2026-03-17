import type { Request , Response ,NextFunction } from "express";
import { AppError } from "../utils/AppError.ts";

export function errorMiddleware(err : any , req : Request , res : Response , next : NextFunction){
    console.error("ERROR:" , err);
    if(err instanceof AppError){
        return res.status(err.statusCode).json({
            message : err.message,
        })
    }
    return res.status(500).json({
        message : "Internal Server Error",
    })
}