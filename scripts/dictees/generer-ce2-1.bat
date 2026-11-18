@echo off
rem Genere les MP3 de la dictee ce2-1 avec Piper (voix fr_FR-siwis-medium).
rem A lancer depuis le dossier scolafree : cmd /c scripts\dictees\generer-ce2-1.bat
chcp 65001 >nul
set "PIPER_DIR=C:\Users\cedri\Desktop\Projets dev\ScolaFree\piper"
set "TXT=%~dp0ce2-1"
set "OUT=%~dp0..\..\public\audio\dictees\ce2-1"
if not exist "%OUT%" mkdir "%OUT%"
for %%f in (01 02 03 04 05 complet) do (
  echo Generation de %%f...
  type "%TXT%\%%f.txt" | "%PIPER_DIR%\piper\piper.exe" --model "%PIPER_DIR%\fr_FR-siwis-medium.onnx" --length_scale 1.3 --sentence_silence 1.2 --output_file "%TEMP%\dictee-%%f.wav"
  ffmpeg -y -loglevel error -i "%TEMP%\dictee-%%f.wav" -ac 1 -b:a 64k "%OUT%\%%f.mp3"
)
echo.
echo Termine. Les MP3 sont dans public\audio\dictees\ce2-1
