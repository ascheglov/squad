1. Extract

for /r "c:\Program Files (x86)\Steam\steamapps\common\Squad\Squad\Content\Maps" %i in (*minimap*) do c:\_tools\umodel\umodel.exe -game=ue4.18 -export "%i"

1a. Uncommon names

c:\_tools\umodel\umodel.exe -game=ue4.18 -export "c:\Program Files (x86)\Steam\steamapps\common\Squad\Squad\Content\Maps\Sumari\sumari_overlay.uasset"

2. Convert

for /r .\UmodelExport\ %i in (*.tga) do c:\_tools\ImageMagick\magick.exe %i -resize 50% %~ni.jpg


3. Copy

scp 
