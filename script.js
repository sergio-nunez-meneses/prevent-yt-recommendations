// ============================================================================
//  Variables
// ============================================================================
const relatedContents     = document.getElementsByTagName("ytd-watch-next-secondary-results-renderer")[0];
const recommendations     = document.getElementById("primary").firstChild;
const currentVideo        = document.getElementsByTagName("video")[0];
const observerConfig      = {attributes: true, childList: true, subtree: true};
const shuffleIntervalTime = 1250, shuffleTotalTime = 10000;
let spinnerContainerTop   = 0;
let newFirstVideoIsSet    = false;
let newFirstVideoLink;
let spinner;
let interval;
let currentVideoObserver;

// ============================================================================
// Functions
// ============================================================================
function removeVideoRecommendations(recommendations) {
	if (recommendations && recommendations.tagName.toLowerCase() === "ytd-rich-grid-renderer") {
		recommendations.remove();
	}
}

function videoIsPlaying(video) {
	return video.readyState > 2 && !video.paused && !video.ended;
}

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
					let randId              = Math.floor(Math.random() * containerLength);
					let temporaryFirstVideo = relatedContent.firstChild;
					let newFirstVideo       = relatedVideosContainer[randId];

					if (elementsAreNotLoadMoreSpinner(newFirstVideo, temporaryFirstVideo)) {
						relatedContent.insertBefore(newFirstVideo, temporaryFirstVideo);

						newFirstVideoLink  = newFirstVideo.children[0].children[0].children[0].href;
						newFirstVideoIsSet = true;
					}
					else {
						let loadMoreSpinnerCoords = newFirstVideo.getBoundingClientRect();

						// Scroll to "load more" spinner
						window.scroll(setScrollOptions(loadMoreSpinnerCoords.bottom, loadMoreSpinnerCoords.left));

						if (window.scrollY > 0) {
							spinner.style.setProperty("top", "0");
						}
					}
				}
			}
		}
	}

	setTimeout(function() {
		// Scroll back to top
		window.scroll(setScrollOptions(0, 0));

		if (window.scrollY === 0) {
			spinner.style.setProperty("top", appendPxToInt(spinnerContainerTop));
		}
	}, 1000);
}

function setSpinnerCss(relatedContentsCoords) {
	document.body.style.scrollBehavior = "smooth";
	spinnerContainerTop                = relatedContentsCoords.top;

	const css     = document.createElement("style");
	css.innerHTML = `
	.spinner-container {
		position: fixed;
		z-index: 10;
		top: ${appendPxToInt(spinnerContainerTop)};
		left: ${appendPxToInt(relatedContentsCoords.left)};
	  display: flex;
	  flex-direction: column;
	  width: ${appendPxToInt(relatedContentsCoords.width)};
	  height: ${appendPxToInt(relatedContentsCoords.height)};
	  background-color: rgba(0, 0, 0, 0.7);
	}
	.spinner-container .spinner {
		align-self: center;
		margin: 10rem 0 0 0;
	  width: 64px;
	  height: 128px;
	  animation: rotate 2s linear infinite;
	}
	.spinner-container .spinner .path {
	  stroke: #FF0000;
	  stroke-linecap: round;
	  animation: dash 1.5s ease-in-out infinite;
	}
	@keyframes rotate {
	  100% {
	    transform: rotate(360deg);
	  }
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

function appendPxToInt(int) {
	return int + "px";
}

function createAndInsertSpinner(spinner) {
	const relatedContents = document.getElementById("related");
	setSpinnerCss(relatedContents.getBoundingClientRect());

	spinner           = document.createElement("div");
	spinner.className = "spinner-container";
	spinner.innerHTML = `
	<svg class="spinner" viewBox="0 0 50 50">
		<circle class="path" fill="none" cx="25" cy="25" r="20" stroke-width="5"></circle>
	</svg>`;
	relatedContents.insertBefore(spinner, relatedContents.firstChild);

	return spinner;
}

function redirectToNewFirstVideo(mutationList, currentVideoObserver) {
	for (const mutation of mutationList) {
		if (mutation.type === "attributes" && mutation.attributeName === "style") {
			if (mutation.target.ended) { // Video ended
				window.location.href = newFirstVideoLink;
			}
		}
	}
}

// ============================================================================
// Code to execute
// ============================================================================
if (window.location.pathname === "/") {
	removeVideoRecommendations(recommendations);
}
else if (window.location.pathname === "/watch") {
	if (!videoIsPlaying(currentVideo)) {
		document.querySelector(".ytp-large-play-button").click();
	}

	spinner  = createAndInsertSpinner();
	interval = setInterval(function() {
		shuffleRelatedVideosList(relatedContents);
	}, shuffleIntervalTime);

	setTimeout(function() {
		clearInterval(interval);

		spinner.remove();
	}, shuffleTotalTime);

	currentVideoObserver = new MutationObserver(redirectToNewFirstVideo);
	currentVideoObserver.observe(currentVideo, observerConfig);
}

// ============================================================================
// EventListeners
// ============================================================================
