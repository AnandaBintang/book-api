import { validationResult } from "express-validator";

export function validate(req, res, next) {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(400).json({
            status: "error",
            message: "Validation failed",
            errors: errors.array()
        });
    }
    next();
}