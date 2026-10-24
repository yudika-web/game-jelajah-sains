@echo off
setlocal EnableExtensions DisableDelayedExpansion
chcp 65001 >nul
pushd "%~dp0"
if errorlevel 1 goto location_error
where node.exe >nul 2>nul
if errorlevel 1 goto node_error
node -e "const v=process.versions.node.split('.').map(Number);process.exit(v[0]>22||(v[0]===22&&v[1]>=12)?0:1)"
if errorlevel 1 goto node_error
node "scripts\local\launch.mjs"
set "JELAJAH_EXIT=%ERRORLEVEL%"
if not "%JELAJAH_EXIT%"=="0" echo Terjadi masalah. Baca pesan di atas dan jalankan DIAGNOSTIK_JELAJAH_SAINS.bat.
popd
echo.
echo Tekan tombol apa saja untuk menutup jendela ini.
pause >nul
exit /b %JELAJAH_EXIT%

:node_error
echo Node.js belum tersedia atau versinya terlalu lama. Minimum: 22.12.0.
echo Pasang Node.js 24 LTS beserta npm dari https://nodejs.org/
echo Setelah pemasangan, tutup jendela ini dan buka kembali file peluncur.
echo Aplikasi: "%CD%"
echo Alamat tetap: http://localhost:5173
if exist "dist\index.html" (echo Build permainan: tersedia) else (echo Build permainan: belum tersedia)
if defined TEMP echo Node.js tidak tersedia atau lebih lama dari 22.12.0. Pasang dari https://nodejs.org/ >"%TEMP%\Jelajah-Sains-bootstrap.log"
if defined TEMP echo Log awal: "%TEMP%\Jelajah-Sains-bootstrap.log"
node --version 2>nul
popd
pause
exit /b 1

:location_error
echo Folder aplikasi tidak dapat dibuka. Ekstrak seluruh ZIP ke folder yang dapat dibaca.
pause
exit /b 1
