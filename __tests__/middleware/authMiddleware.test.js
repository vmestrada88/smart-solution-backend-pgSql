const jwt = require('jsonwebtoken');
const { auth } = require('../../middleware/auth');

// Mock jwt
jest.mock('jsonwebtoken');

describe('Auth Middleware - 100% Coverage for middleware/auth.js', () => {
    let req, res, next;
    let originalJwtSecret;

    beforeAll(() => {
        originalJwtSecret = process.env.JWT_SECRET;
        process.env.JWT_SECRET = 'test-secret-key';
    });

    afterAll(() => {
        process.env.JWT_SECRET = originalJwtSecret;
    });

    beforeEach(() => {
        // Mock request object
        req = {
            headers: {}
        };
        
        // Mock response object
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        
        // Mock next function
        next = jest.fn();
        
        // Clear all mocks
        jest.clearAllMocks();
        
        // Reset jwt.verify to default clean implementation
        jwt.verify.mockClear();
    });

    describe('🔐 AUTH MIDDLEWARE - LINES 3-25', () => {
        test('should execute auth middleware without authorization header - lines 6-11', () => {
            // No authorization header
            req.headers = {};

            auth(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'No token provided or invalid format.'
            });
            expect(next).not.toHaveBeenCalled();
            // jwt.verify should NOT be called in this case
            expect(jwt.verify).not.toHaveBeenCalled();
        });

        test('should execute auth middleware with invalid token format - lines 6-11', () => {
            // Invalid format (no "Bearer ")
            req.headers.authorization = 'InvalidFormat token123';

            auth(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'No token provided or invalid format.'
            });
            expect(next).not.toHaveBeenCalled();
            // jwt.verify should NOT be called in this case
            expect(jwt.verify).not.toHaveBeenCalled();
        });

        test('should execute auth middleware with missing token - lines 6-11', () => {
            req.headers.authorization = 'Bearer'; // No space at the end

            auth(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'No token provided or invalid format.'
            });
            expect(next).not.toHaveBeenCalled();
            // jwt.verify should NOT be called in this case
            expect(jwt.verify).not.toHaveBeenCalled();
        });

        test('should execute auth middleware with valid token - lines 13-17', () => {
            // Valid authorization header
            req.headers.authorization = 'Bearer valid-token-123';
            
            // Mock jwt.verify to return valid data WITHOUT error
            const mockDecoded = { id: 'user123', role: 'admin' };
            jwt.verify.mockReturnValue(mockDecoded);

            auth(req, res, next);

            expect(jwt.verify).toHaveBeenCalledWith('valid-token-123', 'test-secret-key');
            expect(req.user).toEqual(mockDecoded);
            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        test('should execute auth middleware catch block - lines 18-24', () => {
            // Valid format but invalid token
            req.headers.authorization = 'Bearer invalid-token';
            
            // Create controlled error without real JWT error
            const mockError = new Error('Mocked JWT error');
            mockError.name = 'JsonWebTokenError';
            
            // Mock console.error BEFORE throwing the error
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            
            // Mock jwt.verify to throw our controlled error
            jwt.verify.mockImplementation(() => {
                throw mockError;
            });

            auth(req, res, next);

            expect(jwt.verify).toHaveBeenCalledWith('invalid-token', 'test-secret-key');
            expect(consoleSpy).toHaveBeenCalledWith('❌ Auth middleware error:', mockError);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid token.'
            });
            expect(next).not.toHaveBeenCalled();

            // Restore console.error
            consoleSpy.mockRestore();
        });

        test('should handle JWT expired error - catch block line 18-24', () => {
            req.headers.authorization = 'Bearer expired-token';
            
            // Create controlled error specifically for expired token
            const expiredError = new Error('Token expired (mocked)');
            expiredError.name = 'TokenExpiredError';
            
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            
            jwt.verify.mockImplementation(() => {
                throw expiredError;
            });

            auth(req, res, next);

            expect(jwt.verify).toHaveBeenCalledWith('expired-token', 'test-secret-key');
            expect(consoleSpy).toHaveBeenCalledWith('❌ Auth middleware error:', expiredError);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid token.'
            });
            expect(next).not.toHaveBeenCalled();

            consoleSpy.mockRestore();
        });

        test('should handle JWT malformed error - catch block line 18-24', () => {
            req.headers.authorization = 'Bearer malformed.token';
            
            // Create controlled error specifically for malformed token
            const malformedError = new Error('Token malformed (mocked)');
            malformedError.name = 'JsonWebTokenError';
            
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            
            jwt.verify.mockImplementation(() => {
                throw malformedError;
            });

            auth(req, res, next);

            expect(jwt.verify).toHaveBeenCalledWith('malformed.token', 'test-secret-key');
            expect(consoleSpy).toHaveBeenCalledWith('❌ Auth middleware error:', malformedError);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid token.'
            });
            expect(next).not.toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });

    describe('🎯 EDGE CASES', () => {
        test('should handle authorization header with multiple Bearer keywords', () => {
            req.headers.authorization = 'Bearer Bearer token123';
            
            // Mock for this specific case
            jwt.verify.mockReturnValue({ id: 'test' });

            auth(req, res, next);

            // Should extract "Bearer" as token (edge case)
            expect(jwt.verify).toHaveBeenCalledWith('Bearer', 'test-secret-key');
            expect(next).toHaveBeenCalled();
        });

        test('should handle authorization header with extra spaces', () => {
            req.headers.authorization = 'Bearer    token-with-spaces';
            
            // Mock for empty string (real result of split)
            const mockError = new Error('Empty token (mocked)');
            jwt.verify.mockImplementation(() => {
                throw mockError;
            });
            
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            auth(req, res, next);

            // split(' ')[1] in 'Bearer    token' returns ''
            expect(jwt.verify).toHaveBeenCalledWith('', 'test-secret-key');
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid token.'
            });
            expect(next).not.toHaveBeenCalled();

            consoleSpy.mockRestore();
        });

        test('should handle case-sensitive Bearer keyword', () => {
            req.headers.authorization = 'bearer token123'; // lowercase

            auth(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'No token provided or invalid format.'
            });
            expect(next).not.toHaveBeenCalled();
            // jwt.verify should NOT be called in this case
            expect(jwt.verify).not.toHaveBeenCalled();
        });

        test('should handle token that is empty string after split', () => {
            req.headers.authorization = 'Bearer '; // Space at the end but no token
            
            // Mock controlled error for empty string
            const emptyTokenError = new Error('Empty token (mocked)');
            jwt.verify.mockImplementation(() => {
                throw emptyTokenError;
            });

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            auth(req, res, next);

            expect(jwt.verify).toHaveBeenCalledWith('', 'test-secret-key');
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid token.'
            });
            expect(next).not.toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });

    describe('🔍 COVERAGE VERIFICATION', () => {
        test('should execute all possible code paths', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            // Path 1: No header - does NOT call jwt.verify
            auth({ headers: {} }, res, next);

            // Path 2: Invalid format - does NOT call jwt.verify
            auth({ headers: { authorization: 'Invalid' } }, res, next);

            // Path 3: Valid token - DOES call jwt.verify successfully
            jwt.verify.mockReturnValue({ id: 1 });
            const req3 = { headers: { authorization: 'Bearer valid' } };
            auth(req3, res, next);

            // Path 4: Invalid token (catch) - DOES call jwt.verify but throws controlled error
            const controlledError = new Error('Controlled test error');
            jwt.verify.mockImplementation(() => { throw controlledError; });
            auth({ headers: { authorization: 'Bearer invalid' } }, res, next);

            // Verify all branches were executed
            expect(res.status).toHaveBeenCalledWith(401); // Lines 7-11
            expect(res.status).toHaveBeenCalledWith(403); // Lines 20-23
            expect(next).toHaveBeenCalled(); // Line 16
            expect(consoleSpy).toHaveBeenCalledWith('❌ Auth middleware error:', controlledError); // Line 19

            consoleSpy.mockRestore();
        });
    });
});