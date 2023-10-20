'use strict';

module.exports = () => {

    function apiResponse(req, res, next) {

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

            return data => {
                let response = data ? Object.assign(shared, { data }) : shared;

                res.status(response.code);
                res.json(response);
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
