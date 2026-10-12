const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Auth Controller - Pruebas Unitarias', () => {
  
  describe('Validación de Password', () => {
    test('debe hashear correctamente una contraseña', async () => {
      const password = '123456';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(20);
    });

    test('debe comparar correctamente contraseñas', async () => {
      const password = '123456';
      const hashedPassword = await bcrypt.hash(password, 10);
      const isMatch = await bcrypt.compare(password, hashedPassword);
      
      expect(isMatch).toBe(true);
    });

    test('debe rechazar contraseña incorrecta', async () => {
      const password = '123456';
      const wrongPassword = 'wrong123';
      const hashedPassword = await bcrypt.hash(password, 10);
      const isMatch = await bcrypt.compare(wrongPassword, hashedPassword);
      
      expect(isMatch).toBe(false);
    });
  });

  describe('JWT Token', () => {
    test('debe generar un token válido', () => {
      const payload = { 
        id: '123456', 
        email: 'test@test.com',
        role: 'user'
      };
      
      const token = jwt.sign(payload, process.env.JWT_SECRET || 
'test-secret', {
        expiresIn: '1d'
      });
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT tiene 3 partes
    });

    test('debe verificar correctamente un token válido', () => {
      const payload = { 
        id: '123456', 
        email: 'test@test.com' 
      };
      
      const secret = process.env.JWT_SECRET || 'test-secret';
      const token = jwt.sign(payload, secret, { expiresIn: '1d' });
      const decoded = jwt.verify(token, secret);
      
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
    });
  });

  describe('Validación de Email', () => {
    test('debe validar formato de email correcto', () => {
      const validEmails = [
        'test@test.com',
        'user@example.org',
        'name.surname@domain.co'
      ];
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      validEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(true);
      });
    });

    test('debe rechazar formato de email incorrecto', () => {
      const invalidEmails = [
        'notanemail',
        '@nodomain.com',
        'missing@domain',
        'spaces in@email.com'
      ];
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      invalidEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });
  });
});
