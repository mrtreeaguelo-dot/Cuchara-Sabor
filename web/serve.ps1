$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add('http://localhost:8765/')
$listener.Start()
Write-Host 'Server started on http://localhost:8765 (no-cache)'
$root = $PSScriptRoot

while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response
    $path = $req.Url.LocalPath
    if ($path -eq '/') { $path = '/index.html' }
    $file = Join-Path $root ($path.TrimStart('/').Replace('/', '\'))
    
    # Add no-cache headers
    $res.Headers.Add('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    $res.Headers.Add('Pragma', 'no-cache')
    $res.Headers.Add('Expires', '0')
    
    if (Test-Path $file) {
        $ext = [System.IO.Path]::GetExtension($file)
        $types = @{
            '.html' = 'text/html;charset=utf-8'
            '.css'  = 'text/css;charset=utf-8'
            '.js'   = 'application/javascript;charset=utf-8'
            '.json' = 'application/json'
            '.png'  = 'image/png'
            '.jpg'  = 'image/jpeg'
            '.webp' = 'image/webp'
            '.svg'  = 'image/svg+xml'
        }
        $res.ContentType = if ($types[$ext]) { $types[$ext] } else { 'application/octet-stream' }
        $bytes = [System.IO.File]::ReadAllBytes($file)
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $res.StatusCode = 404
        $msg = [System.Text.Encoding]::UTF8.GetBytes('Not found: ' + $file)
        $res.OutputStream.Write($msg, 0, $msg.Length)
    }
    $res.Close()
}
