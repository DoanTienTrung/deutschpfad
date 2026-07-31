<#
Fetches a video's German subtitles via yt-dlp, run from YOUR OWN machine (not the server) --
YouTube blocks the production server's datacenter IP with "Sign in to confirm you're not a bot",
but a normal home IP isn't flagged, so this works with no cookies/auth needed.

The result is copied straight to your clipboard as raw VTT text -- paste it (Ctrl+V) into the
"Dán transcript" box in Admin (or in "Video của tôi" if adding it there). The backend already
knows how to parse raw VTT content pasted into that box (see TranscriptParser.java), so no other
setup is needed on the app side.

Usage:
  .\fetch-transcript.ps1 https://www.youtube.com/watch?v=dQw4w9WgXcQ
  .\fetch-transcript.ps1 dQw4w9WgXcQ
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$VideoLink
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

if (-not (Get-Command yt-dlp -ErrorAction SilentlyContinue)) {
    Write-Error "Không tìm thấy yt-dlp trên máy. Cài bằng: pip install yt-dlp"
    exit 1
}

$videoId = $VideoLink
if ($VideoLink -match '(?:v=|youtu\.be/|shorts/)([a-zA-Z0-9_-]{11})') {
    $videoId = $Matches[1]
}

$tempDir = Join-Path $env:TEMP "fetch-transcript-$([guid]::NewGuid())"
New-Item -ItemType Directory -Path $tempDir | Out-Null

try {
    $outputTemplate = Join-Path $tempDir "sub.%(ext)s"
    & yt-dlp --write-auto-sub --write-sub --sub-lang de --sub-format vtt --skip-download -o $outputTemplate "https://www.youtube.com/watch?v=$videoId"

    $vttFile = Get-ChildItem -Path $tempDir -Filter '*.vtt' | Select-Object -First 1
    if (-not $vttFile) {
        Write-Warning "Video này không có phụ đề tiếng Đức (CC) để lấy."
        exit 1
    }

    # Get-Content's default encoding for a BOM-less file misread yt-dlp's UTF-8 output as the
    # system codepage on this machine, corrupting every non-ASCII German character (ü, –, ’ …)
    # before it ever reached the clipboard -- reading the bytes explicitly as UTF-8 avoids that.
    $vttText = [System.IO.File]::ReadAllText($vttFile.FullName, [System.Text.Encoding]::UTF8)
    Set-Clipboard -Value $vttText
    Write-Host "Đã copy transcript vào clipboard. Dán (Ctrl+V) vào ô 'Dán transcript' trong Admin." -ForegroundColor Green
}
finally {
    Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
}
