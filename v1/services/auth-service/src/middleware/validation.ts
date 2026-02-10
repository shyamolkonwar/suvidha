import Joi from 'joi';

export const registerSchema = Joi.object({
    consumer_id: Joi.string()
        .min(3)
        .max(50)
        .required()
        .pattern(/^[a-zA-Z0-9_-]+$/)
        .messages({
            'string.pattern.base': 'Consumer ID can only contain letters, numbers, hyphens and underscores',
        }),

    password: Joi.string()
        .min(8)
        .max(100)
        .required()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .messages({
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        }),

    phone: Joi.string()
        .pattern(/^\+?[1-9]\d{1,14}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Invalid phone number format',
        }),

    email: Joi.string()
        .email()
        .optional(),

    language_preference: Joi.string()
        .valid('en', 'hi', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'pa')
        .optional(),
});

export const loginSchema = Joi.object({
    consumer_id: Joi.string().required(),
    password: Joi.string().required(),
    kiosk_id: Joi.string().optional(),
});

export const refreshTokenSchema = Joi.object({
    refresh_token: Joi.string().required(),
});

export const validate = (schema: Joi.ObjectSchema) => {
    return (req: any, res: any, next: any) => {
        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
            }));

            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors,
            });
        }

        next();
    };
};
