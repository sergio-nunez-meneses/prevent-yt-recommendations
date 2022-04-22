// ============================================================================
//  Variables
// ============================================================================
const relatedVideosContainer = document.getElementById("related");
const relatedVideos          = relatedVideosContainer.children[1].children["items"];
const recommendations        = document.getElementById("primary").firstChild;
const currentVideo           = document.getElementsByTagName("video")[0];
const observerConfig         = {attributes: true, childList: true, subtree: true};
let alreadyShuffle           = false;
let newFirstVideoLink        = "";

// ============================================================================
// Functions
// ============================================================================
function removeVideoRecommendations(recommendations) {
	if (recommendations && recommendations.tagName.toLowerCase() === "ytd-rich-grid-renderer") {
		recommendations.remove();
	}
}

function elementsAreNotLoadMoreSpinner(insertEl, beforeEl) {
	const tagName = "ytd-continuation-item-renderer";

	return insertEl.tagName.toLowerCase() !== tagName && beforeEl.tagName.toLowerCase() !== tagName;
}

function shuffleRelatedVideosList(relatedVideos) {
	if (!alreadyShuffle) {
		const currentVideoObserver = new MutationObserver(redirectToNewFirstVideo);
		currentVideoObserver.observe(currentVideo, observerConfig);
	}

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
	alreadyShuffle = true;
}

function setButtonCss() {
	const css     = document.createElement("style");
	css.innerHTML = `
	.shuffle-button {
		margin: 0 0 1rem 0;
		border: none;
		border-radius: 2px;
		padding: 1rem;
		width: 100%;
		background-color: #c00;
		font-family: inherit;
		text-transform: uppercase;
		font-weight: bold;
		color: white;
	}`;
	document.getElementsByTagName('head')[0].appendChild(css);
}

function createShuffleButton(relatedContents) {
	setButtonCss();

	const button     = document.createElement("button");
	button.className = "shuffle-button";
	button.innerText = "Shuffle";

	relatedContents.insertBefore(button, relatedContents.firstElementChild);

	return button;
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
	const shuffleButton = createShuffleButton(relatedVideosContainer);
	shuffleButton.addEventListener("click", function() {
		shuffleRelatedVideosList(relatedVideos);
	});
}

// ============================================================================
// EventListeners
// ============================================================================
