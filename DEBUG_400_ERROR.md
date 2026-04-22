# 🔍 400 ERROR DEBUGGING GUIDE

## WHAT 400 MEANS

**400 Bad Request** = Server received the request but rejected it due to invalid data.

Most likely causes:
1. ❌ No files received by multer
2. ❌ Authentication failed (invalid/missing token)
3. ❌ Missing required fields

---

## 🛠️ DEBUG STEPS

### Step 1: Check Browser Console

Open F12 → Console → Look for the alert message. It should say:
```
Upload failed: Request failed with status code 400
```

Now look ABOVE that for:
```
[MediaManager] Uploading files: ["filename.jpg"]
[MediaManager] Failed to upload files: {...}
```

**Copy the full error object** - it will tell us exactly what went wrong.

---

### Step 2: Check Network Tab

F12 → Network tab → Filter by "hotspot-media"

Click the request → Check:

**Request Headers**:
```
Authorization: Bearer eyJhbGc...  ← Is this present?
Content-Type: multipart/form-data; boundary=----WebKit...  ← Is boundary present?
```

**Request Payload** (should show FormData):
```
files: (binary)  ← Are files being sent?
```

**Response**:
```json
{
  "message": "No files uploaded"  // or
  "message": "Unauthorized"  // or
  "message": "..."
}
```

**This response message is KEY** - it tells us exactly what's wrong!

---

### Step 3: Use Test Page (EASIEST DEBUG METHOD)

I created a standalone test page for you:

1. Open: `c:\Users\H68618\Downloads\360_spatial_tours\test-upload.html`
   (Just double-click the file)

2. Get your auth token:
   - Open your app at http://localhost:5173
   - Login as admin
   - Open F12 console
   - Type: `localStorage.getItem('auth-token')`
   - Copy the token

3. Get a hotspot ID:
   - In your app, open a walkthrough
   - Open F12 console
   - Look at network requests for hotspot data
   - Or check: `c:\Users\H68618\Downloads\360_spatial_tours\backend\data\db.json`
   - Find a hotspot ID from `navigation_edges` array

4. Fill in the test page:
   - Paste auth token
   - Paste hotspot ID  
   - Select files
   - Click "Test Upload"

5. **The test page will show you the EXACT error message**

---

## 🐛 COMMON CAUSES & FIXES

### Cause 1: Not Logged In
**Symptom**: 401 or 400 error
**Fix**: Login again at http://localhost:5173/login

### Cause 2: Token Expired
**Symptom**: 401 Unauthorized
**Fix**: Logout and login again

### Cause 3: Wrong User Role
**Symptom**: 403 Forbidden
**Fix**: Login as admin, editor, or manager (not viewer)

### Cause 4: Files Not Being Sent
**Symptom**: 400 "No files uploaded"
**Fix**: Check if FormData is created correctly

### Cause 5: Invalid Hotspot ID
**Symptom**: 400 or 500 error
**Fix**: Make sure hotspot ID exists in database

---

## 📋 QUICK CHECKLIST

- [ ] Backend running on port 3000 (check terminal)
- [ ] Frontend running on port 5173
- [ ] Logged in as admin/editor/manager
- [ ] Valid hotspot ID (exists in database)
- [ ] Files selected (not empty)
- [ ] Browser console shows: `[MediaManager] Uploading files: [...]`
- [ ] Network tab shows Authorization header
- [ ] Network tab shows Content-Type with boundary

---

## 🎯 WHAT I NEED FROM YOU

Please provide:

1. **The exact error message** from the alert popup
2. **The response body** from Network tab (the JSON)
3. **Browser console logs** (the red error text)
4. **Backend terminal logs** (if you can see them)

OR

**Just use the test page** (`test-upload.html`) and tell me what it shows!

---

## 🔧 ALREADY APPLIED FIXES

✅ Added `/api` prefix to all API calls
✅ Removed manual Content-Type header
✅ Added detailed backend logging
✅ Added detailed frontend error messages
✅ Created standalone test page

---

**Try the test page FIRST - it will give us the exact error!** 🚀
