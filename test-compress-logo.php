<?php
// Test script untuk compress logo 1.png

$imagePath = __DIR__ . '/public/1.png';
$maxWidth = 400;
$quality = 60;

echo "Testing image compression...\n";
echo "File: $imagePath\n";
echo "Original size: " . round(filesize($imagePath) / 1024, 2) . " KB\n\n";

try {
    $imageInfo = getimagesize($imagePath);
    if (!$imageInfo) {
        die("Cannot get image info\n");
    }
    
    list($width, $height, $type) = $imageInfo;
    echo "Original dimensions: {$width}x{$height}\n";
    echo "Image type: $type\n\n";
    
    // Load image
    $sourceImage = match($type) {
        IMAGETYPE_JPEG => imagecreatefromjpeg($imagePath),
        IMAGETYPE_PNG => imagecreatefrompng($imagePath),
        IMAGETYPE_GIF => imagecreatefromgif($imagePath),
        default => null
    };
    
    if (!$sourceImage) {
        die("Cannot load image\n");
    }
    
    // Calculate new dimensions
    if ($width > $maxWidth) {
        $newWidth = $maxWidth;
        $newHeight = intval(($height / $width) * $maxWidth);
    } else {
        $newWidth = $width;
        $newHeight = $height;
    }
    
    echo "New dimensions: {$newWidth}x{$newHeight}\n";
    
    // Create new image
    $newImage = imagecreatetruecolor($newWidth, $newHeight);
    
    // Preserve transparency for PNG
    if ($type === IMAGETYPE_PNG) {
        imagealphablending($newImage, false);
        imagesavealpha($newImage, true);
        $transparent = imagecolorallocatealpha($newImage, 255, 255, 255, 127);
        imagefilledrectangle($newImage, 0, 0, $newWidth, $newHeight, $transparent);
    }
    
    // Resample
    imagecopyresampled($newImage, $sourceImage, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
    
    // Output to buffer
    ob_start();
    imagejpeg($newImage, null, $quality);
    $imageData = ob_get_clean();
    
    // Clean up
    imagedestroy($sourceImage);
    imagedestroy($newImage);
    
    $compressedSize = strlen($imageData);
    $compressionRatio = round((1 - $compressedSize / filesize($imagePath)) * 100, 1);
    
    echo "Compressed size: " . round($compressedSize / 1024, 2) . " KB\n";
    echo "Compression ratio: {$compressionRatio}%\n";
    echo "Base64 size: " . round(strlen(base64_encode($imageData)) / 1024, 2) . " KB\n\n";
    
    echo "SUCCESS! Image compression works.\n";
    
    // Save compressed version
    $outputPath = __DIR__ . '/public/1-compressed.jpg';
    file_put_contents($outputPath, $imageData);
    echo "Saved compressed version to: $outputPath\n";
    
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
