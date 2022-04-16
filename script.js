// ============================================================================
//  Variables
// ============================================================================
let recommendations = document.getElementById("primary").firstChild;
let relatedContents = document.getElementsByTagName(
		"ytd-watch-next-secondary-results-renderer")[0];

// ============================================================================
// Functions
// ============================================================================

// ============================================================================
// Code to execute
// ============================================================================
document.body.style.scrollBehavior = "smooth";

if (window.location.pathname === "/") {
	if (recommendations && recommendations.tagName === "YTD-RICH-GRID-RENDERER") {
		recommendations.remove();
	}
}
else if (window.location.pathname === "/watch") {
	if (relatedContents) {
		for (let relatedContent of relatedContents.children) {
			if (relatedContent.id === "items") {
				let relatedVideosContainer = relatedContent.children;
				let containerLength        = relatedVideosContainer.length;

				for (let i = 0; i < containerLength; i++) {
					let randId        = Math.floor(Math.random() * containerLength);
					let insertElement = relatedVideosContainer[randId];
					let beforeElement = relatedContent.firstChild;

					if (insertElement.tagName !== "YTD-CONTINUATION-ITEM-RENDERER"
							&& beforeElement.tagName !== "YTD-CONTINUATION-ITEM-RENDERER") {
						relatedContent.insertBefore(insertElement, beforeElement);
					}
					else {
						let loadMoreSpinnerCoords = insertElement.getBoundingClientRect();

						// Scroll to "load more" spinner
						window.scroll({
							top     : loadMoreSpinnerCoords.bottom,
							left    : loadMoreSpinnerCoords.left,
							behavior: 'smooth',
						});
					}
				}
			}
		}
	}

	// Scroll back to top
	setTimeout(function() {
		window.scroll({top: 0, left: 0, behavior: 'smooth'});
	}, 5000);
}

// ============================================================================
// EventListeners
// ============================================================================
