// custom.d.ts
import 'express';

declare module 'express' {
    export interface Response {
        success: (data?: any, metadata?: any) => void;
        created: (data?: any, metadata?: any) => void;
        noResponse: (data?: any, metadata?: any) => void;

        errorBadRequest: (data?: any, metadata?: any) => void;
        errorUnauthorized: (data?: any, metadata?: any) => void;
        errorPaymentRequired: (data?: any, metadata?: any) => void;
        errorForbidden: (data?: any, metadata?: any) => void;
        errorNotFound: (data?: any, metadata?: any) => void;
        errorNotAllowed: (data?: any, metadata?: any) => void;

        errorInternalError: (data?: any, metadata?: any) => void;
        errorNotImplemented: (data?: any, metadata?: any) => void;
        errorBadGateway: (data?: any, metadata?: any) => void;
        errorServiceUnavailable: (data?: any, metadata?: any) => void;

        errorValidationFailed: (data?: any, metadata?: any) => void;
    }

    export interface Request {
        userData: (data?: any) => void;
    }
}
