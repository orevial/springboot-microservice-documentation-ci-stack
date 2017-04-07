$(document).ready(function() {

	var href = window.location.href;
	var hashIndex = href.lastIndexOf("#/");
	if(hashIndex > 0 && href.length > hashIndex + 2) {
		var relativePathToLoad = href.substring(hashIndex + 2);
		if(relativePathToLoad.lastIndexOf("/") == relativePathToLoad.length - 1) {
			relativePathToLoad = relativePathToLoad.substring(0, relativePathToLoad - 1);
		}
		$("iframe[name='doc-iframe']")[0].src = relativePathToLoad;
	}

	$("li.collapsible > a").click(function() {
		if($(this).attr("href") == "#") {
			var carretElement = $(this).parent().find("> .level-1-caret")
			if (carretElement.hasClass("fa-caret-right")) {
				carretElement.removeClass("fa-caret-right");
				carretElement.addClass("fa-caret-down");
			} else {
				carretElement.addClass("fa-caret-right");
				carretElement.removeClass("fa-caret-down");
			}

			var elipsisElement = $(this).parent().find("> .level-2-ellipsis")
			if (elipsisElement.hasClass("fa-ellipsis-h")) {
				elipsisElement.removeClass("fa-ellipsis-h");
				elipsisElement.addClass("fa-ellipsis-v");
			} else {
				elipsisElement.addClass("fa-ellipsis-h");
				elipsisElement.removeClass("fa-ellipsis-v");
			}

			$(this).parent().find("> ul").slideToggle();
		}
	});

	$("#toc a").click(function() {
		var href = $(this).attr("href");
		if(href.indexOf("#") >= 0 && href != "#") {
		} else {
			window.location.href = "#/" + href;
		}
	});

	$(".toggle-toc").click(function() {
		var bodyElement = $("body");
		if (bodyElement.hasClass("toc-left")) {
			bodyElement.removeClass("toc-left");
			bodyElement.addClass("hidden-toc");
		} else {
			bodyElement.addClass("toc-left");
			bodyElement.removeClass("hidden-toc");
		}
	});
});