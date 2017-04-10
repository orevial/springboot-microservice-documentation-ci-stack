#!/bin/bash

nginxBaseDir="/var/www/html"
indexFile="$nginxBaseDir/intro.html"
baseDocumentationHtml="base-documentation-html"
workspace="/home/lcalhau/workspace"
artifactsDir="/home/lcalhau/doc-artifacts"

mkdir -p $artifactsDir/

# Copy all generated artifacts to specific folder
for projectDir in $workspace/*; do
  echo "Copying zip artifact from directory $projectDir"
  cp $projectDir/target/*.zip $artifactsDir/
done

# Copy base documentation HTML to target Nginx dir
cp -rf $baseDocumentationHtml/* $nginxBaseDir

# Append team name
mkdir -p "$nginxBaseDir/team1"
echo "<li class=\"collapsible\"><span class=\"fa fa-caret-right level-1-caret\"></span><a href=\"#\">&nbsp;Team 1</a><ul class=\"sectlevel2\">" >> $indexFile

# Publish all doc artifacts to target Nginx dir
for zipfile in $artifactsDir/*.zip; do
   filename=$(basename $zipfile)
   projectName=$(echo "$filename" | sed 's/\(.*\)-[0-9]*\.[0-9]*\.[0-9]*-SNAPSHOT-doc.zip/\1/')
   projectNameWithVersion=$(echo "$filename" | sed 's/\(.*-[0-9]*\.[0-9])*\.[0-9]*-SNAPSHOT\)-doc.zip/\1/')

    echo "Processing project $projectName"

    mkdir -p "$nginxBaseDir/team1/$projectName"
    unzip -oq -d "$nginxBaseDir/team1/$projectName" $zipfile
    cp -r "$nginxBaseDir/team1/$projectName/$projectNameWithVersion" "$nginxBaseDir/team1/"
    rm -rf "$nginxBaseDir/team1/$projectName/"

    echo "<li><a href=\"team1/$projectNameWithVersion/intro\" target=\"doc-iframe\">${projectName}</a></li>" >> $indexFile
done

# Close projects + team lists anchors
echo "</ul></li></ul>" >> $indexFile

# Close HTML file anchors
echo "</div></div><div id=\"content\" class=\"first-level\" style=\"height:100%\"><iframe frameborder=\"0\" style=\"overflow:hidden;\" height=\"100%\" width=\"100%\" name=\"doc-iframe\" src=\"homepage.html\"></iframe></div></body></html>" >> $indexFile

echo "DONE"
