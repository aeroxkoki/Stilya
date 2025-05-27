#!/bin/bash

echo "=€ Stilya iOS Quick Test (Expo Go)"
echo "=================================="

cd /Users/koki_air/Documents/GitHub/Stilya

# °ƒ	pnÁ§Ã¯
if [ ! -f .env ]; then
    echo "   .envÕ¡¤ëL‹dKŠ~[“"
    echo "=Ý .env.exampleK‰.env’\W~Y..."
    
    if [ -f .env.example ]; then
        cp .env.example .env
        echo " .envÕ¡¤ë’\W~W_"
        echo "   ’ ÅkÜXf°ƒ	p’-šWfO`UD"
    else
        echo "L .env.example‚‹dKŠ~[“"
        echo "   ’ ÇââüÉgwÕW~Y"
    fi
fi

# ­ãÃ·å¯ê¢
echo ""
echo ">ù ­ãÃ·å’¯ê¢-..."
rm -rf node_modules/.cache
rm -rf .expo/cache
rm -rf .metro-cache

# ÑÃ±ü¸nº
echo ""
echo "=æ X¢Â’º-..."
if [ ! -d "node_modules" ]; then
    echo "=å X¢Â’¤ó¹Èüë-..."
    npm install
fi

# Expo GogwÕ
echo ""
echo "=ñ Expo GogwÕ-..."
echo ""
echo "D¹:"
echo "1. iPhonegExpo Go¢×ê’À¦óíüÉ"
echo "2. kh:UŒ‹QR³üÉ’¹­ãó"
echo "3. ¢×êLêÕ„k­¼~Œ~Y"
echo ""
echo "ÒóÈ:"
echo "- XWi-FiÍÃÈïü¯k¥šWfO`UD"
echo "- QR³üÉLh:UŒjD4o 'shift + q' ’¼Y"
echo "- OLLB‹4o 'r' gêíüÉ"
echo ""

# Expo start with clear cache (LAN mode)
echo "< LANâüÉgwÕW~YˆŠ‰š	"
echo "   iPhonehMacLXWi-Fik¥šUŒfD‹Sh’ºWfO`UD"
echo ""
npx expo start --clear
