# Railway Database Setup - DO THIS NOW

**Your Database Connection String (Verified & Ready):**

```
postgresql://postgres:2d69Sh4GgoVVXEOd@db.jvgsmiqsqtqgfagghoiv.supabase.co:5432/postgres
```

⬆️ **COPY THIS EXACT STRING** - You'll need it below

---

## 2-Minute Setup

### 1. Open Railway Dashboard
https://railway.app/dashboard

### 2. Navigate to Backend Service
- Click project: **diplomatic-simplicity**
- Click service: **backend**
- Click tab: **Variables**

### 3. Add DATABASE_URL Variable
- Click: **+ New Variable**
- Name: `DATABASE_URL`
- Value: Paste the connection string above
- Press: Enter

### 4. Deploy
- Click the **Deploy** button (top right)
- Wait for deployment to complete (watch for green checkmark)

### 5. Verify It Works
Once deployment is done:
1. Go to: https://tvp-redesign-2026.vercel.app
2. Try logging in (any email/password)
3. If it loads → **You're live!** 🚀

---

## If You Get Stuck

**"Deploy button not visible?"**
- Scroll down on the Variables page
- Deploy button should be at the bottom or top right

**"Variable won't save?"**
- Make sure you pressed Enter after pasting the value
- The value must be the exact connection string above (no extra spaces)

**"Still seeing loading screen on frontend?"**
- Wait 30 seconds for Railway to fully redeploy
- Refresh the frontend page (Ctrl+Shift+R for hard refresh)
- Check Railway logs for connection success

**"Login still doesn't work?"**
- Open browser DevTools (F12)
- Go to Console tab
- Look for error messages
- Share them and we'll debug

---

## You're Almost There!

This is the final step. Once DATABASE_URL is set and Railway redeploys, your entire system will work.

**Expected time: ~2-3 minutes total**

Go get it! 💪
