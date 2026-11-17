
$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "../..")).Path
$gitignore = Join-Path $root ".gitignore"
$agents = Join-Path $root "AGENTS.md"

$fallos = 0
$exitos = 0

function Test-Resultado {

    param([string]$Nombre, [bool]$Condicion)
    if ($Condicion) {
        Write-Host "[OK] $Nombre" -ForegroundColor Green
        $script:exitos++
    }
    else {
        Write-Host "[ERROR] $Nombre" -ForegroundColor Red
        $script:fallos++
    }
}

function Test-RutaDentroDelRepo {

    param([string]$Ruta)
    $rutaCompleta = [System.IO.Path]::GetFullPath($Ruta)
    $raizCompleta = [System.IO.Path]::GetFullPath($root)
    $prefijo = $raizCompleta.TrimEnd([char[]]@('\', '/')) + [System.IO.Path]::DirectorySeparatorChar

    return ( 
        $rutaCompleta.Equals( $raizCompleta, [System.StringComparison]::OrdinalIgnoreCase) -or
        $rutaCompleta.StartsWith( $prefijo, [System.StringComparison]::OrdinalIgnoreCase )
    )
}

Write-Host "`nVALIDACION DE SEGURIDAD" -ForegroundColor Cyan
Write-Host "Repositorio: $root`n"

Test-Resultado "Existe AGENTS.md" (Test-Path $agents)
Test-Resultado "Existe .gitignore" (Test-Path $gitignore)

$archivos = @( "ia/README.md", "ia/bitacora.md", "ia/tests/validar-config.ps1")

foreach ($archivo in $archivos) {

    Test-Resultado "Existe $archivo" ( Test-Path (Join-Path $root $archivo))
}

if (Test-Path $agents) {

    $contenido = Get-Content $agents -Raw
    Test-Resultado "Reglas sobre archivos .env" ( $contenido.Contains(".env"))
    Test-Resultado "Restriccion de carpeta de trabajo" ( $contenido.Contains("exclusivamente dentro de la raíz"))
}

if (Test-Path $gitignore) {

    $sensibles = @(
        ".env",
        ".env.local",
        ".env.production",
        "serviceAccount.json",
        "private.pem",
        "release.keystore",
        "google-services.json",
        "GoogleService-Info.plist"
    )

    foreach ($archivo in $sensibles) {

        git -C $root check-ignore --no-index --quiet -- $archivo
        Test-Resultado "Git ignora $archivo" ( $LASTEXITCODE -eq 0)
    }
    git -C $root check-ignore --no-index --quiet -- ".env.example"
    Test-Resultado "Git permite .env.example" (  $LASTEXITCODE -ne 0)
}

$rutaInterna = Join-Path $root "ia/README.md"
$rutaExterna = Join-Path $root "../archivo-externo.txt"
Test-Resultado "Acepta ruta dentro del repositorio" ( Test-RutaDentroDelRepo $rutaInterna)
Test-Resultado "Rechaza ruta fuera del repositorio" ( -not (Test-RutaDentroDelRepo $rutaExterna))
Write-Host "`nRESULTADO FINAL" -ForegroundColor Cyan
Write-Host "Pruebas correctas: $exitos"
Write-Host "Pruebas fallidas: $fallos"

if ($fallos -gt 0) {
    exit 1
}

Write-Host "`nCONFIGURACION VALIDADA" -ForegroundColor Green
exit 0
