# LM Studio AI Setup Guide

## Step 1: Install LM Studio

1. Download from: https://lmstudio.ai
2. Install on your machine
3. Open LM Studio

## Step 2: Download a Vision-Enabled Model

**Recommended Models:**
- `llava-v1.6-vicuna-7b` (best for object detection)
- `bakllava` (good alternative)
- `llava-1.5-7b` (lighter version)

**How to download:**
1. Click "Search" in LM Studio
2. Search for "llava"
3. Click download on your chosen model
4. Wait for download to complete (2-4 GB)

## Step 3: Start Local Server

1. Go to "Local Server" tab (icon on left)
2. Select your downloaded model from dropdown
3. Click "Start Server"
4. Server will run on: `http://localhost:1234`

**Verify it's working:**
```bash
curl http://localhost:1234/v1/models
```

You should see your loaded model listed.

## Step 4: Configure Environment

In `backend/.env`:
```env
LM_STUDIO_URL=http://localhost:1234
LM_STUDIO_MODEL=local-model
```

## Step 5: Test AI Processing

Once your backend is running:

```bash
# Process a single scene
curl -X POST http://localhost:3000/api/walkthroughs/{walkthrough_id}/scenes/{scene_id}/ai/process

# Process all scenes in walkthrough
curl -X POST http://localhost:3000/api/walkthroughs/{walkthrough_id}/ai/process-all
```

## Troubleshooting

### "Cannot connect to LM Studio"
- Make sure LM Studio server is running
- Check port 1234 is not blocked
- Verify model is loaded

### "Vision not supported"
- You need a vision-enabled model (LLaVA, BakLLaVA)
- Regular text models won't work for image analysis

### Slow processing
- 360° images are split into 6 segments
- Each segment takes 5-15 seconds
- Total: 30-90 seconds per scene
- Consider using GPU acceleration in LM Studio settings

## AI Features Available

✅ **Object Detection** - Identifies furniture, equipment, structural elements
✅ **Damage Detection** - Finds cracks, water damage, hazards
✅ **Spatial Analysis** - Understands relationships between objects
✅ **Tag Generation** - Auto-generates descriptive tags
✅ **Confidence Scoring** - Rates detection accuracy (0-100%)

## Next Steps

After AI processing:
1. View AI tags overlaid on 360° viewer
2. Edit/correct tags via Tag Editor
3. Link tags to issues for tracking
4. Use AI insights for facility management

---

**AI processing is completely local - no data leaves your machine!** 🔒
