@echo off
chcp 65001 > nul
title Preparar y Subir Proyecto a GitHub para Render
echo ========================================================
echo   SISTEMA DE INVENTARIO WEB SENA - SUBIDA A GITHUB
echo ========================================================
echo.

echo 1. Inicializando repositorio Git...
git init
git branch -M main

echo.
echo 2. Agregando archivos del proyecto...
git add .

echo.
echo 3. Creando el primer commit...
git commit -m "Sistema de Inventario Web SENA listo para Render"

echo.
echo ========================================================
echo ¡Proyecto preparado con éxito!
echo.
echo Para subirlo a tu cuenta de GitHub, crea un repositorio
echo vacío en https://github.com/new y luego pega aquí
echo la URL de tu repositorio (ejemplo: https://github.com/tu-usuario/inventario.git):
echo ========================================================
echo.
set /p REPO_URL="Pega la URL de tu repositorio de GitHub: "

if "%REPO_URL%"=="" (
    echo No ingresaste ninguna URL. Podrás ejecutar 'git remote add origin URL' y 'git push -u origin main' manualmente.
) else (
    git remote add origin %REPO_URL%
    echo Subiendo proyecto a GitHub...
    git push -u origin main
    echo.
    echo ¡Subida completada con éxito! Ahora ve a Render.com y conéctalo.
)

pause
