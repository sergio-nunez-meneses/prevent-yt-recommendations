// ============================================================================
//  Variables
// ============================================================================
let recommendations = document.getElementById("primary").firstChild;
let relatedContents = document.getElementsByTagName(
		"ytd-watch-next-secondary-results-renderer")[0];

// ============================================================================
// Functions
// ============================================================================
function elementsAreNotLoadMoreSpinner(insertEl, beforeEl) {
	const tagName = "ytd-continuation-item-renderer";

	return insertEl.tagName.toLowerCase() !== tagName && beforeEl.tagName.toLowerCase() !== tagName;
}

function setScrollOptions(y, x) {
	return {top: y, left: x, behavior: 'smooth'};
}

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

					if (elementsAreNotLoadMoreSpinner(insertElement, beforeElement)) {
						relatedContent.insertBefore(insertElement, beforeElement);
					}
					else {
						let loadMoreSpinnerCoords = insertElement.getBoundingClientRect();

						// Scroll to "load more" spinner
						window.scroll(setScrollOptions(loadMoreSpinnerCoords.bottom, loadMoreSpinnerCoords.left));
					}
				}
			}
		}
	}

	// Scroll back to top
	setTimeout(function() {
		window.scroll(setScrollOptions(0, 0));
	}, 5000);
}

// ============================================================================
// EventListeners
// ============================================================================
