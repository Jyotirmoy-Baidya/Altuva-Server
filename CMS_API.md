# CMS API Documentation

Complete API documentation for managing landing page content (Hero Banners).

## 🔐 Authentication

All admin CMS routes require:
- **Bearer Token** in Authorization header
- **Admin approval** (`approved = true`)

## 📦 Hero Banners API

### Database Schema

**Table:** `hero_banners`

| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| id | SERIAL | ✅ | AUTO | Primary key |
| image_url | VARCHAR(500) | ✅ | - | Cloudinary image URL |
| title | VARCHAR(255) | ✅ | - | Main heading text |
| subtitle | VARCHAR(255) | ❌ | - | Subheading text |
| headtext | TEXT | ❌ | - | Additional description |
| text_color | VARCHAR(50) | ❌ | #000000 | Text color (hex) |
| cta_button_color | VARCHAR(50) | ❌ | #000000 | CTA button background color |
| cta_button_text_color | VARCHAR(50) | ❌ | #FFFFFF | CTA button text color |
| cta_button_text | VARCHAR(100) | ❌ | - | CTA button text |
| is_active | BOOLEAN | ✅ | true | Banner active status |
| created_at | TIMESTAMP | ✅ | NOW() | Creation timestamp |
| updated_at | TIMESTAMP | ✅ | NOW() | Last update timestamp |

---

## 🔓 Public Routes

### Get Active Hero Banners

Get all active banners for public display.

```http
GET /api/cms/hero-banners
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "image_url": "https://res.cloudinary.com/ddkuoffft/image/upload/v1234/hero-banners/abc.jpg",
      "title": "Welcome to Altuva",
      "subtitle": "Your subtitle here",
      "headtext": "Additional description text",
      "text_color": "#000000",
      "cta_button_color": "#181818",
      "cta_button_text_color": "#FFFFFF",
      "cta_button_text": "Get Started",
      "is_active": true,
      "created_at": "2026-03-25T00:00:00.000Z",
      "updated_at": "2026-03-25T00:00:00.000Z"
    }
  ]
}
```

---

## 🔒 Admin Routes (Protected)

All routes require: `Authorization: Bearer <token>`

### 1. Get All Hero Banners

Get all banners (including inactive).

```http
GET /admin/cms/hero-banners
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "image_url": "...",
      "title": "...",
      "is_active": true,
      // ... all fields
    }
  ]
}
```

---

### 2. Get Single Banner by ID

```http
GET /admin/cms/hero-banners/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "image_url": "...",
    "title": "...",
    // ... all fields
  }
}
```

---

### 3. Create New Hero Banner

**Important:** This is a **multipart/form-data** request with file upload.

```http
POST /admin/cms/hero-banners
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| image | File | ✅ | Image file (JPEG, PNG, GIF, WebP) Max 5MB |
| title | String | ✅ | Main heading |
| subtitle | String | ❌ | Subheading |
| headtext | String | ❌ | Description |
| text_color | String | ❌ | Hex color (e.g., #000000) |
| cta_button_color | String | ❌ | Hex color |
| cta_button_text_color | String | ❌ | Hex color |
| cta_button_text | String | ❌ | Button text |
| is_active | Boolean/String | ❌ | true/false or "true"/"false" |

**Example with cURL:**
```bash
curl -X POST http://localhost:3000/admin/cms/hero-banners \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/image.jpg" \
  -F "title=Welcome to Altuva" \
  -F "subtitle=Best service ever" \
  -F "headtext=We provide amazing solutions" \
  -F "text_color=#FFFFFF" \
  -F "cta_button_color=#181818" \
  -F "cta_button_text_color=#FFFFFF" \
  -F "cta_button_text=Get Started" \
  -F "is_active=true"
```

**Example with Postman:**
1. Set method to POST
2. URL: `http://localhost:3000/admin/cms/hero-banners`
3. Headers: `Authorization: Bearer YOUR_TOKEN`
4. Body → form-data:
   - Key: `image`, Type: File, Value: Select image
   - Key: `title`, Type: Text, Value: "Your title"
   - ... other fields

**Response:**
```json
{
  "success": true,
  "message": "Banner created successfully",
  "data": {
    "id": 1,
    "image_url": "https://res.cloudinary.com/ddkuoffft/...",
    "title": "Welcome to Altuva",
    // ... all fields
  }
}
```

---

### 4. Update Hero Banner

Update existing banner. Image upload is **optional** - if not provided, existing image is kept.

```http
PUT /admin/cms/hero-banners/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:** (All fields optional)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| image | File | ❌ | New image (replaces old one) |
| title | String | ❌ | New title |
| subtitle | String | ❌ | New subtitle |
| headtext | String | ❌ | New description |
| text_color | String | ❌ | New text color |
| cta_button_color | String | ❌ | New button color |
| cta_button_text_color | String | ❌ | New button text color |
| cta_button_text | String | ❌ | New button text |
| is_active | Boolean/String | ❌ | true/false |

**Example:**
```bash
curl -X PUT http://localhost:3000/admin/cms/hero-banners/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Updated Title" \
  -F "is_active=false"
```

**Response:**
```json
{
  "success": true,
  "message": "Banner updated successfully",
  "data": {
    "id": 1,
    "title": "Updated Title",
    "is_active": false,
    // ... all fields
  }
}
```

---

### 5. Delete Hero Banner

Delete banner and remove image from Cloudinary.

```http
DELETE /admin/cms/hero-banners/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Banner deleted successfully"
}
```

---

## 🖼️ Cloudinary Integration

### Configuration

**Cloud Name:** `ddkuoffft`
**Upload Preset:** `Altuva`
**Folder:** `hero-banners`

### Image Requirements

- **Formats:** JPEG, PNG, GIF, WebP
- **Max Size:** 5MB
- **Storage:** Images uploaded to Cloudinary automatically
- **Deletion:** Images deleted from Cloudinary when banner is deleted

### Environment Variables

Add to `.env`:

```env
CLOUDINARY_CLOUD_NAME=ddkuoffft
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Image file is required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Your account is not approved yet"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Banner not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Failed to create banner",
  "error": "Detailed error message"
}
```

---

## 🧪 Testing the API

### 1. Get Cloudinary Credentials

1. Go to https://cloudinary.com
2. Login to your account (cloud name: ddkuoffft)
3. Go to Dashboard
4. Copy API Key and API Secret
5. Add to `.env` file

### 2. Test Image Upload

```bash
# 1. Login and get token
curl -X POST http://localhost:3000/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@altuva.com","password":"admin123"}'

# 2. Create banner with image
curl -X POST http://localhost:3000/admin/cms/hero-banners \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@hero.jpg" \
  -F "title=Welcome" \
  -F "is_active=true"

# 3. Get all banners
curl http://localhost:3000/admin/cms/hero-banners \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Get public banners (no auth)
curl http://localhost:3000/api/cms/hero-banners
```

---

## 📝 Notes

- All protected routes require valid JWT token
- Admin account must be approved (`approved = true`)
- Images are automatically uploaded to Cloudinary
- Image deletion from Cloudinary happens automatically when banner is deleted
- Use multipart/form-data for create/update operations
- `is_active` field controls public visibility
- Public route only returns active banners
- Admin routes return all banners regardless of status

---

**Last Updated:** 2026-03-25
