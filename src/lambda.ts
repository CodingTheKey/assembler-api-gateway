import app from './index';
import { handle } from 'hono/aws-lambda';

export const handler = handle(app);
