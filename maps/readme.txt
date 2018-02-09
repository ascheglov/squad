1. List

> c:\_tools\git\usr\bin\bash.exe
$ P='c:/Program Files (x86)/Steam/steamapps/common/Squad/Squad/Content'
$ /c/_tools/umodel/umodel.exe -game=ue4.18 "-path=$P" -list '*/maps/*minimap*' | grep Loading | cut -d' ' -f3 > list.txt
$ /c/_tools/umodel/umodel.exe -game=ue4.18 "-path=$P" -list '*/maps/*overlay*' | grep Loading | cut -d' ' -f3 >> list.txt

2. Extract

$ while read n; do /c/_tools/umodel/umodel.exe -game=ue4.18 "-path=$P" -export $n; done < list.txt

3. Convert

> for /r .\UmodelExport\ %i in (*.tga) do c:\_tools\ImageMagick\magick.exe %i %~ni.jpg

----------------------------------------------------
Finding map size

Point target and call sizeHelperX / sizeHelperY from JS console:

    sizeHelperY("G12 21")
    sizeHelperX("K2 71")
