#!/bin/bash

# ============================================
# Script de Ejecución Completa de Tests
# PawFriends - Suite Selenium
# ============================================

echo ""
echo "🧪════════════════════════════════════════════════════════🧪"
echo "   SUITE COMPLETA DE TESTS SELENIUM - PawFriends"
echo "🧪════════════════════════════════════════════════════════🧪"
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contadores
PASSED=0
FAILED=0
TOTAL=0

# Función para ejecutar un test
run_test() {
    local test_name=$1
    local test_file=$2
    
    echo ""
    echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo "${BLUE}▶ Ejecutando: $test_name${NC}"
    echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    TOTAL=$((TOTAL + 1))
    
    if python "$test_file"; then
        PASSED=$((PASSED + 1))
        echo "${GREEN}✅ $test_name: PASÓ${NC}"
    else
        FAILED=$((FAILED + 1))
        echo "${RED}❌ $test_name: FALLÓ${NC}"
    fi
    
    echo ""
    echo "⏳ Esperando 3 segundos antes del siguiente test..."
    sleep 3
}

# Verificar que existan los archivos
echo "🔍 Verificando archivos de test..."

required_files=(
    "test_login.py"
    "test_register.py"
    "test_navigation.py"
    "test_list_users.py"
    "test_create_pet.py"
    "test_create_appointment.py"
    "test_create_product.py"
    "test_contact_notification.py"
)

missing_files=0
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "${RED}❌ Archivo no encontrado: $file${NC}"
        missing_files=$((missing_files + 1))
    else
        echo "${GREEN}✅ $file${NC}"
    fi
done

if [ $missing_files -gt 0 ]; then
    echo ""
    echo "${RED}❌ Faltan $missing_files archivos. Abortando tests.${NC}"
    exit 1
fi

echo ""
echo "${GREEN}✅ Todos los archivos encontrados${NC}"
echo ""

# ============================================
# BLOQUE 1: TESTS BÁSICOS
# ============================================
echo ""
echo "╔════════════════════════════════════════════╗"
echo "║   BLOQUE 1: TESTS DE AUTENTICACIÓN        ║"
echo "╚════════════════════════════════════════════╝"

run_test "1️⃣  Test de Login" "test_login.py"
run_test "2️⃣  Test de Registro" "test_register.py"

# ============================================
# BLOQUE 2: TESTS DE NAVEGACIÓN
# ============================================
echo ""
echo "╔════════════════════════════════════════════╗"
echo "║   BLOQUE 2: TESTS DE NAVEGACIÓN           ║"
echo "╚════════════════════════════════════════════╝"

run_test "3️⃣  Test de Navegación" "test_navigation.py"
run_test "4️⃣  Test de Lista de Usuarios" "test_list_users.py"

# ============================================
# BLOQUE 3: TESTS DE FUNCIONALIDADES
# ============================================
echo ""
echo "╔════════════════════════════════════════════╗"
echo "║   BLOQUE 3: TESTS DE CREACIÓN             ║"
echo "╚════════════════════════════════════════════╝"

run_test "5️⃣  Test de Crear Mascota" "test_create_pet.py"
run_test "6️⃣  Test de Crear Cita" "test_create_appointment.py"
run_test "7️⃣  Test de Crear Producto" "test_create_product.py"

# ============================================
# BLOQUE 4: TESTS AVANZADOS
# ============================================
echo ""
echo "╔════════════════════════════════════════════╗"
echo "║   BLOQUE 4: TESTS DE NOTIFICACIONES       ║"
echo "╚════════════════════════════════════════════╝"

run_test "8️⃣  Test de Notificación de Contacto" "test_contact_notification.py"

# ============================================
# RESUMEN FINAL
# ============================================
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  📊 RESUMEN FINAL                          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

PERCENTAGE=$((PASSED * 100 / TOTAL))

echo "Tests ejecutados: $TOTAL"
echo "${GREEN}✅ Tests pasados: $PASSED${NC}"
echo "${RED}❌ Tests fallados: $FAILED${NC}"
echo ""
echo "Porcentaje de éxito: $PERCENTAGE%"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "${GREEN}╔══════════════════════════════════════════╗${NC}"
    echo "${GREEN}║  🎉 ¡TODOS LOS TESTS PASARON! 🎉         ║${NC}"
    echo "${GREEN}╚══════════════════════════════════════════╝${NC}"
    exit 0
elif [ $PERCENTAGE -ge 75 ]; then
    echo "${YELLOW}╔══════════════════════════════════════════╗${NC}"
    echo "${YELLOW}║  ⚠️  Mayoría de tests pasó (>=75%)      ║${NC}"
    echo "${YELLOW}╚══════════════════════════════════════════╝${NC}"
    exit 0
elif [ $PERCENTAGE -ge 50 ]; then
    echo "${YELLOW}╔══════════════════════════════════════════╗${NC}"
    echo "${YELLOW}║  ⚠️  Mitad de tests pasó (>=50%)        ║${NC}"
    echo "${YELLOW}╚══════════════════════════════════════════╝${NC}"
    exit 1
else
    echo "${RED}╔══════════════════════════════════════════╗${NC}"
    echo "${RED}║  ❌ Muchos tests fallaron (<50%)         ║${NC}"
    echo "${RED}╚══════════════════════════════════════════╝${NC}"
    exit 1
fi