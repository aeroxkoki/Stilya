#!/bin/bash

echo "=� Stilya iOS Quick Test (Expo Go)"
echo "=================================="

cd /Users/koki_air/Documents/GitHub/Stilya

# ��	pn��ï
if [ ! -f .env ]; then
    echo "�  .envա��L�dK�~[�"
    echo "=� .env.exampleK�.env�\W~Y..."
    
    if [ -f .env.example ]; then
        cp .env.example .env
        echo " .envա��\W~W_"
        echo "   � Łk�Xf��	p�-�WfO`UD"
    else
        echo "L .env.example��dK�~[�"
        echo "   � �����gw�W~Y"
    fi
fi

# ��÷��
echo ""
echo ">� ��÷咯�-..."
rm -rf node_modules/.cache
rm -rf .expo/cache
rm -rf .metro-cache

# �ñ��n��
echo ""
echo "=� �X���-..."
if [ ! -d "node_modules" ]; then
    echo "=� �X������-..."
    npm install
fi

# Expo Gogw�
echo ""
echo "=� Expo Gogw�-..."
echo ""
echo "D�:"
echo "1. iPhonegExpo Go���������"
echo "2. kh:U��QR��ɒ����"
echo "3. ���L�Մk��~�~Y"
echo ""
echo "���:"
echo "- XWi-Fi������k��WfO`UD"
echo "- QR���Lh:U�jD4o 'shift + q' ��Y"
echo "- OLLB�4o 'r' g����"
echo ""

# Expo start with clear cache (LAN mode)
echo "< LAN���gw�W~Y����	"
echo "   iPhonehMacLXWi-Fik��U�fD�Sh���WfO`UD"
echo ""
npx expo start --clear
