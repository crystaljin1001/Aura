# Video Upload Feature Setup

## What's New

Added a **file upload option** alongside the existing Tella/Arcade URL input. Users can now either:
- **Paste URL**: Link to Tella/Arcade recorded videos
- **Upload File**: Upload video files directly from their computer

## Features

### Upload Modal Updates
- Toggle between "Paste URL" and "Upload File" modes
- Drag & drop video file support
- File validation (type, size)
- Upload progress indicator
- Supported formats: MP4, WebM, MOV
- Maximum file size: 50MB

### Backend
- Video files stored in Supabase Storage (`project-videos` bucket)
- Files organized by user ID
- RLS policies for secure access
- Public URLs for video playback

## Setup Instructions

### 1. Apply the Database Migration

Go to your Supabase Dashboard:
1. Navigate to **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of:
   ```
   supabase/migrations/20260220_create_video_storage.sql
   ```
4. Click **Run**

This will create:
- ✅ `project-videos` storage bucket
- ✅ RLS policies for upload/delete
- ✅ Public read access for videos

### 2. Verify Storage Bucket

1. Go to **Storage** in Supabase Dashboard
2. Confirm `project-videos` bucket exists
3. Check bucket settings:
   - ✅ Public: ON
   - ✅ File size limit: 52428800 bytes (50MB)
   - ✅ Allowed MIME types: video/mp4, video/webm, video/quicktime

### 3. Test the Feature

1. Go to: http://localhost:3000/dashboard
2. Click **Record Video Demo** on any project
3. Switch to **Upload File** tab
4. Try uploading a video file:
   - Should show file size and name after selection
   - Upload progress bar should appear
   - Video URL should be saved after upload completes

## File Storage Structure

Videos are stored with this path format:
```
project-videos/{user_id}/{owner-repo}-{timestamp}.{ext}
```

Example:
```
project-videos/e4f2df95-acee-4e5e-871d-7d76425cddfe/crystaljin1001-Aura-1708473845123.mp4
```

## Usage Guidelines for Users

### When to Use URL vs Upload
- **Use URL (Recommended for large files)**:
  - YouTube: Best for videos over 50MB (unlimited size, free hosting)
  - Tella/Arcade: Professional recording tools with hosting included
- **Use Upload**: For small videos under 50MB recorded with OBS, QuickTime, etc.

### Best Practices
- **Resolution**: 1920x1080 or 1280x720 recommended
- **Duration**: Keep under 5 minutes for better performance
- **Format**: MP4 with H.264 codec for best compatibility
- **Size**: Keep under 50MB (Supabase free tier limit)

## Troubleshooting

### Upload Fails
- Check file size (must be < 50MB)
- Verify file format (MP4, WebM, or MOV)
- Ensure you're logged in

### File Size Limit (Free Tier)
- Supabase free tier limits file uploads to 50MB
- To upload larger videos (up to 5GB), upgrade to Supabase Pro
- **Recommended**: Use YouTube for videos over 50MB (unlimited, free)

### Using YouTube Videos
- Upload your video to YouTube (can be "Unlisted" for privacy)
- Copy the video URL (e.g., `https://www.youtube.com/watch?v=abc123`)
- Paste in the "Paste URL" field
- Supports: YouTube, Tella, Arcade, and most video hosting URLs

### Storage Bucket Not Found
- Run the migration SQL in Supabase Dashboard
- Verify bucket exists in Storage section

### RLS Policy Errors
- Ensure you're authenticated
- Check that policies were created correctly
- User ID in file path must match authenticated user

## Technical Details

### Server Action
```typescript
uploadProjectVideo(formData, onProgress?)
```
- Accepts FormData with video file
- Validates file type and size
- Uploads to Supabase Storage
- Saves public URL to project_videos table
- Optional progress callback

### Client Component
```typescript
<VideoUploadModal project={project} isOpen={true} onClose={fn} />
```
- Tabbed interface (URL | File)
- File input with drag & drop
- Progress tracking
- Error handling

## Next Steps

After testing, you may want to add:
- [ ] Video thumbnail generation
- [ ] Transcoding for optimized playback
- [ ] CDN integration for faster delivery
- [ ] Automatic compression for large files
