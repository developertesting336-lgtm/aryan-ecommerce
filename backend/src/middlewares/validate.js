export const validate = (schema) => {

    return (req, res, next) => {

        const { error } = schema.validate(req.body, {
            abortEarly: false,
            allowUnknown: false
        });


        if (error) {

            const errors = error.details.map((err) => ({
                field: err.path.join("."),
                message: err.message
            }));

            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors
            });
        }


        next();
    };
};