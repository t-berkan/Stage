Add-Type -AssemblyName System.Drawing

$sizes = @(192, 512)

foreach ($size in $sizes) {
    $path = "c:\Users\berka\Desktop\Stage\public\pwa-" + $size + "x" + $size + ".png"
    $temp = "c:\Users\berka\Desktop\Stage\public\pwa-" + $size + "x" + $size + "-temp.png"
    
    $img = [System.Drawing.Image]::FromFile($path)
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    # High quality resize
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($img, 0, 0, $size, $size)
    
    $bmp.Save($temp, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $g.Dispose()
    $bmp.Dispose()
    $img.Dispose()
    
    Remove-Item $path -Force
    Rename-Item $temp ("pwa-" + $size + "x" + $size + ".png")
}
