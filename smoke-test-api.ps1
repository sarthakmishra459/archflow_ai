$base = 'http://127.0.0.1:8080/api/api'
$suffix = Get-Random -Minimum 1000 -Maximum 9999
$username = "testuser$suffix"
$email = "$username@example.com"
$password = 'TestPass123!'

function Fail($name, $ex) {
    Write-Host ('FAIL ' + $name + ': ' + $ex.Exception.Message)
    if ($ex.Exception.Response -ne $null) {
        $reader = New-Object System.IO.StreamReader($ex.Exception.Response.GetResponseStream())
        Write-Host $reader.ReadToEnd()
    }
    exit 1
}

Write-Host 'REGISTER'
$user = @{ username = $username; email = $email; password = $password } | ConvertTo-Json
try {
    $reg = Invoke-RestMethod -Uri "$base/auth/register" -Method Post -Body $user -ContentType 'application/json' -ErrorAction Stop
    Write-Host 'OK'
    $token = $reg.token
} catch {
    Fail 'REGISTER' $_
}

Write-Host 'LOGIN'
$login = @{ username = $username; password = $password } | ConvertTo-Json
try {
    $auth = Invoke-RestMethod -Uri "$base/auth/login" -Method Post -Body $login -ContentType 'application/json' -ErrorAction Stop
    Write-Host 'OK'
    $token = $auth.token
} catch {
    Fail 'LOGIN' $_
}

$headers = @{ Authorization = "Bearer $token" }

Write-Host 'ANALYTICS'
try {
    $an = Invoke-RestMethod -Uri "$base/analytics" -Method Get -Headers $headers -ErrorAction Stop
    Write-Host 'OK'
    $an | ConvertTo-Json -Depth 5
} catch {
    Fail 'ANALYTICS' $_
}

Write-Host 'CREATE DIAGRAM'
$emptyGraph = @{ nodes = @(); edges = @() } | ConvertTo-Json -Compress
$diagram = @{ name = 'Test Diagram'; description = 'API smoke test'; graphJson = $emptyGraph; isPublic = $false } | ConvertTo-Json
try {
    $created = Invoke-RestMethod -Uri "$base/diagrams" -Method Post -Headers $headers -Body $diagram -ContentType 'application/json' -ErrorAction Stop
    Write-Host 'OK'
    $id = $created.id
} catch {
    Fail 'CREATE DIAGRAM' $_
}

Write-Host 'LIST DIAGRAMS'
try {
    $list = Invoke-RestMethod -Uri "$base/diagrams" -Method Get -Headers $headers -ErrorAction Stop
    Write-Host 'OK'
    $list | ConvertTo-Json -Depth 5
} catch {
    Fail 'LIST DIAGRAMS' $_
}

Write-Host 'GET DIAGRAM'
try {
    $single = Invoke-RestMethod -Uri "$base/diagrams/$id" -Method Get -Headers $headers -ErrorAction Stop
    Write-Host 'OK'
    $single | ConvertTo-Json -Depth 5
} catch {
    Fail 'GET DIAGRAM' $_
}

Write-Host 'UPDATE DIAGRAM'
$updatedGraph = @{ nodes = @( @{ id = 'n1' } ); edges = @() } | ConvertTo-Json -Compress
$updated = @{ name = 'Updated Test Diagram'; description = 'Updated API smoke test'; graphJson = $updatedGraph; isPublic = $false } | ConvertTo-Json
try {
    $upd = Invoke-RestMethod -Uri "$base/diagrams/$id" -Method Put -Headers $headers -Body $updated -ContentType 'application/json' -ErrorAction Stop
    Write-Host 'OK'
    $upd | ConvertTo-Json -Depth 5
} catch {
    Fail 'UPDATE DIAGRAM' $_
}

Write-Host 'VERSION SNAPSHOT'
try {
    $ver = Invoke-RestMethod -Uri "$base/diagrams/$id/version" -Method Post -Headers $headers -ErrorAction Stop
    Write-Host 'OK'
    $verId = $ver.id
} catch {
    Fail 'VERSION SNAPSHOT' $_
}

Write-Host 'GET VERSIONS'
try {
    $versions = Invoke-RestMethod -Uri "$base/diagrams/$id/versions" -Method Get -Headers $headers -ErrorAction Stop
    Write-Host 'OK'
    $versions | ConvertTo-Json -Depth 5
} catch {
    Fail 'GET VERSIONS' $_
}

Write-Host 'ROLLBACK'
try {
    $rollback = Invoke-RestMethod -Uri "$base/diagrams/$id/rollback/$verId" -Method Post -Headers $headers -ErrorAction Stop
    Write-Host 'OK'
    $rollback | ConvertTo-Json -Depth 5
} catch {
    Fail 'ROLLBACK' $_
}

Write-Host 'DELETE DIAGRAM'
try {
    $del = Invoke-WebRequest -Uri "$base/diagrams/$id" -Method Delete -Headers $headers -UseBasicParsing -ErrorAction Stop
    Write-Host 'OK' $del.StatusCode
} catch {
    Fail 'DELETE DIAGRAM' $_
}

Write-Host 'AI GENERATE'
$aiGen = @{ prompt = 'Create graph JSON for a 3-node service flow'; provider = 'gemini' } | ConvertTo-Json
try {
    $gen = Invoke-RestMethod -Uri "$base/ai/generate" -Method Post -Headers $headers -Body $aiGen -ContentType 'application/json' -ErrorAction Stop
    Write-Host 'OK'
    $gen | ConvertTo-Json -Depth 5
} catch {
    Fail 'AI GENERATE' $_
}

Write-Host 'AI EDIT'
$currentGraph = @{ nodes = @( @{ id = 'n1' } ); edges = @() } | ConvertTo-Json -Compress
$aiEdit = @{ editInstruction = 'Add one extra node'; currentGraphJson = $currentGraph; provider = 'gemini' } | ConvertTo-Json
try {
    $edit = Invoke-RestMethod -Uri "$base/ai/edit" -Method Post -Headers $headers -Body $aiEdit -ContentType 'application/json' -ErrorAction Stop
    Write-Host 'OK'
    $edit | ConvertTo-Json -Depth 5
} catch {
    Fail 'AI EDIT' $_
}

Write-Host 'ALL API TESTS PASSED'