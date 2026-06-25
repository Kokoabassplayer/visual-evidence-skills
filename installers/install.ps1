$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Resolve-Path (Join-Path $ScriptDir "..")
$Installer = Join-Path $RepoRoot "packages\installer\bin\install.mjs"

if (Get-Command node -ErrorAction SilentlyContinue) {
    & node $Installer @args
    exit $LASTEXITCODE
}

if (Get-Command npx -ErrorAction SilentlyContinue) {
    & npx "@visual-evidence/install@latest" @args
    exit $LASTEXITCODE
}

Write-Error "Visual Evidence installer requires Node.js or npx."
exit 1