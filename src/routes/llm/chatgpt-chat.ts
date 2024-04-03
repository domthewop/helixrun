import { Request, Response, Router } from 'express';
const authMiddleware = require('../lib/middleware').mw.authMiddleware;
const apiResponse = require('../lib/middleware/index').mw.responseMiddleware;
import { userSubscriptionMiddleware } from '../../lib/middleware/user-subscription-middleware';
import { UserSubscriptionTier } from '../../constants/UserSubscriptionTier';
import AppDataSource from '../../db/db';
import { User } from '../../entities/Users';
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
router.use(apiResponse());

