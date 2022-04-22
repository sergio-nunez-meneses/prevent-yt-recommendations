// ============================================================================
//  Variables
// ============================================================================
const relatedVideosContainer = document.getElementById("related");
const relatedVideos          = relatedVideosContainer.children[1].children["items"];
const recommendations        = document.getElementById("primary").firstChild;
const currentVideo           = document.getElementsByTagName("video")[0];
const observerConfig         = {attributes: true, childList: true, subtree: true};
let newFirstVideoLink        = "";

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

function shuffleRelatedVideosList(relatedVideos) {
	let relatedVideosContainer = relatedVideos.children;
	let containerLength        = relatedVideosContainer.length;
	let loadMoreButton         = relatedVideos.children[containerLength - 1].children["button"];

	if (loadMoreButton) {
		loadMoreButton.removeAttribute("hidden");
		loadMoreButton.firstElementChild.firstElementChild.click();
	}

	for (let i = 0; i < containerLength; i++) {
		let randId              = Math.floor(Math.random() * containerLength);
		let temporaryFirstVideo = relatedVideos.firstChild;
		let newFirstVideo       = relatedVideosContainer[randId];

		if (elementsAreNotLoadMoreSpinner(newFirstVideo, temporaryFirstVideo)) {
			relatedVideos.insertBefore(newFirstVideo, temporaryFirstVideo);

			newFirstVideoLink = newFirstVideo.children[0].children[0].children[0].href;
		}
	}
}

function setSpinnerCss(relatedContentsCoords) {
	document.body.style.scrollBehavior = "smooth";

	const css     = document.createElement("style");
	css.innerHTML = `
	.spinner-container {
		position: fixed;
		z-index: 10;
		top: ${appendPxToInt(relatedContentsCoords.top)};
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
	}
	.shuffle-button {
		margin: 0 0 1rem 0;
		width: 100%;
	}`;
	document.getElementsByTagName('head')[0].appendChild(css);
}

function createShuffleButton(relatedContents) {
	const button     = document.createElement("button");
	button.className = "shuffle-button";
	button.innerText = "Shuffle";

	relatedContents.insertBefore(button, relatedContents.firstElementChild);

	return button;
}

function appendPxToInt(int) {
	return int + "px";
}

function redirectToNewFirstVideo(mutationList, currentVideoObserver) {
	for (const mutation of mutationList) {
		if (mutation.type === "attributes" && mutation.attributeName === "style") {
			if (mutation.target.ended) { // Current video ended
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

	const currentVideoObserver = new MutationObserver(redirectToNewFirstVideo);
	const shuffleButton        = createShuffleButton(relatedVideosContainer);

	currentVideoObserver.observe(currentVideo, observerConfig);
	setSpinnerCss(relatedVideosContainer.getBoundingClientRect());

	shuffleButton.addEventListener("click", function() {
		shuffleRelatedVideosList(relatedVideos);
	});
}

// ============================================================================
// EventListeners
// ============================================================================
