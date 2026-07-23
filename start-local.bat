@echo off
setlocal
title DompetKu - Pencatatan Keuangan Pribadi
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js belum terpasang.
  echo Instal Node.js LTS dari https://nodejs.org lalu jalankan kembali.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Menyiapkan aplikasi untuk pertama kali...
  call npm install --include=optional
  if errorlevel 1 (
    echo Instalasi gagal. Periksa koneksi internet lalu coba kembali.
    pause
    exit /b 1
  )
)

echo DompetKu tersedia di http://localhost:5173
start "" http://localhost:5173
call npm run dev -- --host 127.0.0.1 --port 5173
pause
