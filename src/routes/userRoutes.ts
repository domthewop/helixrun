import { Router, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { User } from '../entities/Users';
import Joi from 'joi';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.send('List of users');
});

router.post('/create', async (req: Request, res: Response) => {
    const userSchema = Joi.object({
        username: Joi.string().alphanum().min(3).max(30).required(),
        password: Joi.string()
            .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})'))
            .required(),
        email: Joi.string().email().required()
    });

    const { error } = userSchema.validate(req.body);

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    try {
        const userRepository = getRepository(User);
        const user = userRepository.create(req.body); // creates a user instance from request data
        const results = await userRepository.save(user); // saves the user in the database
        return res.status(201).json(results);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;