// ============================================================================
//  Variables
// ============================================================================
const relatedContents = document.getElementsByTagName(
		"ytd-watch-next-secondary-results-renderer")[0];
const recommendations = document.getElementById("primary").firstChild;
const spinner         = createSpinner();
let interval;

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

function shuffleRelatedVideosList(relatedContents) {
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
	setTimeout(function() { window.scroll(setScrollOptions(0, 0)); }, 1000);
}

function setSpinnerCss() {
	document.body.style.scrollBehavior = "smooth";

	const css     = document.createElement("style");
	css.innerHTML = `
	.spinner-container {
		position: fixed;
		z-index: 10;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
	  display: flex;
	  justify-content: center;
	  align-content: center;
	  width: 100%;
	  height: 100%;
	  background-color: rgba(0, 0, 0, 0.7);
	}
	.spinner-container .spinner {
		align-self: center;
	  width: 64px;
	  height: 128px;
	  animation: rotate 2s linear infinite;
	}
	.spinner-container .spinner .path {
	  stroke: #FF0000;
	  stroke-linecap: round;
	  animation: dash 1.5s ease-in-out infinite;
	}
	.hidden {
	  display: none !important;
	}
	@keyframes rotate {
	  100% { transform: rotate(360deg); }
	}
	@keyframes dash {
	  0% {
	    stroke-dasharray: 1, 150;
	    stroke-dashoffset: 0;
	  }
	  50% {
	    stroke-dasharray: 90, 150;
	    stroke-dashoffset: -35;
	  }
	  100% {
	    stroke-dasharray: 90, 150;
	    stroke-dashoffset: -124;
	  }
	}`;
	document.getElementsByTagName('head')[0].appendChild(css);
}

function createSpinner() {
	setSpinnerCss();

	const spinnerContainer     = document.createElement("div");
	spinnerContainer.innerHTML = `
	<svg class="spinner" viewBox="0 0 50 50">
		<circle class="path" fill="none" cx="25" cy="25" r="20" stroke-width="5"></circle>
	</svg>`;
	spinnerContainer.classList.add("spinner-container");

	return spinnerContainer;
}

// ============================================================================
// Code to execute
// ============================================================================
if (window.location.pathname === "/") {
	if (recommendations && recommendations.tagName === "YTD-RICH-GRID-RENDERER") {
		recommendations.remove();
	}
}
else if (window.location.pathname === "/watch") {
	document.body.insertBefore(spinner, document.body.firstChild);

	interval = setInterval(function() { shuffleRelatedVideosList(relatedContents); },
			1250);

	setTimeout(function() {
		clearInterval(interval);

		spinner.classList.add("hidden");
	}, 20000);
}

// ============================================================================
// EventListeners
// ============================================================================
