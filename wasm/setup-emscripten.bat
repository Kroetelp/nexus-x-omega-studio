@echo off
REM NEXUS-X WASM Build Setup Script for Windows
REM This script installs Emscripten and builds the WASM module

echo ========================================
echo   NEXUS-X WASM Build Setup
echo ========================================
echo.

REM Check if emcc is already available
where emcc >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Emscripten is already installed!
    emcc --version
    echo.
    goto BUILD
)

REM Check for EMSDK
if exist "%USERPROFILE%\emsdk\emsdk_env.bat" (
    echo [INFO] Found EMSDK, activating...
    call "%USERPROFILE%\emsdk\emsdk_env.bat"
    goto BUILD
)

echo [INFO] Emscripten not found. Installing...
echo.

REM Create emsdk directory
if not exist "%USERPROFILE%\emsdk" (
    echo [INFO] Cloning EMSDK...
    git clone https://github.com/emscripten-core/emsdk.git "%USERPROFILE%\emsdk"
)

REM Install and activate
cd /d "%USERPROFILE%\emsdk"
echo [INFO] Installing latest Emscripten...
call emsdk install latest
call emsdk activate latest

echo.
echo [SUCCESS] Emscripten installed!
echo.
echo [IMPORTANT] Add this to your PATH or run before building:
echo   call %USERPROFILE%\emsdk\emsdk_env.bat
echo.

:BUILD
echo ========================================
echo   Building WASM Module
echo ========================================
echo.

cd /d "%~dp0"

REM Activate emsdk for this session
if exist "%USERPROFILE%\emsdk\emsdk_env.bat" (
    call "%USERPROFILE%\emsdk\emsdk_env.bat"
)

REM Build
echo [INFO] Compiling nexus-dsp.wasm...
emcc src/main.cpp -o ../public/nexus-dsp.wasm ^
    -O3 ^
    -s WASM=1 ^
    -s STANDALONE_WASM=1 ^
    -s EXPORTED_FUNCTIONS="[ \
        '_initialize', \
        '_getInputBuffer', \
        '_getOutputBuffer', \
        '_process', \
        '_handleMessage', \
        '_registerInstrument', \
        '_setParameter', \
        '_noteOn', \
        '_noteOff', \
        '_resetInstrument', \
        '_setMasterVolume', \
        '_getStatus', \
        '_destroy' \
    ]" ^
    -s EXPORTED_RUNTIME_METHODS="[]" ^
    -I src

if %errorlevel% == 0 (
    echo.
    echo ========================================
    echo   BUILD SUCCESSFUL!
    echo ========================================
    echo.
    echo Output: public/nexus-dsp.wasm
    dir ..\public\nexus-dsp.wasm
) else (
    echo.
    echo [ERROR] Build failed!
)

pause
