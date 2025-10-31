# PDF Size Optimization - Testing Script

## Quick Test Commands

### 1. Check GD Library
```powershell
php -m | Select-String -Pattern "gd"
```

### 2. Test Image Compression Manually
```php
<?php
// test_compression.php - Put in project root
require __DIR__.'/vendor/autoload.php';

$logoPath = __DIR__.'/public/1.png';
$bpjsPath = __DIR__.'/public/bpjs.png';

function testCompression($imagePath) {
    if (!file_exists($imagePath)) {
        echo "❌ File not found: $imagePath\n";
        return;
    }
    
    $originalSize = filesize($imagePath);
    $imageInfo = getimagesize($imagePath);
    
    echo "\n📸 Testing: " . basename($imagePath) . "\n";
    echo "Original size: " . number_format($originalSize / 1024, 2) . " KB\n";
    echo "Dimensions: {$imageInfo[0]}x{$imageInfo[1]}\n";
    
    // Test compression
    $maxWidth = 400;
    $quality = 60;
    
    list($width, $height, $type) = $imageInfo;
    
    $sourceImage = match($type) {
        IMAGETYPE_JPEG => imagecreatefromjpeg($imagePath),
        IMAGETYPE_PNG => imagecreatefrompng($imagePath),
        IMAGETYPE_GIF => imagecreatefromgif($imagePath),
        default => null
    };
    
    if (!$sourceImage) {
        echo "❌ Failed to load image\n";
        return;
    }
    
    if ($width > $maxWidth) {
        $newWidth = $maxWidth;
        $newHeight = intval(($height / $width) * $maxWidth);
    } else {
        $newWidth = $width;
        $newHeight = $height;
    }
    
    $newImage = imagecreatetruecolor($newWidth, $newHeight);
    
    if ($type === IMAGETYPE_PNG) {
        imagealphablending($newImage, false);
        imagesavealpha($newImage, true);
        $transparent = imagecolorallocatealpha($newImage, 255, 255, 255, 127);
        imagefilledrectangle($newImage, 0, 0, $newWidth, $newHeight, $transparent);
    }
    
    imagecopyresampled($newImage, $sourceImage, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
    
    ob_start();
    imagejpeg($newImage, null, $quality);
    $compressedData = ob_get_clean();
    
    $compressedSize = strlen($compressedData);
    $ratio = round((1 - $compressedSize / $originalSize) * 100, 1);
    
    echo "Compressed size: " . number_format($compressedSize / 1024, 2) . " KB\n";
    echo "New dimensions: {$newWidth}x{$newHeight}\n";
    echo "✅ Compression ratio: {$ratio}%\n";
    
    imagedestroy($sourceImage);
    imagedestroy($newImage);
}

testCompression($logoPath);
testCompression($bpjsPath);

echo "\n✅ Test completed!\n";
```

### 3. Run Compression Test
```powershell
php test_compression.php
```

### 4. Test Bundle Generation
```powershell
# Access print bundle page
# Select 9 documents
# Click "Generate Bundle"
# Check browser console for file sizes
```

### 5. Monitor Logs
```powershell
Get-Content storage/logs/laravel.log -Tail 50 | Select-String "Image compressed"
```

## Expected Results

### Logo Compression:
```
Original: ~500 KB
Compressed: ~30-50 KB
Ratio: 90-94%
```

### BPJS Logo Compression:
```
Original: ~300 KB
Compressed: ~20-30 KB
Ratio: 90-93%
```

### QR Code Size:
```
Original: ~8 KB (150px PNG)
Optimized: ~3 KB (100px JPEG)
Ratio: 60-70%
```

### Bundle Size:
```
Before: ~8.4 MB (9 files)
After: ~1.7 MB (9 files)
Reduction: 80%
```

## Quality Adjustments

### If images too blurry:
```env
PDF_IMAGE_QUALITY=75
PDF_LOGO_MAX_WIDTH=600
```

### If file still too large:
```env
PDF_IMAGE_QUALITY=50
PDF_LOGO_MAX_WIDTH=300
```

### If QR not scannable:
```env
PDF_QR_CODE_SIZE=120
```

## Browser Console Check

After generating bundle, check console:
```javascript
// You should see logs like:
PDFLib: Loaded 9 documents
Total size: ~1.7MB (was ~8.4MB)
Compression: 80%
```

## Troubleshooting

### Error: "Call to undefined function imagecreatefromjpeg"
Solution: Enable GD in php.ini
```ini
extension=gd
```

### Error: "Failed to compress image"
Solution: Check file permissions
```powershell
icacls public\1.png
icacls public\bpjs.png
```

### PDF still large
Solution: Check config values
```powershell
php artisan config:clear
php artisan config:cache
```

## Production Deployment

1. Test locally first
2. Backup original images
3. Deploy changes
4. Monitor first 10 generations
5. Adjust quality if needed
6. Document final settings

## Success Criteria

✅ Bundle size < 2MB  
✅ Text readable  
✅ QR codes scannable  
✅ Logos clear  
✅ No errors in logs  
✅ Processing time < 30s  

