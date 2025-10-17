const adminAuth = require('../../middleware/adminAuth');

describe('adminAuth middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Limpiar req completamente
    req = {};
    
    // Recrear res con mocks frescos
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    // Recrear next
    next = jest.fn();
    
    // Limpiar todos los mocks
    jest.clearAllMocks();
    
    // Limpiar console mocks
    console.log = jest.fn();
    console.error = jest.fn();
  });

  describe('✅ Successful Authentication', () => {
    test('should call next() for admin user', () => {
      req.user = { id: 1, role: 'admin', email: 'admin@test.com' };

      adminAuth(req, res, next);

      expect(console.log).toHaveBeenCalledWith('User in adminAuth:', req.user);
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('🚫 Authentication Failures - Branch Coverage', () => {
    test('should return 403 when user is null', () => {
      req.user = null;

      adminAuth(req, res, next);

      expect(console.log).toHaveBeenCalledWith('User in adminAuth:', null);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 403 when user is undefined', () => {
      req.user = undefined;

      adminAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 403 when req.user does not exist', () => {
      // No setting req.user at all - tests the !req.user branch
      adminAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 403 when user role is not admin', () => {
      req.user = { id: 2, role: 'manager', email: 'manager@test.com' };

      adminAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 403 for all non-admin roles', () => {
      const nonAdminRoles = ['client', 'technician', 'manager', '', null, undefined];

      nonAdminRoles.forEach(role => {
        req.user = { id: 1, role: role };
        res.status.mockClear();
        res.json.mockClear();
        next.mockClear();

        adminAuth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
      });
    });
  });

  describe('💥 Error Handling - Catch Block Coverage', () => {
    test('should return 500 when error occurs accessing req.user', () => {
      // Create req object that throws when accessing user property
      Object.defineProperty(req, 'user', {
        get() {
          throw new Error('Database connection error');
        }
      });

      adminAuth(req, res, next);

      expect(console.error).toHaveBeenCalledWith('❌ AdminAuth middleware error:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Permission verification error'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 500 when error occurs accessing user.role', () => {
      req.user = {};
      Object.defineProperty(req.user, 'role', {
        get() {
          throw new Error('Role access error');
        }
      });

      adminAuth(req, res, next);

      expect(console.error).toHaveBeenCalledWith('❌ AdminAuth middleware error:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Permission verification error'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 500 for any error in try block', () => {
      // Test with corrupted req object
      const corruptedReq = {};
      Object.defineProperty(corruptedReq, 'user', {
        get() {
          throw new TypeError('Cannot read property of null');
        }
      });

      adminAuth(corruptedReq, res, next);

      expect(console.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('🎯 Complete Line Coverage', () => {
    test('should execute every line in adminAuth middleware', () => {
      // Line 1: function declaration (executed when imported)
      expect(adminAuth).toBeInstanceOf(Function);

      // Lines 2-3: try block start + console.log
      req.user = { role: 'admin' };
      adminAuth(req, res, next);
      expect(console.log).toHaveBeenCalled();

      // Lines 4-8: if condition + return 403 (FALSE branch)
      jest.clearAllMocks();
      req.user = { role: 'client' };
      adminAuth(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);

      // Line 10: next() call (TRUE branch - admin user)
      jest.clearAllMocks();
      req.user = { role: 'admin' };
      adminAuth(req, res, next);
      expect(next).toHaveBeenCalled();

      // Lines 11-16: catch block
      jest.clearAllMocks();
      Object.defineProperty(req, 'user', {
        get() { throw new Error('Test error'); }
      });
      adminAuth(req, res, next);
      expect(console.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);

      // Line 20: module.exports - verificar que el require funciona
      const importedAdminAuth = require('../../middleware/adminAuth');
      expect(importedAdminAuth).toBe(adminAuth);
    });
  });

  describe('🔧 Function Coverage', () => {
    test('should execute the adminAuth function', () => {
      // Simplemente verificar que la función se ejecuta correctamente
      expect(typeof adminAuth).toBe('function');
      expect(adminAuth.name).toBe('adminAuth');
      
      // Ejecutar la función para asegurar 100% function coverage
      req.user = { role: 'admin' };
      
      const result = adminAuth(req, res, next);
      
      // Verificar que se ejecutó correctamente
      expect(next).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined(); // Las funciones middleware no retornan valor
    });
  });

  describe('🎯 Forzar Ejecución Real del Middleware', () => {
    test('EJECUTAR todas las líneas del middleware adminAuth', () => {
      // LÍNEA 1: Función adminAuth (ya ejecutada al importar)
      expect(adminAuth).toBeInstanceOf(Function);

      // LÍNEAS 2-3: try + console.log
      req.user = { role: 'admin' };
      adminAuth(req, res, next);
      expect(console.log).toHaveBeenCalledWith('User in adminAuth:', req.user);

      // LÍNEAS 4-8: if condition + return res.status(403).json()
      jest.clearAllMocks();
      req.user = null; // Esto disparará el if (!req.user)
      adminAuth(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });

      // LÍNEA 10: next() - para usuario admin
      jest.clearAllMocks();
      req.user = { role: 'admin' };
      adminAuth(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);

      // LÍNEAS 11-16: catch block
      jest.clearAllMocks();
      const errorReq = {};
      Object.defineProperty(errorReq, 'user', {
        get() { throw new Error('Forced error'); }
      });
      adminAuth(errorReq, res, next);
      expect(console.error).toHaveBeenCalledWith('❌ AdminAuth middleware error:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Permission verification error'
      });

      // LÍNEA 20: module.exports
      expect(require('../../middleware/adminAuth')).toBe(adminAuth);
    });

    test('CUBRIR todas las branches del if statement', () => {
      // Branch 1: !req.user (user no existe)
      adminAuth(req, res, next); // req.user es undefined por defecto
      expect(res.status).toHaveBeenCalledWith(403);

      // Branch 2: req.user existe pero role !== 'admin'
      jest.clearAllMocks();
      req.user = { role: 'client' };
      adminAuth(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);

      // Branch 3: req.user existe Y role === 'admin' (condición FALSE)
      jest.clearAllMocks();
      req.user = { role: 'admin' };
      adminAuth(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();

      // Branch 4: catch block
      jest.clearAllMocks();
      Object.defineProperty(req, 'user', {
        get() { throw new Error('Test error'); }
      });
      adminAuth(req, res, next);
      expect(res.status).toHaveBeenCalledWith(500);
    });

    test('VERIFICAR que la función se ejecuta (function coverage)', () => {
      // Esto asegura 100% function coverage
      expect(typeof adminAuth).toBe('function');
      
      // Ejecutar la función al menos una vez
      req.user = { role: 'admin' };
      const result = adminAuth(req, res, next);
      
      expect(result).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });
  });
});