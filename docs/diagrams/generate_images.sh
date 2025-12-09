#!/bin/bash
# ============================================================================
# PLANTUML IMAGE GENERATOR - WATCHIFY PROJECT (Linux/Mac)
# ============================================================================
# This script generates PNG and SVG images from PlantUML diagrams
#
# Prerequisites:
#   - Java 8 or higher installed
#   - plantuml.jar downloaded (see instructions below)
#
# Usage:
#   1. Download plantuml.jar from https://plantuml.com/download
#   2. Place plantuml.jar in this directory (docs/diagrams/)
#   3. Make this script executable: chmod +x generate_images.sh
#   4. Run: ./generate_images.sh
# ============================================================================

set -e  # Exit on error

echo ""
echo "========================================"
echo " PlantUML Image Generator - Watchify"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} Java is not installed or not in PATH"
    echo "Please install Java 8 or higher"
    echo ""
    echo "For Ubuntu/Debian: sudo apt install default-jre"
    echo "For Mac: brew install openjdk"
    echo "For Fedora/RHEL: sudo dnf install java-11-openjdk"
    exit 1
fi

echo -e "${GREEN}[OK]${NC} Java is installed"
java -version 2>&1 | head -n 1
echo ""

# Check if plantuml.jar exists
if [ ! -f "plantuml.jar" ]; then
    echo -e "${RED}[ERROR]${NC} plantuml.jar not found in current directory"
    echo ""
    echo "Please download plantuml.jar from:"
    echo "https://plantuml.com/download"
    echo ""
    echo "Place it in: docs/diagrams/plantuml.jar"
    echo ""
    echo "Quick download (latest version):"
    echo "curl -L https://github.com/plantuml/plantuml/releases/download/v1.2024.0/plantuml-1.2024.0.jar -o plantuml.jar"
    exit 1
fi

echo -e "${GREEN}[OK]${NC} plantuml.jar found"
echo ""

# Create output directories
mkdir -p output/png
mkdir -p output/svg

echo "========================================"
echo "Generating PNG images..."
echo "========================================"
echo ""

# Generate PNG images
if java -jar plantuml.jar -tpng -o output/png *.puml; then
    echo -e "${GREEN}[OK]${NC} PNG images generated in: output/png/"
else
    echo -e "${RED}[ERROR]${NC} Failed to generate PNG images"
    exit 1
fi

echo ""
echo "========================================"
echo "Generating SVG images..."
echo "========================================"
echo ""

# Generate SVG images
if java -jar plantuml.jar -tsvg -o output/svg *.puml; then
    echo -e "${GREEN}[OK]${NC} SVG images generated in: output/svg/"
else
    echo -e "${RED}[ERROR]${NC} Failed to generate SVG images"
    exit 1
fi

echo ""
echo "========================================"
echo "GENERATION COMPLETED SUCCESSFULLY!"
echo "========================================"
echo ""
echo "Generated files:"
echo "  PNG: docs/diagrams/output/png/"
echo "  SVG: docs/diagrams/output/svg/"
echo ""

# Count files
PNG_COUNT=$(ls -1 output/png/*.png 2>/dev/null | wc -l)
SVG_COUNT=$(ls -1 output/svg/*.svg 2>/dev/null | wc -l)

echo "Files generated:"
echo "  PNG files: $PNG_COUNT"
ls -1 output/png/*.png 2>/dev/null | sed 's/^/    - /'
echo ""
echo "  SVG files: $SVG_COUNT"
ls -1 output/svg/*.svg 2>/dev/null | sed 's/^/    - /'
echo ""

echo -e "${GREEN}✓${NC} You can now use these images in your documentation."
echo ""

# Optional: Open output folder (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Opening output folder..."
    open output
fi

# Optional: Open output folder (Linux with xdg-open)
if [[ "$OSTYPE" == "linux-gnu"* ]] && command -v xdg-open &> /dev/null; then
    echo "Opening output folder..."
    xdg-open output &> /dev/null &
fi

echo "Done!"