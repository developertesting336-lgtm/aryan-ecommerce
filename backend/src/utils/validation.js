import Joi from "joi";

export const registerSchema = Joi.object({
    email: Joi.string()
        .email()
        .required(),

    firstName: Joi.string()
        .min(2)
        .max(50)
        .required(),

    lastName: Joi.string()
        .min(2)
        .max(50)
        .required(),

    password: Joi.string()
        .min(6)
        .required(),
        role:Joi.string().required()
});

export const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            "string.empty": "Email is required",
            "string.email": "Please enter a valid email",
            "any.required": "Email is required"
        }),

    password: Joi.string()
        .min(6)
        .required()
        .messages({
            "string.empty": "Password is required",
            "string.min": "Password must be at least 6 characters",
            "any.required": "Password is required"
        })
});




export const createProductSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(150)
        .required()
        .messages({
            "string.empty": "Product name is required",
            "string.min": "Product name must be at least 2 characters",
            "string.max": "Product name cannot exceed 150 characters",
            "any.required": "Product name is required",
        }),

    description: Joi.string()
        .trim()
        .min(10)
        .max(5000)
        .required()
        .messages({
            "string.empty": "Product description is required",
            "string.min": "Product description must be at least 10 characters",
            "string.max": "Product description cannot exceed 5000 characters",
            "any.required": "Product description is required",
        }),

    category: Joi.string()
        .trim()
        .required()
        .messages({
            "string.empty": "Category is required",
            "any.required": "Category is required",
        }),

    brand: Joi.string()
        .trim()
        .max(100)
        .allow("", null)
        .optional()
        .messages({
            "string.max": "Brand cannot exceed 100 characters",
        }),

    price: Joi.number()
        .strict(false)
        .positive()
        .precision(2)
        .required()
        .messages({
            "number.base": "Price must be a valid number",
            "number.positive": "Price must be greater than 0",
            "any.required": "Price is required",
        }),

    mrp: Joi.number()
        .strict(false)
        .positive()
        .precision(2)
        .optional()
        .allow(null, "")
        .messages({
            "number.base": "MRP must be a valid number",
            "number.positive": "MRP must be greater than 0",
        }),

    stock: Joi.number()
        .strict(false)
        .integer()
        .min(0)
        .default(0)
        .messages({
            "number.base": "Stock must be a valid number",
            "number.integer": "Stock must be a whole number",
            "number.min": "Stock cannot be negative",
        }),

    sku: Joi.string()
        .trim()
        .max(100)
        .allow("", null)
        .optional()
        .messages({
            "string.max": "SKU cannot exceed 100 characters",
        }),

    accessories: Joi.alternatives()
        .try(
            Joi.array().items(
                Joi.string().trim()
            ),
            Joi.string()
        )
        .optional()
        .allow("", null),
});