$(document).ready(function() {

	var $searchInput = $("#search-input input");
	// Check initial request on page loading
	var query = getParameterByName("query");
	if(query) {
		$searchInput.val(query);
		launchSearch();
	}

	// Register refine listeners
	$("body").on('click', '.refine-link', function() {
		launchSearch($(this).attr("href"));
	});

	$("body").on('click', '.clear-filters', function() {
		launchSearch("#");
		window.location.href = "#"
	});

	$("#search-bar-input").focus(function() {
		$("#search-bar form").addClass("focused");
	});

	$("#search-bar-input").blur(function() {
		$("#search-bar form").removeClass("focused");
	});

	$searchInput.keypress(function(event) {
		// press enter
		if(event.which == 13) {
			launchSearch();
			event.stopPropagation();
			return false;
		} else {
			return true;
		}
	});

	function launchSearch(url) {
		var baseUrl = "http://a01elk010.cdweb.biz:9200/archi-documentation/_search"
		var jsonData = getJsonData(url);
		$.ajax({
			url : baseUrl,
			type: "POST",
			dataType: 'json',
			data: jsonData,
			crossDomain: true,
			success: function(data)
			{
				if(data.aggregations) {
					// Raw request with content only (no refine on facet)
					var $teamList = $("#team-list");
					var tocHtml = "";
					for(i = 0; i<data.aggregations.team.buckets.length; i++) {
						var $team = data.aggregations.team.buckets[i];
						var teamName = cleanAndCapitalize($team.key);
						tocHtml += '<li><a class="refine-link" href="#refine?team=' + $team.key + '">' + teamName + '</a>';

						if($team.project.buckets.length > 0) {
							tocHtml += "<ul>";
							for(j = 0; j<$team.project.buckets.length; j++) {
								var $project = $team.project.buckets[j];
								var projectName = cleanAndCapitalize($project.key);
								tocHtml += '<li><a class="refine-link" href="#refine?project=' + $project.key + '">' + projectName + '</a>';

								if($project.version.buckets.length > 0) {
									tocHtml += "<ul>";
									for(k = 0; k<$project.version.buckets.length; k++) {
										var $version = $project.version.buckets[k];
										var versionName = cleanAndCapitalize($version.key);
										tocHtml += '<li><a class="refine-link" href="#refine?project=' + $project.key + '&version=' +$version.key + '">' + versionName + '</a>';
									}
									tocHtml += "</ul>";
								}
								tocHtml += "</li>";
							}
							tocHtml += "</ul>";
						}
						tocHtml += "</li>";
					}
					$teamList.html(tocHtml);
					$("#search-facets").slideUp();
				} else {
					// A refine was used
					var team = getParameterByName("team", url);
					var project = getParameterByName("project", url);
					var version = getParameterByName("version", url);
					var hasTeam = team != null;
					var hasProject = project != null;
					var hasVersion = version != null;
					var msg = "Currently filtering results on ";
					if(hasVersion) {
						msg += 'project <span class="info">' + project + '</span> and version <span class="info">' + version + '</span>';
					} else if(hasProject) {
						msg += 'project <span class="info">' + project + '</span>';
					} else {
						msg += 'team <span class="info">' + team + '</span>';
					}
					$("#search-facets .content").html(msg);
					$("#search-facets").slideDown();
				}

				// Fill results block
				$("#search-results .nb-results").html(data.hits.total);
				$("#search-results .took-time").html(data.took);
				$("#search-results .results").html("")
				for (var i = 0; i<data.hits.hits.length; i++) {
					var hit = data.hits.hits[i];
					$("#search-results .results").append(getHitBlock(hit));
				}
			},
			error: function (jqXHR, textStatus, errorThrown)
			{
				console.log(jqXHR.responseText);
				$("#search-results .results").html(jqXHR.responseText);
			}
		});
	};

	function getJsonData(url) {
		var searchValue = $("#search-input input").val();
		var team = getParameterByName("team", url);
		var project = getParameterByName("project", url);
		var version = getParameterByName("version", url);
		var hasTeam = team != null;
		var hasProject = project != null;
		var hasVersion = version != null;
		var needsRefine = hasTeam || hasProject || hasVersion;

		// Start query with boolean query
		var jsonData = '{ "query": { "bool": { "must": [ { "bool": { "should": ['
			+ getMatchQueryPart("content", searchValue)
			+ getMatchQueryPart("title", searchValue, true, 3);

		if (needsRefine) {
			jsonData += '] } }';
		}
		if(hasVersion) {
			// Add refine query (project + version)
			jsonData += getTermQueryPart("project", project, true);
			jsonData += getTermQueryPart("version", version, true);
		} else if (hasProject) {
			// Add refine query (project only)
			jsonData += getTermQueryPart("project", project, true);
		} else if (hasTeam) {
			// Add refine query (team only)
			jsonData += getTermQueryPart("team", team, true);
		}

		// End boolean query for "AND" terms
		if(!needsRefine) {
			jsonData += '] } }';
		}
		jsonData += ' ] } }';

		if (!needsRefine) {
			// Add aggregations
			jsonData += ', "aggs": { "team": { "terms": { "field": "team" }, "aggs": { "project":' +
				' { "terms": { "field": "project" }, "aggs": { "version": { "terms": { "field": "version" } } } } }' +
				' } }';
		}

		// Add content highlightning
		jsonData += ', "highlight": { "fields": { "content": {} } }'

		// Add return fields
		jsonData += ', "fields": [ "url", "title", "team", "project", "version" ]';

		// End Json object
		jsonData += ' } ';

		return jsonData;
	}

	function getTermQueryPart(termName, termValue, addComa) {
		var json = addComa ? ', ' : '';
		return json + '{ "term": { "' + termName + '": { "value": "' + termValue + '" } } }';
	}

	function getMatchQueryPart(matchName, matchValue, addComa, boost) {
		var json = addComa ? ', ' : '';
		json += '{ "match": { "' + matchName + '": { "query": "' + matchValue + '"';
		json += boost ? ', "boost": ' + boost : '';
		json += '} } }';
		return json;
	}

	function getHitBlock(hit) {
		var title = cleanAndCapitalize(hit.fields["title"][0]);
		var url = hit.fields["url"];
		var team = cleanAndCapitalize(hit.fields["team"][0]);
		var project = cleanAndCapitalize(hit.fields["project"][0]);
		var version = cleanAndCapitalize(hit.fields["version"][0]);
		var content = hit.highlight.content;

		var result = '<div class="result">' +
			'<h4 class="result-title"><a href="' + url +'">' + team + " > " + project + " > " + version + " > " + title + '</a></h4>' +
			'<div class="result-content">';

		for(i=0; i<content.length; i++) {
			result += '<div class="result-content-line">' + content[i] + '</div>';
		}

		result += '</div></div>';
		return result;
	}

	function getParameterByName(name, url) {
		if (!url) url = window.location.href;
		name = name.replace(/[\[\]]/g, "\\$&");
		var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
			results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, " "));
	}

	function cleanAndCapitalize(value) {
		return (value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()).replace(/-/g, ' ');
	}
});