const Joi = require('joi');

/**
 * Returns Express middleware that validates `req[property]` against a Joi schema.
 * @param {Joi.ObjectSchema} schema
 * @param {'body'|'query'|'params'} property
 */
function validate(schema, property = 'body') {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const details = error.details.map((d) => d.message);
            return res.status(400).json({ error: 'Validation failed', details });
        }

        // Replace with sanitised values
        req[property] = value;
        next();
    };
}

module.exports = validate;
