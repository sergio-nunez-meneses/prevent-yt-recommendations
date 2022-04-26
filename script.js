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

function setCurrentVideoObserver() {
	if (!alreadyShuffle) {
		let currentVideoObserver = new MutationObserver(redirectToNewFirstVideo);
		let observerConfig       = {attributes: true, childList: true, subtree: true};
		currentVideoObserver.observe(document.getElementsByTagName("video")[0],
				observerConfig);
	}
	alreadyShuffle = true;
}

function loadMoreRelatedVideos(relatedVideos) {
	let totalRelatedVideos = relatedVideos.length;
	let loadMoreButton     = relatedVideos[totalRelatedVideos - 1].children["button"];

	if (loadMoreButton) {
		loadMoreButton.removeAttribute("hidden");
		loadMoreButton.firstElementChild.firstElementChild.click();
	}
}

// TODO: Split function shuffleRelatedVideosList into functions setCurrentVideoObserver,
//  loadMoreRelatedVideos, and setNewFirstVideo
function shuffleRelatedVideosList(relatedVideosContainer) {
	// if (!alreadyShuffle) {
	// 	let currentVideoObserver = new MutationObserver(redirectToNewFirstVideo);
	// 	let observerConfig       = {attributes: true, childList: true, subtree: true};
	// 	currentVideoObserver.observe(document.getElementsByTagName("video")[0],
	// 			observerConfig);
	// }
	//
	// let relatedVideosContainer = relatedContainer.children[2].children["items"];
	// let excludeElement         = "ytd-continuation-item-renderer";
	let relatedVideos          = relatedVideosContainer.children;
	let totalRelatedVideos     = relatedVideos.length;
	// let loadMoreButton         = relatedVideos[totalRelatedVideos - 1].children["button"];
	//
	// if (loadMoreButton) {
	// 	loadMoreButton.removeAttribute("hidden");
	// 	loadMoreButton.firstElementChild.firstElementChild.click();
	// }

	for (let i = 0; i < totalRelatedVideos; i++) {
		let randId              = Math.floor(Math.random() * totalRelatedVideos);
		let temporaryFirstVideo = relatedVideosContainer.firstChild;
		let newFirstVideo       = relatedVideos[randId];

		setNewFirstVideo(relatedVideosContainer, newFirstVideo, temporaryFirstVideo);

		// if (newFirstVideo.tagName.toLowerCase() !== excludeElement
		// 		&& temporaryFirstVideo.tagName.toLowerCase() !== excludeElement) {
		// 	relatedVideosContainer.insertBefore(newFirstVideo, temporaryFirstVideo);
		// 	newFirstVideoLink = newFirstVideo.children[0].children[0].children[0].href;
		// }
	}
	// alreadyShuffle = true;
}

function setNewFirstVideo(relatedVideosContainer, newFirstVideo, beforeVideoElement) {
	let excludeElement = "ytd-continuation-item-renderer";

	if (newFirstVideo.tagName.toLowerCase() !== excludeElement
			&& beforeVideoElement.tagName.toLowerCase() !== excludeElement) {
		relatedVideosContainer.insertBefore(newFirstVideo, beforeVideoElement);

		newFirstVideoLink = newFirstVideo.children[0].children[0].children[0].href;
	}
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
		let relatedContainer       = document.getElementById("related");
		let relatedVideosContainer = relatedContainer.children[1].children["items"];
		let relatedVideos          = relatedVideosContainer.children;
		let shuffleButton          = createShuffleButton(relatedContainer);
		let dragStart     = false; // prevent multiple console.logs()
		let newFirstVideo;

		shuffleButton.addEventListener("click", function() {
			setCurrentVideoObserver();
			loadMoreRelatedVideos(relatedVideos);
			// shuffleRelatedVideosList(relatedContainer);
			shuffleRelatedVideosList(relatedVideosContainer);
		});

		// TODO: Refactor

		// let relatedVideos = relatedContainer.children[2].children["items"];
		// let dragStart     = false; // prevent multiple console.logs()
		// let newFirstVideo;

		for (const relatedVideo of relatedVideos) {
			relatedVideo.addEventListener("drag", function(e) {
				if (!dragStart) {
					newFirstVideo = e.target.closest(".ytd-watch-next-secondary-results-renderer");
				}
				dragStart = true;
			});
			relatedVideo.addEventListener("dragover", function(e) {
				e.preventDefault(); // prevent default to allow drop
			});
			relatedVideo.addEventListener("drop", function(e) {
				e.preventDefault(); // prevent default action (open as link for some elements)

				if (dragStart) {
					let firstVideo = e.target.closest(".ytd-watch-next-secondary-results-renderer");
					// relatedVideosContainer.insertBefore(newFirstVideo, firstVideo);

					setCurrentVideoObserver();
					loadMoreRelatedVideos(relatedVideos);
					setNewFirstVideo(relatedVideosContainer, newFirstVideo, firstVideo);
				}
				dragStart = false;
			});
		}
	}
}

// ============================================================================
// EventListeners
// ============================================================================
