@echo off
REM ============================================================================
REM PLANTUML IMAGE GENERATOR - WATCHIFY PROJECT
REM ============================================================================
REM This script generates PNG and SVG images from PlantUML diagrams
REM
REM Prerequisites:
REM   - Java 8 or higher installed
REM   - plantuml.jar downloaded (see instructions below)
REM
REM Usage:
REM   1. Download plantuml.jar from https://plantuml.com/download
REM   2. Place plantuml.jar in this directory (docs/diagrams/)
REM   3. Run this batch file
REM ============================================================================

echo.
echo ========================================
echo  PlantUML Image Generator - Watchify
echo ========================================
echo.

REM Check if Java is installed
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Java is not installed or not in PATH
    echo Please install Java 8 or higher from: https://www.java.com/
    pause
    exit /b 1
)

echo [OK] Java is installed
echo.

REM Check if plantuml.jar exists
if not exist "plantuml.jar" (
    echo [ERROR] plantuml.jar not found in current directory
    echo.
    echo Please download plantuml.jar from:
    echo https://plantuml.com/download
    echo.
    echo Place it in: docs\diagrams\plantuml.jar
    echo.
    pause
    exit /b 1
)

echo [OK] plantuml.jar found
echo.

REM Create output directories
if not exist "output" mkdir output
if not exist "output\png" mkdir output\png
if not exist "output\svg" mkdir output\svg

echo ========================================
echo Generating PNG images...
echo ========================================
echo.

REM Generate PNG images
java -jar plantuml.jar -tpng -o output/png *.puml

if %errorlevel% neq 0 (
    echo [ERROR] Failed to generate PNG images
    pause
    exit /b 1
)

echo [OK] PNG images generated in: output\png\
echo.

echo ========================================
echo Generating SVG images...
echo ========================================
echo.

REM Generate SVG images
java -jar plantuml.jar -tsvg -o output/svg *.puml

if %errorlevel% neq 0 (
    echo [ERROR] Failed to generate SVG images
    pause
    exit /b 1
)

echo [OK] SVG images generated in: output\svg\
echo.

echo ========================================
echo GENERATION COMPLETED SUCCESSFULLY!
echo ========================================
echo.
echo Generated files:
echo   PNG: docs\diagrams\output\png\
echo   SVG: docs\diagrams\output\svg\
echo.
echo Files generated:
dir /b output\png\*.png 2>nul
echo.
echo You can now use these images in your documentation.
echo.

REM Open output folder
echo Opening output folder...
start output

pause