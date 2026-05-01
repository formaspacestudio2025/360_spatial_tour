# C:\Users\H68618\Downloads\360_spatial_tour\test_asset_state_and_timeline.ps1
# PowerShell script to verify Asset State Machine (Module 8) and
# Asset Timeline / Digital Twin (Module 9) APIs.

# Configuration – replace JWT with a valid token from your logged-in session
$baseUrl = "http://localhost:3000/api"
$authHeader = @{ Authorization = "Bearer REPLACE_WITH_YOUR_JWT" }

function Invoke-Api {
    param(
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers = $null,
        $Body = $null,
        [hashtable]$Params = $null
    )
    $invokeParams = @{
        Method      = $Method
        Uri         = $Url
        Headers     = $Headers
        ContentType = "application/json"
    }
    if ($Body) { $invokeParams.Body = ($Body | ConvertTo-Json -Depth 10) }
    if ($Params) {
        $query = ($Params.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join "&"
        $invokeParams.Uri = $Url + "?" + $query
    }
    try {
        $response = Invoke-RestMethod @invokeParams
        Write-Host "✅ $Method $Url" -ForegroundColor Green
        return $response
    } catch {
        Write-Host "❌ $Method $Url => $($_.Exception.Message)" -ForegroundColor Red
        return $_.Exception.Response
    }
}

# ---------------------------------------------------------------
# 1. Create a test asset
# ---------------------------------------------------------------
$assetPayload = @{
    name   = "Test Asset $(Get-Date -Format 'yyyyMMddHHmmss')"
    type   = "HVAC"
    status = "commissioning"
}
$asset = Invoke-Api -Method POST -Url "$baseUrl/assets" -Headers $authHeader -Body $assetPayload
$assetId = $asset.id
Write-Host "`nCreated asset ID: $assetId`n"

# ---------------------------------------------------------------
# 2. Valid state transitions
# ---------------------------------------------------------------
$transitions = @(
    @{ to = "active";        reason = "Initial activation" },
    @{ to = "maintenance";   reason = "Scheduled maintenance" },
    @{ to = "active";        reason = "Maintenance completed" }
)

foreach ($t in $transitions) {
    $body = @{
        newStatus = $t.to
        reason    = $t.reason
        userId    = "test-user"
    }
    $res = Invoke-Api -Method PUT -Url "$baseUrl/assets/$assetId/transition" -Headers $authHeader -Body $body
    Write-Host "Transition to $($t.to) response:" $res
    Start-Sleep -Milliseconds 200
}

# ---------------------------------------------------------------
# 3. Invalid transition (disposed → active) – should fail
# ---------------------------------------------------------------
# First move asset to decommissioned → disposed
Invoke-Api -Method PUT -Url "$baseUrl/assets/$assetId/transition" -Headers $authHeader -Body @{
    newStatus = "decommissioned"
    reason    = "End of life"
    userId    = "test-user"
}
Invoke-Api -Method PUT -Url "$baseUrl/assets/$assetId/transition" -Headers $authHeader -Body @{
    newStatus = "disposed"
    reason    = "Dispose asset"
    userId    = "test-user"
}

Write-Host "`nAttempting invalid transition (disposed → active):"
$invalid = Invoke-Api -Method PUT -Url "$baseUrl/assets/$assetId/transition" -Headers $authHeader -Body @{
    newStatus = "active"
    reason    = "Should fail"
    userId    = "test-user"
}
Write-Host "Invalid transition response:" $invalid

# ---------------------------------------------------------------
# 4. Log timeline events
# ---------------------------------------------------------------
$eventTypes = @(
    @{ type="inspected";      title="Quarterly Inspection"; description="All OK";               metadata=@{} },
    @{ type="maintained";     title="HVAC Filter Change";    description="Replaced filter";      metadata=@{ cost=150 } },
    @{ type="health_changed"; title="Health Score Updated";  description="Score improved to 85"; metadata=@{ score=85 } },
    @{ type="document_added"; title="Manual Added";         description="Service manual uploaded"; metadata=@{} },
    @{ type="warranty_claimed"; title="Warranty Claim";      description="Compressor failure";     metadata=@{ cost=1200 } }
)

foreach ($ev in $eventTypes) {
    $body = @{
        event_type  = $ev.type
        title       = $ev.title
        description = $ev.description
        metadata    = $ev.metadata
    }
    $res = Invoke-Api -Method POST -Url "$baseUrl/asset-events/$assetId/events" -Headers $authHeader -Body $body
    Write-Host "Logged event: $($ev.type)"
    Start-Sleep -Milliseconds 200
}

# ---------------------------------------------------------------
# 5. Fetch timeline (paginated)
# ---------------------------------------------------------------
Write-Host "`nFetching timeline (first 10 events):"
$timeline = Invoke-Api -Method GET -Url "$baseUrl/asset-events/$assetId/timeline" -Headers $authHeader -Params @{ limit=10; offset=0 }
Write-Host "Total events: $($timeline.total)"
$timeline.data | ForEach-Object { Write-Host "  - $($_.event_type): $($_.title) [$($_.created_at)]" }

# ---------------------------------------------------------------
# 6. Fetch digital twin summary
# ---------------------------------------------------------------
Write-Host "`nFetching digital twin summary:"
$summary = Invoke-Api -Method GET -Url "$baseUrl/asset-events/$assetId/summary" -Headers $authHeader
Write-Host "Inspections: $($summary.data.total_inspections)"
Write-Host "Maintenance: $($summary.data.total_maintenance)"
Write-Host "Issues Resolved: $($summary.data.resolved_issues)/$($summary.data.total_issues)"
Write-Host "Uptime: $($summary.data.uptime_percentage)%"
Write-Host "MTBF: $($summary.data.mtbf_days) days"
Write-Host "Total Cost: $($summary.data.total_cost)"
Write-Host "Health Trend: $($summary.data.health_trend)"

Write-Host "`n✅ Test script complete. Review output above for errors." -ForegroundColor Cyan
