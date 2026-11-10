@echo off
title Creazione Pacchetto Commerciale Gumroad - TRADING PRO ULTIMATE
cd /d "%~dp0"
echo ======================================================================
echo   Creazione pacchetto Trading_Pro_Ultimate_Gumroad_Release.zip...
echo ======================================================================
powershell -NoProfile -Command "Compress-Archive -Path 'gumroad_release_kit\AVVIA_TRADING_PRO_ULTIMATE_CLIENTE.html','gumroad_release_kit\INSTALLA_APP_IPHONE_HOME.mobileconfig','gumroad_release_kit\LEGGIMI_ATTIVAZIONE_LICENZA.txt','og-banner-tradingpro-ultimate.png' -DestinationPath 'Trading_Pro_Ultimate_Gumroad_Release.zip' -Force"
echo.
echo [OK] File Trading_Pro_Ultimate_Gumroad_Release.zip creato con successo!
echo Carica questo file .zip nella sezione "Content / Files" del tuo prodotto Gumroad.
pause
