@echo off
setlocal enabledelayedexpansion

rem Initialize an empty variable
set "args="

rem Loop through each directory in components\ui and append its name to args
for /f "delims=" %%a in ('dir /b /ad components\ui') do (
    set "args=!args! %%a"
)

rem Show the command being run
echo Running: npx gluestack-ui@latest add!args!
echo.

rem Run the gluestack add command
npx gluestack-ui@latest add!args!

endlocal
