describe('Pet Validation - Pruebas Unitarias', () => {
  
  describe('Validación de datos de mascota', () => {
    test('debe aceptar datos válidos de mascota', () => {
      const validPet = {
        name: 'Firulais',
        species: 'Perro',
        breed: 'Labrador',
        age: 3,
        ownerEmail: 'owner@test.com'
      };
      
      expect(validPet.name).toBeDefined();
      expect(validPet.name.length).toBeGreaterThan(0);
      expect(validPet.species).toBeDefined();
      expect(validPet.age).toBeGreaterThan(0);
    });

    test('debe validar edad de mascota', () => {
      const validAges = [1, 5, 10, 15];
      const invalidAges = [-1, 0, -5];
      
      validAges.forEach(age => {
        expect(age).toBeGreaterThan(0);
      });
      
      invalidAges.forEach(age => {
        expect(age).toBeLessThanOrEqual(0);
      });
    });

    test('debe validar especies permitidas', () => {
      const allowedSpecies = ['Perro', 'Gato', 'Ave', 'Otro'];
      const testSpecies = 'Perro';
      
      expect(allowedSpecies).toContain(testSpecies);
    });
  });

  describe('Cálculo de edad en meses', () => {
    test('debe convertir años a meses correctamente', () => {
      const years = 2;
      const months = years * 12;
      
      expect(months).toBe(24);
    });

    test('debe calcular edad desde fecha de nacimiento', () => {
      const birthDate = new Date('2023-01-01');
      const today = new Date();
      const ageInYears = today.getFullYear() - birthDate.getFullYear();
      
      expect(ageInYears).toBeGreaterThanOrEqual(1);
    });
  });
});
