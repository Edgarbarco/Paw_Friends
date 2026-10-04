#!/bin/bash

echo "==================================="
echo "Escaneo de Seguridad - PawFriends"
echo "==================================="
echo ""

echo "1. Escaneo básico de puertos..."
nmap -p 9000 localhost

echo ""
echo "2. Detección de servicios y versiones..."
nmap -sV -p 9000 localhost

echo ""
echo "3. Escaneo de vulnerabilidades comunes..."
nmap --script vuln -p 9000 localhost

echo ""
echo "==================================="
echo "Escaneo completado"
echo "==================================="
