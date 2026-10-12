#!/bin/bash

echo "🔧 Actualizando todos los tests de Selenium..."

# Respaldar tests antiguos
mkdir -p backup_old_tests
cp *.py backup_old_tests/ 2>/dev/null

echo "✅ Respaldo creado en backup_old_tests/"
echo "📝 Los tests actualizados tendrán mejor manejo de errores"
echo ""
echo "Instrucciones:"
echo "1. Actualiza test_login.py con el código mejorado que te di"
echo "2. Ejecuta: python test_login.py"
echo "3. Si funciona, ejecuta: ./run_all_tests.sh"
