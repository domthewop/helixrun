import AppDataSource from "../../db/db";
import {User} from "../../entities/Users";
const { ErrorRecord } = require('../../entities/Errors');

module.exports = () => {
    function apiResponse(req, res, next) {

        async function logErrorToDatabase(code, message, stack, metadata) {
            try {
                const errorRecord = new ErrorRecord();
                errorRecord.errorCode = code;
                errorRecord.message = message;
                errorRecord.stack = stack || '';
                errorRecord.metadata = metadata || null;

                // If the user is logged in, associate the error with the user
                if (req.userData && req.userData['userId']) {
                    errorRecord.user = req.userData['userId'];
                }

                if (!isIgnored(errorRecord)) {
                    try {
                        const errorRecordRepository = await AppDataSource.getRepository(ErrorRecord);
                        const record = await errorRecordRepository.create(errorRecord);
                        const results = await errorRecordRepository.save(errorRecord);
                    } catch (err) {
                        console.error('Failed to save error to database:', err);
                    }
                }
            } catch (err) {
                console.error('Failed to save error to database:', err);
            }
        }

        function _successResponse(code) {
            let shared = { status: 'success', code };

            return data => {
                let response = data ? Object.assign(shared, { data }) : shared;

                res.status(response.code);
                res.json(response);
            };
        }

        function _errorResponse(code, message) {
            let shared = { status: 'error', code, message };
            return async (data, metadata) => {
                let response = data ? Object.assign(shared, { data }) : shared;

                // Log error to database
                await logErrorToDatabase(
                    response.code,
                    response.message,
                    data?.stack,
                    metadata);

                // TODO: Log error to text file

                res.status(response.code);
                res.json({ responseCode: response.code, responseMessage: response.message, shared, metadata });
            };
        }

        // 2xx: Success
        res.success = _successResponse(200);
        res.created = _successResponse(201);
        res.noResponse = _successResponse(204);

        // 4xx: Client/Request Error
        res.errorBadRequest = _errorResponse(400, 'bad request');
        res.errorUnauthorized = _errorResponse(401, 'unauthorized');
        res.errorPaymentRequired = _errorResponse(402, 'payment required');
        res.errorForbidden = _errorResponse(403, 'forbidden');
        res.errorNotFound = _errorResponse(404, 'not found');
        res.errorNotAllowed = _errorResponse(405, 'method not allowed');

        // 5xx: Server Error
        res.errorInternalError = _errorResponse(500, 'internal server error');
        res.errorNotImplemented = _errorResponse(501, 'not implemented');
        res.errorBadGateway = _errorResponse(502, 'bad gateway');
        res.errorServiceUnavailable = _errorResponse(503, 'service unavailable');

        // Custom Error Responses
        res.errorValidationFailed = _errorResponse(400, 'validation failed');

        next();
    }

    return apiResponse;
};

function isIgnored(errorRecord): boolean {
        return (errorRecord.errorCode == 400 && errorRecord.metadata.context == 'email_or_password_missing')
            || (errorRecord.errorCode == 400 && errorRecord.metadata.context == 'account_creation_email_exists')
            || (errorRecord.errorCode == 400 && errorRecord.metadata.context == 'account_creation_validation_failed')
            || (errorRecord.errorCode == 401 && errorRecord.metadata.context == 'incorrect_username_or_password')
            || (errorRecord.errorCode == 401 && errorRecord.metadata.context == 'jwt_missing')
            || (errorRecord.errorCode == 401 && errorRecord.metadata.context == 'jwt_invalid_or_expired');
}
