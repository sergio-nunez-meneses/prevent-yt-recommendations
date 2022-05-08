// ============================================================================
//  Variables
// ============================================================================
const observerConfig = {attributes: true, childList: true, subtree: true};
let app              = document.getElementsByTagName("ytd-app")[0];
let isShuffled       = false;
let newFirstVideoUrl = "";
let shuffleButton, relatedVideosContainer;

// ============================================================================
// Functions
// ============================================================================
function init() {
	setShuffleButtonCss();

	let appObserver = new MutationObserver(checkCurrentAppPath);
	appObserver.observe(app, observerConfig);
}

function checkCurrentAppPath(mutationsList, appObserver) {
	for (let mutation of mutationsList) {
		if (mutation.type === "childList") {
			if (mutation.target.tagName.toLowerCase() === "ytd-two-column-browse-results-renderer" // Video recommendations on "/"
					|| mutation.target.tagName.toLowerCase() === "ytd-rich-grid-renderer"
					|| mutation.target.tagName.toLowerCase() === "yt-related-chip-cloud-renderer" // Recommendation filters on logged in
					|| mutation.target.id === "sections") { // Comments on "/watch"
				mutation.target.remove();
			}
			// related videos' list on "/watch"
			if (mutation.target.firstElementChild.tagName.toLowerCase() === "ytd-compact-video-renderer") {
				relatedVideosContainer = mutation.target;

				createShuffleButton();
			}
		}
	}
}

function setCurrentVideoObserver() {
	if (!isShuffled) {
		let videoStreamObserver = new MutationObserver(redirectToNewFirstVideo);
		videoStreamObserver.observe(document.getElementsByTagName("video")[0], observerConfig);
	}
	isShuffled = true;
}

function loadMoreRelatedVideos() {
	let relatedVideos  = relatedVideosContainer.children;
	let loadMoreButton = relatedVideos[relatedVideos.length - 1].children["button"];

	if (loadMoreButton) {
		loadMoreButton.removeAttribute("hidden");
		loadMoreButton.firstElementChild.firstElementChild.click();
	}
}

function shuffleRelatedVideosList() {
	setCurrentVideoObserver();
	loadMoreRelatedVideos();

	let relatedVideos      = relatedVideosContainer.children;
	let totalRelatedVideos = relatedVideos.length;

	for (let i = 0; i < totalRelatedVideos; i++) {
		let randId        = Math.floor(Math.random() * totalRelatedVideos);
		let firstVideo    = relatedVideosContainer.firstChild;
		let newFirstVideo = relatedVideos[randId];

		setNewFirstVideo(relatedVideosContainer, newFirstVideo, firstVideo);
	}
}

function setNewFirstVideo(relatedVideosContainer, newFirstVideo, firstVideo) {
	let loadMoreSpinnerTagName = "ytd-continuation-item-renderer";

	if (newFirstVideo.tagName.toLowerCase() !== loadMoreSpinnerTagName
			&& firstVideo.tagName.toLowerCase() !== loadMoreSpinnerTagName) {
		relatedVideosContainer.insertBefore(newFirstVideo, firstVideo);

		newFirstVideoUrl = newFirstVideo.children[0].children[0].children[0].href;
	}
}

function redirectToNewFirstVideo(mutationList, videoStreamObserver) {
	for (let mutation of mutationList) {
		if (mutation.type === "attributes" && mutation.attributeName === "style") {
			if (mutation.target.ended) { // Video stream ended
				window.location.href = newFirstVideoUrl;
			}
		}
	}
}

function setShuffleButtonCss() {
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
		transition: background-color 0.3s;
	}
	.shuffle-button:hover {
		background-color: #990412;
		cursor: pointer;
	}
	`;
	document.getElementsByTagName('head')[0].appendChild(css);
}

function createShuffleButton() {
	if (!shuffleButton) {
		let secondColumn = document.getElementById("secondary");
		let button       = document.createElement("button");
		button.className = "shuffle-button";
		button.innerText = "Shuffle";

		secondColumn.insertBefore(button, secondColumn.firstElementChild);

		button.onclick = shuffleRelatedVideosList;
		shuffleButton  = button;
	}
}

// ============================================================================
// Code to execute
// ============================================================================
if (window.location.hostname.includes("youtube")) {
	init();
}

// ============================================================================
// EventListeners
// ============================================================================
