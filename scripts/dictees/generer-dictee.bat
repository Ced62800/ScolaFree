@echo off
rem Genere les MP3 d'une dictee a partir de son identifiant (voix Piper fr_FR-siwis-medium).
rem Usage, depuis le dossier scolafree :
rem   .\scripts\dictees\generer-dictee.bat ce1-1
rem   .\scripts\dictees\generer-dictee.bat ce1-1 --ecraser   (pour remplacer des MP3 existants)
rem Les phrases sont lues dans lib\entrainement\dictees.ts.
chcp 65001 >nul
if "%~1"=="" (
  echo Il manque l'identifiant de la dictee. Exemple : generer-dictee.bat ce1-1
  exit /b 1
)
node --no-warnings --experimental-strip-types "%~dp0generer-dictee.mjs" %*
exit /b %errorlevel%
