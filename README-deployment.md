# TrashSnap Camera Classifier - Cloudflare Pages Deployment

## 🚀 Features

- **📱 Smartphone Camera Support**: Automatically uses rear camera on mobile devices
- **📁 File Upload**: Alternative way to upload images from device
- **🎯 AI Classification**: Connects to your TrashSnap Worker for image analysis
- **📱 Mobile Responsive**: Optimized for smartphone usage
- **🔒 HTTPS**: Required for camera access (automatically provided by Cloudflare Pages)

## 🆓 Free Cloudflare Pages Deployment

### Step 1: Prepare Your Repository

1. Create a new GitHub repository (public or private)
2. Upload the `index.html` file to the root of your repository
3. Commit and push the changes

### Step 2: Deploy to Cloudflare Pages

1. **Login to Cloudflare Dashboard**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Navigate to "Pages" in the sidebar

2. **Create a New Project**
   - Click "Create a project"
   - Select "Connect to Git"
   - Choose your GitHub repository

3. **Build Settings**
   - **Project name**: `trashsnap-camera` (or your preferred name)
   - **Production branch**: `main` (or your default branch)
   - **Build command**: Leave empty (static site)
   - **Build output directory**: Leave empty (files are in root)

4. **Deploy**
   - Click "Save and Deploy"
   - Your site will be available at `https://trashsnap-camera.pages.dev` (or your chosen name)

### Step 3: Custom Domain (Optional)

If you have a custom domain:
1. Go to your Pages project settings
2. Click "Custom domains"
3. Add your domain and follow DNS setup instructions

## 📱 Usage Instructions

### On Mobile:
1. Open the deployed site in your mobile browser
2. Click "Start Camera" 
3. Grant camera permissions when prompted
4. Point camera at trash/recyclable items
5. Click "Capture Photo"
6. View AI classification results

### Important Notes:
- **HTTPS Required**: Camera access only works on HTTPS (Cloudflare Pages provides this automatically)
- **Permissions**: Users must grant camera permissions
- **Rear Camera**: The app automatically prefers the rear camera on mobile devices
- **Cross-Origin**: Make sure your TrashSnap Worker has proper CORS headers

## 🔧 Worker CORS Configuration

Make sure your TrashSnap Worker includes these CORS headers:

```javascript
// Add to your worker response
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
```

## 💰 Cloudflare Pages Free Tier Limits

- **Builds**: 500 builds per month
- **Bandwidth**: Unlimited
- **Requests**: Unlimited
- **Custom domains**: 100 per project
- **Preview deployments**: Unlimited

Perfect for this static camera app! 🎉

## 🔧 Troubleshooting

**Camera not working?**
- Ensure you're using HTTPS
- Check browser permissions
- Try on different browsers/devices

**Classification not working?**
- Verify your Worker URL is correct
- Check Worker CORS configuration
- Ensure Worker is deployed and accessible

**Site not loading?**
- Check Cloudflare Pages build logs
- Verify `index.html` is in repository root
- Check for any JavaScript errors in browser console 