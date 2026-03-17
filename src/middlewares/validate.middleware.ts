import type { z, ZodSchema, ZodTypeAny } from "zod";
import type { Request , Response , NextFunction } from "express";
import { AppError } from "../utils/AppError.ts";

type RequestSchema = {
  body?: unknown;
  params?: Record<string, any>;
  query?: Record<string, any>;
};

export function validate<T extends ZodTypeAny>(schema: T){
    return(req: Request, res : Response ,next : NextFunction) => {
        const result = schema.safeParse({
            body: req.body,
            params: req.params,
            query: req.query
        });
        if(!result.success){
            const message = result.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
            return next(new AppError(message, 400));
        }
        const data = result.data as z.infer<T> & RequestSchema;
        if(data.body) req.body = data.body;
        if (data.params) req.params = data.params;
        if (data.query) req.query = data.query;
        next();
    }
}