#!/bin/bash

nginxBaseDir="/home/adminuser/workspace/html"
indexFile="$nginxBaseDir/intro.html"
baseDocumentationHtml="../base-documentation-html"
workspace="/home/adminuser/workspace/doc-artifacts"

# Copy base documentation HTML to target Nginx dir
cp -rf $baseDocumentationHtml/* $nginxBaseDir

# Append team name
mkdir -p "$nginxBaseDir/team1"
echo "<li class=\"collapsible\"><span class=\"fa fa-caret-right level-1-caret\"></span><a href=\"#\">&nbsp;Team 1</a><ul class=\"sectlevel2\">" >> $indexFile

# Publish all doc artifacts to target Nginx dir
for zipfile in $workspace/*.zip; do
   filename=$(basename $zipfile)
   projectName=$(echo "$filename" | sed 's/\(.*\)-[0-9]*\.[0-9]*\.[0-9]*-doc.zip/\1/')
   projectNameWithVersion=$(echo "$filename" | sed 's/\(.*-[0-9]*\.[0-9])*\.[0-9]*\)-doc.zip/\1/')

    echo "Processing project $projectName"

    mkdir -p "$nginxBaseDir/team1/$projectName"
    unzip -oq -d "$nginxBaseDir/team1/$projectName" $zipfile

    echo "<li><a href=\"team1/$projectName/$projectNameWithVersion/intro.html\" target=\"doc-iframe\">${projectName}</a></li>" >> $indexFile
done

# Close projects + team lists anchors
echo "</ul></li></ul>" >> $indexFile

# Close HTML file anchors
echo "</div></div><div id=\"content\" class=\"first-level\" style=\"height:100%\"><iframe frameborder=\"0\" style=\"overflow:hidden;\" height=\"100%\" width=\"100%\" name=\"doc-iframe\" src=\"homepage.html\"></iframe></div></body></html>$

echo "DONE"
