import type { Request, Response, NextFunction } from "express";

const RATE_LIMIT_WINDOW_MS = 60 * 1000;// 60second
const LIMIT = 5;

const requests = new Map<string, { count: number; start: number }>();

export function rateLimit(req: Request, res: Response, next: NextFunction) {
  const key =typeof req.params.sourcePath === "string"
  ? req.params.sourcePath
  : req.ip || "unknown";

  const now = Date.now();
  const record = requests.get(key);

  if (!record) {
    requests.set(key, { count: 1, start: now });
    return next();
  }
  if (now - record.start > RATE_LIMIT_WINDOW_MS) {
    requests.set(key, { count: 1, start: now });
    return next();
  }

  if (record.count >= LIMIT) {
    return res.status(429).json({
      message: "Rate limit exceeded",
    });
  }
  record.count++;
  next();
}