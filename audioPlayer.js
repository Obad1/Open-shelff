// Function to format time in MM:SS format
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
}

// Global variables for pagination
let currentPage = 1;
const itemsPerPage = 10;
let totalPages = 1;

async function fetchAudioBooks(page = 1) {
  try {
    // Show loading state
    const audioGrid = document.getElementById("audioGrid");
    audioGrid.innerHTML =
      '<div class="loading-indicator">Loading audio books...</div>';

    // Fetch audio books from the API with pagination
    const response = await fetch(
      `http://localhost:8080/api/audiobooks?page=${page}&limit=${itemsPerPage}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    // If the API returns pagination metadata
    if (data.pagination) {
      currentPage = data.pagination.currentPage;
      totalPages = data.pagination.totalPages;
      renderPagination();
    }

    // Get the actual books array (adjust based on your API response structure)
    const audioBooks = data.items || data;

    renderAudioBooks(audioBooks);

    // Store the fetched books for search functionality
    if (!window.allAudioBooks) {
      window.allAudioBooks = [];
    }
    window.allAudioBooks = [...window.allAudioBooks, ...audioBooks];

    return audioBooks;
  } catch (error) {
    console.error("Error fetching audio books:", error);
    const audioGrid = document.getElementById("audioGrid");
    audioGrid.innerHTML = `
      <div class="error-message">
        <p>Sorry, we couldn't load the audio books. Please try again later.</p>
        <button onclick="fetchAudioBooks(${currentPage})">Retry</button>
      </div>
    `;
    return [];
  }
}

// Function to render audio books with custom player
function renderAudioBooks(books) {
  const audioGrid = document.getElementById("audioGrid");
  audioGrid.innerHTML = "";

  if (books.length === 0) {
    audioGrid.innerHTML = '<div class="no-results">No audio books found</div>';
    return;
  }

  books.forEach((book) => {
    const card = document.createElement("div");
    card.className = "audio-card";
    card.innerHTML = `
      <div class="audio-card-img" style="background-image: url('${book.coverImage}')"></div>
      <div class="audio-card-content">
        <div class="audio-title">${book.title}</div>
        <div class="audio-contributor">Narrated by ${book.contributor}</div>
        <div class="custom-audio-player" data-audio="${book.audioFile}">
          <audio preload="metadata">
            <source src="${book.audioFile}" type="audio/mpeg">
          </audio>
          <div class="player-controls">
            <button class="play-pause-btn">
              <i class="play-icon">▶</i>
              <i class="pause-icon" style="display:none;">❚❚</i>
            </button>
            <div class="progress-container">
              <div class="progress-bar">
                <div class="progress"></div>
              </div>
              <div class="time-display">
                <span class="current-time">0:00</span>
                <span class="duration">0:00</span>
              </div>
            </div>
            <div class="volume-container">
              <button class="volume-btn">🔊</button>
              <div class="volume-slider">
                <input type="range" min="0" max="1" step="0.1" value="1" class="volume-range">
              </div>
            </div>
          </div>
        </div>
        <div class="audio-description">${book.description}</div>
      </div>
    `;
    audioGrid.appendChild(card);

    // Set up the custom audio player
    setupAudioPlayer(card.querySelector(".custom-audio-player"));
  });
}

// Function to set up custom audio player
function setupAudioPlayer(playerElement) {
  const audio = playerElement.querySelector("audio");
  const playPauseBtn = playerElement.querySelector(".play-pause-btn");
  const playIcon = playerElement.querySelector(".play-icon");
  const pauseIcon = playerElement.querySelector(".pause-icon");
  const progress = playerElement.querySelector(".progress");
  const progressBar = playerElement.querySelector(".progress-bar");
  const currentTimeDisplay = playerElement.querySelector(".current-time");
  const durationDisplay = playerElement.querySelector(".duration");
  const volumeBtn = playerElement.querySelector(".volume-btn");
  const volumeSlider = playerElement.querySelector(".volume-slider");
  const volumeRange = playerElement.querySelector(".volume-range");

  // Initialize audio metadata
  audio.addEventListener("loadedmetadata", function () {
    durationDisplay.textContent = formatTime(audio.duration);
  });

  // Play/Pause functionality
  playPauseBtn.addEventListener("click", function () {
    if (audio.paused) {
      // Pause all other audio elements first
      document.querySelectorAll("audio").forEach((a) => {
        if (a !== audio && !a.paused) {
          a.pause();
          const playerEl = a.closest(".custom-audio-player");
          if (playerEl) {
            playerEl.querySelector(".play-icon").style.display = "inline";
            playerEl.querySelector(".pause-icon").style.display = "none";
          }
        }
      });

      // Play this audio
      audio.play();
      playIcon.style.display = "none";
      pauseIcon.style.display = "inline";
    } else {
      audio.pause();
      playIcon.style.display = "inline";
      pauseIcon.style.display = "none";
    }
  });

  // Update progress bar
  audio.addEventListener("timeupdate", function () {
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    progress.style.width = `${progressPercent}%`;
    currentTimeDisplay.textContent = formatTime(audio.currentTime);

    // If audio ended, reset to play icon
    if (audio.ended) {
      playIcon.style.display = "inline";
      pauseIcon.style.display = "none";
    }
  });

  // Click on progress bar to seek
  progressBar.addEventListener("click", function (e) {
    const seekPosition = e.offsetX / this.offsetWidth;
    audio.currentTime = seekPosition * audio.duration;
  });

  // Volume control
  volumeBtn.addEventListener("click", function () {
    volumeSlider.style.display =
      volumeSlider.style.display === "block" ? "none" : "block";
  });

  // Hide volume slider when clicking elsewhere
  document.addEventListener("click", function (e) {
    if (!volumeBtn.contains(e.target) && !volumeSlider.contains(e.target)) {
      volumeSlider.style.display = "none";
    }
  });

  // Adjust volume
  volumeRange.addEventListener("input", function () {
    audio.volume = this.value;
    updateVolumeIcon(this.value);
  });

  // Update volume icon based on level
  function updateVolumeIcon(volume) {
    if (volume >= 0.6) {
      volumeBtn.textContent = "🔊";
    } else if (volume >= 0.2) {
      volumeBtn.textContent = "🔉";
    } else if (volume > 0) {
      volumeBtn.textContent = "🔈";
    } else {
      volumeBtn.textContent = "🔇";
    }
  }

  // Keyboard shortcuts
  playerElement.addEventListener("keydown", function (e) {
    if (e.code === "Space") {
      e.preventDefault();
      playPauseBtn.click();
    }
  });
}

// Search functionality
const searchInput = document.getElementById("audioSearchInput");
searchInput.addEventListener("input", function () {
  const searchTerm = this.value.toLowerCase();

  // Make sure we have the audio books data
  if (!window.allAudioBooks) return;

  const filteredBooks = window.allAudioBooks.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm) ||
      book.contributor.toLowerCase().includes(searchTerm) ||
      book.description.toLowerCase().includes(searchTerm)
  );
  renderAudioBooks(filteredBooks);
});

// Contribute button functionality
const contributeBtn = document.getElementById("contributeBtn");
contributeBtn.addEventListener("click", function () {
  // Redirect to the contribution page
  window.location.href = "contributeAudio.html";
});

// Initial fetch and render
document.addEventListener("DOMContentLoaded", () => {
  fetchAudioBooks();
});

// Function to render pagination controls
function renderPagination() {
  const paginationContainer = document.getElementById("pagination");
  if (!paginationContainer) {
    // Create pagination container if it doesn't exist
    const container = document.createElement("div");
    container.id = "pagination";
    container.className = "pagination";
    document.querySelector(".audio-content").appendChild(container);
  }

  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  // Previous button
  const prevBtn = document.createElement("button");
  prevBtn.textContent = "Previous";
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      fetchAudioBooks(currentPage - 1);
    }
  });
  pagination.appendChild(prevBtn);

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.textContent = i;
    pageBtn.className = i === currentPage ? "active" : "";
    pageBtn.addEventListener("click", () => {
      fetchAudioBooks(i);
    });
    pagination.appendChild(pageBtn);
  }

  // Next button
  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      fetchAudioBooks(currentPage + 1);
    }
  });
  pagination.appendChild(nextBtn);
}

// Add pagination CSS
const paginationStyle = document.createElement("style");
paginationStyle.textContent = `
  .pagination {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin: 2rem 0;
  }
  
  .pagination button {
    padding: 0.5rem 1rem;
    border: 1px solid #ddd;
    background: white;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .pagination button.active {
    background: #333;
    color: white;
  }
  
  .pagination button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
document.head.appendChild(paginationStyle);

// Add some CSS for loading and error states
const style = document.createElement("style");
style.textContent = `
  .loading-indicator, .error-message, .no-results {
    padding: 2rem;
    text-align: center;
    grid-column: 1 / -1;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .error-message {
    color: #e74c3c;
  }
  
  .error-message button {
    background: #333;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    margin-top: 1rem;
    cursor: pointer;
  }
  
  .no-results {
    color: #7f8c8d;
    font-style: italic;
document.head.appendChild(style);

  }
`;
document.head.appendChild(style);
