import { JWTPayload } from '../utils/jwt';
import { CustomerJWTPayload } from '../utils/customerJwt';

declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
            customer?: CustomerJWTPayload;
        }
    }
}
