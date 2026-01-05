@echo off
REM Build the package
echo Building package...
call npm run build

if %errorlevel% neq 0 (
    echo Build failed. Aborting publish.
    exit /b 1
)

REM Check if user is logged in to npm
echo Checking npm login status...
call npm whoami

if %errorlevel% neq 0 (
    echo Not logged in to npm. Please run 'npm login' first.
    exit /b 1
)

REM Publish to npm
echo Publishing to npm...
call npm publish --access public

if %errorlevel% equ 0 (
    echo Package published successfully!
) else (
    echo Publishing failed.
    exit /b 1
)
