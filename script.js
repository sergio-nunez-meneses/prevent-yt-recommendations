// ============================================================================
//  Variables
// ============================================================================
const observerConfig     = {attributes: true, childList: true, subtree: true};
let newFirstVideoUrl     = "";
let shuffleButtonClicked = false;
let pausePopupExists     = false;
let videoClicked         = false;
let relatedVideosContainer, shuffleButton;

// ============================================================================
// Functions
// ============================================================================
function init() {
	setShuffleButtonCss();

	let appObserver = new MutationObserver(checkCurrentAppPath);
	appObserver.observe(document.body, observerConfig);
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
			// Related videos' list on "/watch"
			if (mutation.target.firstElementChild.tagName.toLowerCase() === "ytd-compact-video-renderer") {
				relatedVideosContainer = mutation.target;
				let relatedVideos      = relatedVideosContainer.children;
				let loadMoreButton     = relatedVideos[relatedVideos.length - 1].children["button"];

				// Autoload related videos' list
				if (loadMoreButton) {
					loadMoreButton.removeAttribute("hidden");
					loadMoreButton.firstElementChild.firstElementChild.click();
				}

				createShuffleButton();
			}
			// "Continue watching?" popup on "/watch"
			if (mutation.target.tagName.toLowerCase() === "ytd-popup-container") {
				mutation.target.click();
				mutation.target.remove();

				pausePopupExists = true;
			}
		}
		else if (mutation.type === "attributes") {
			if (mutation.target.tagName.toLowerCase() === "video") { // Handle video playback
				mutation.target.addEventListener("click", function(e) {
					if (!videoIsPaused(mutation.target) && !videoClicked) {
						videoClicked = true;
					}
					else if (videoIsPaused(mutation.target) && videoClicked) {
						videoClicked = false;
					}
				})

				// Unpause after removing "Continue watching?" popup
				if (videoIsPaused(mutation.target) && pausePopupExists) {
					mutation.target.play();

					pausePopupExists = false;
				}
				// Pause/unpause on click
				else if (videoIsPaused(mutation.target) && !videoClicked) {
					mutation.target.play();
				}
				else if (!videoIsPaused(mutation.target) && videoClicked) {
					mutation.target.pause();
				}
				// Redirect to new first video
				if (mutation.target.ended && newFirstVideoUrl !== "") {
					window.location.href = newFirstVideoUrl;
				}
			}
		}
	}
}

function shuffleRelatedVideosList() {
	shuffleButtonClicked   = true;
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

function videoIsPaused(video) {
	return video.paused && !video.ended;
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
