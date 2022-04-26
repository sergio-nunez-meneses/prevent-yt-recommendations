// ============================================================================
//  Variables
// ============================================================================
let alreadyShuffle    = false;
let newFirstVideoLink = "";

// ============================================================================
// Functions
// ============================================================================
function removeVideoRecommendations(recommendations) {
	if (recommendations && recommendations.tagName.toLowerCase() === "ytd-rich-grid-renderer") {
		recommendations.remove();
	}
}

// TODO: Split function shuffleRelatedVideosList into functions observeCurrentPlayedVideo,
//  loadMoreRelatedVideos, and setNewFirstVideo
function shuffleRelatedVideosList(relatedContainer) {
	if (!alreadyShuffle) {
		let currentVideoObserver = new MutationObserver(redirectToNewFirstVideo);
		let observerConfig       = {attributes: true, childList: true, subtree: true};
		currentVideoObserver.observe(document.getElementsByTagName("video")[0],
				observerConfig);
	}

	let relatedVideosContainer = relatedContainer.children[2].children["items"];
	let excludeElement         = "ytd-continuation-item-renderer";
	let relatedVideos          = relatedVideosContainer.children;
	let totalRelatedVideos     = relatedVideos.length;
	let loadMoreButton         = relatedVideos[totalRelatedVideos - 1].children["button"];

	if (loadMoreButton) {
		loadMoreButton.removeAttribute("hidden");
		loadMoreButton.firstElementChild.firstElementChild.click();
	}

	for (let i = 0; i < totalRelatedVideos; i++) {
		let randId              = Math.floor(Math.random() * totalRelatedVideos);
		let temporaryFirstVideo = relatedVideosContainer.firstChild;
		let newFirstVideo       = relatedVideos[randId];

		if (newFirstVideo.tagName.toLowerCase() !== excludeElement
				&& temporaryFirstVideo.tagName.toLowerCase() !== excludeElement) {
			relatedVideosContainer.insertBefore(newFirstVideo, temporaryFirstVideo);
			newFirstVideoLink = newFirstVideo.children[0].children[0].children[0].href;
		}
	}
	alreadyShuffle = true;
}

function setButtonCss() {
	let css       = document.createElement("style");
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

	let button       = document.createElement("button");
	button.className = "shuffle-button";
	button.innerText = "Shuffle";

	relatedContents.insertBefore(button, relatedContents.firstElementChild);

	return button;
}

function redirectToNewFirstVideo(mutationList, currentVideoObserver) {
	for (let mutation of mutationList) {
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
if (window.location.hostname.includes("youtube")) {
	if (window.location.pathname === "/") {
		let recommendations = document.getElementById("primary").firstChild;
		removeVideoRecommendations(recommendations);
	}
	else if (window.location.pathname === "/watch") {
		let relatedContainer = document.getElementById("related");
		let shuffleButton    = createShuffleButton(relatedContainer);

		shuffleButton.addEventListener("click", function() {
			shuffleRelatedVideosList(relatedContainer);
		});

		// TODO: Refactor
		let relatedVideos = relatedContainer.children[2].children["items"].children;
		let dragStart     = false; // prevent multiple console.logs()

		for (const relatedVideo of relatedVideos) {
			relatedVideo.addEventListener("drag", function(e) {
				if (!dragStart) {
					console.log("Dragged element:", e.target.closest(
							".ytd-watch-next-secondary-results-renderer"));
				}
				dragStart = true;
			});
			relatedVideo.addEventListener("dragover", function(e) {
				e.preventDefault(); // prevent default to allow drop
			});
			relatedVideo.addEventListener("drop", function(e) {
				e.preventDefault(); // prevent default action (open as link for some elements)

				if (dragStart) {
					console.log("Dropped over:", e.target.closest(
							".ytd-watch-next-secondary-results-renderer"));
				}
				dragStart = false;
			});
		}
	}
}

// ============================================================================
// EventListeners
// ============================================================================
