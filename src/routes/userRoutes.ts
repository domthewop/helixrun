import {Request, Response, Router} from 'express';
import {getRepository, MoreThan} from 'typeorm';
import {User} from '../entities/Users';
import Joi from 'joi';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { MailgunService } from '../lib/email/MailgunService';

dotenv.config();

const router = Router();

/**
 * User login route.
 * @route POST /login
 * @param req - Express user request with email and password
 * @param res - Express response, returns JWT on successful login
 * @returns JWT token or error message
 */
router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Find the user by email
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { email } });

    // If user not found, return error
    if (!user) {
        return res.status(401).json({ email: ['User not found'] });
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);

    // If password doesn't match, return error
    if (!isMatch) {
        return res.status(401).json({ password: ['Incorrect password'] });
    }

    // User is authenticated, create JWT token
    const payload = {
        userId: user.id,
        email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' });

    return res.json({ token });
});

/**
 * @route POST /create
 * @description Create a new user
 * @access Public
 */
router.post('/create', async (req: Request, res: Response) => {
    /**
     * Set up a placeholder object for errors from user creation
     */
    const errors: ValidationErrorMessages = {
        username: [],
        password: [],
        email: []
    };

    /**
     * Check if a user with the provided email already exists
     */

    const userRepository = getRepository(User);
    const existingUser = await userRepository.findOne({ where:{ email: req.body.email } });

    if (existingUser) {
        errors.email.push('A user with this email already exists.');
        return res.status(400).json(errors);
    }

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
         * If email is unique and validation passes, attempt to create the user in the database
         */

        /**
         * Salt and hash the password before saving to the database.
         *
         * @param password The user's plain text password.
         * @returns A promise that resolves with the hashed password.
         */
        const hashPassword = async (password: string): Promise<string> => {
            const saltRounds = 10; // Recommended number of salt rounds.
            return bcrypt.hash(password, saltRounds);
        };

        req.body.password = await hashPassword(req.body.password);

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

/**
 * Initiate password reset process for a user.
 * @route POST /request-reset
 * @param req - Express user request with the user's email
 * @param res - Express response
 */
router.post('/request-reset', async (req: Request, res: Response) => {
    const { email } = req.body;

    // Ensure email is provided and valid
    if (!email || !Joi.string().email().validate(email).value) {
        return res.status(400).json({ email: ['Email is required and must be valid'] });
    }

    const user = await getRepository(User).findOne({ where: { email } });

    if (!user) {
        return res.status(404).json({ email: ['User not found'] });
    } else {
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetExpires = new Date();
        resetExpires.setHours(resetExpires.getHours() + 1); // Token expires in 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetExpires;

        await getRepository(User).save(user);

        const result = await sendPasswordResetEmail(email, resetToken);

        res.status(200).json({ result: result });
    }
});

/**
 * Handle password reset based on a provided reset token.
 *
 * @route POST /reset-password/:token
 * @param {Request} req - Express request object with parameters and body.
 * @param {Response} res - Express response object for sending back data to the user.
 *
 * @returns {Response} 200 - On successful password reset.
 * @returns {Response} 400 - On invalid email format, invalid/expired reset token, or invalid new password.
 * @returns {Response} 500 - On internal server errors.
 */
router.post('/reset-password/:token', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const resetToken = req.params.token;

    // Ensure email is provided and valid
    if (!email || !Joi.string().email().validate(email).value) {
        return res.status(400).json({ email: ['Email is required and must be valid'] });
    } else {
        // Fetch the user with the provided email and reset token
        const user = await getRepository(User).findOne({
            where: {
                email: email,
                resetPasswordToken: resetToken,
                resetPasswordExpires: MoreThan(new Date())
            }
        });

        // Check if a valid user was found
        if (!user) {
            return res.status(400).json({token: ['Invalid or expired token, or user not found']});
        }

        // Hash the new password
        user.password = await bcrypt.hash(password, 12);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        // Validate newPassword with Joi validation
        const passwordSchema = Joi.string()
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
            .message('Password must be at least 8 characters long');

        const {error} = passwordSchema.validate(password);

        // Handle password validation errors
        if (error) {
            const errorMessage = error.details.map(detail => detail.message);
            return res.status(400).json({error: errorMessage});
        } else {
            try {
                // Save the updated user details
                await getRepository(User).save(user);

                res.status(200).send('Password successfully reset.');
            } catch (error) {
                return res.status(500).json({error: error.message});
            }
        }
    }
});

/**
 * Send a password reset email.
 *
 * @param {string} email - The recipient's email address.
 * @param {string} resetToken - The password reset token.
 */
async function sendPasswordResetEmail(email: string, resetToken: string) {
    const mg = new MailgunService();
    const resetLink = process.env.PASSWORD_RESET_URL + '?token=' + resetToken;

    const subject = process.env.PASSWORD_RESET_SUBJECT;
    const text = process.env.PASSWORD_RESET_MSG + ' ' + resetLink;
    const html = '<p>' + process.env.PASSWORD_RESET_MSG + ` <a href="${resetLink}">${resetLink}</a></p>`;

    return new Promise(async (resolve, reject) => {
        const result = await mg.sendEmail(email, subject, html, text);
        resolve(result);
    });
}

module.exports = router;