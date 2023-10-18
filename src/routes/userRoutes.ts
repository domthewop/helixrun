import { Router, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { User } from '../entities/Users';
import Joi from 'joi';

const router = Router();

/**
 * @route GET /
 * @description Return a list of users
 * @access Public
 */
router.get('/', (req: Request, res: Response) => {
    res.send('List of users');
});

/**
 * @route POST /create
 * @description Create a new user
 * @access Public
 */
router.post('/create', async (req: Request, res: Response) => {
    /**
     * Password validation rules with custom messages for each condition
     */
    const passwordValidation = {
        length: Joi.string().min(8).max(128).message('Password should be between 8 and 128 characters long.'),
        lowercase: Joi.string().pattern(new RegExp('(?=.*[a-z])')).message('Password must contain at least one lowercase letter.'),
        uppercase: Joi.string().pattern(new RegExp('(?=.*[A-Z])')).message('Password must contain at least one uppercase letter.'),
        number: Joi.string().pattern(new RegExp('(?=.*[0-9])')).message('Password must contain at least one number.'),
        specialCharacter: Joi.string().pattern(new RegExp('(?=.*[!@#$%^&*])')).message('Password must contain at least one special character (e.g., @, #, $, %, ^, &, *).')
    };

    /**
     * Interface for potential validation errors that could be returned in the response
     */
    interface ValidationErrorMessages {
        username?: string[];
        password?: string[];
        email?: string[];
    }

    /**
     * JOI validation schema for incoming user data
     */
    const userSchema = Joi.object({
        username: Joi.string().alphanum().min(3).max(30).required(),
        password: Joi.string()
            .required()
            .messages({
                'string.empty': 'Password cannot be empty',
                'string.required': 'Password is required'
            })
            .pattern(new RegExp('^(?=.*[a-z])')) // at least one lowercase letter
            .message('Password must contain at least one lowercase letter')
            .pattern(new RegExp('^(?=.*[A-Z])')) // at least one uppercase letter
            .message('Password must contain at least one uppercase letter')
            .pattern(new RegExp('^(?=.*[0-9])')) // at least one number
            .message('Password must contain at least one number')
            .pattern(new RegExp('^(?=.*[!@#\$%\^&\*])')) // at least one special character
            .message('Password must contain at least one special character')
            .min(8)
            .message('Password must be at least 8 characters long'),
        email: Joi.string().email().required()
    });

    /**
     * Validate the request body using the schema
     */
    const { error } = userSchema.validate(req.body, { abortEarly: false });

    /**
     * Set up a placeholder object for errors from validation
     */
    const errors: ValidationErrorMessages = {
        username: [],
        password: [],
        email: []
    };

    /**
     * Process validation errors, if any, to create a structured error response
     */
    if (error) {
        error.details.forEach((detail) => {
            if (detail.message.includes('Password')) {
                errors.password.push(detail.message);
            } else if (detail.path.includes('username')) {
                errors.username.push(detail.message);
            } else if (detail.path.includes('email')) {
                errors.email.push(detail.message);
            }
        });

        // Remove keys with empty arrays
        Object.keys(errors).forEach(key => {
            if (errors[key as keyof ValidationErrorMessages].length === 0) {
                delete errors[key as keyof ValidationErrorMessages];
            }
        });

        return res.status(400).send(errors);
    } else {
        /**
         * If validation passes, attempt to create the user in the database
         */
        try {
            const userRepository = getRepository(User);
            const user = userRepository.create(req.body); // creates a user instance from request data
            const results = await userRepository.save(user); // saves the user in the database
            return res.status(201).json(results);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
});

module.exports = router;