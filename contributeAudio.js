// Sample book data - in a real app, this would come from your database
const books = [
  { id: "b001", title: "The Great Gatsby" },
  { id: "b002", title: "Thinking, Fast and Slow" },
  { id: "b003", title: "Atomic Habits" },
  { id: "b004", title: "To Kill a Mockingbird" },
  { id: "b005", title: "1984" },
];

// DOM elements
const bookSelect = document.getElementById("bookSelect");
const startRecordingBtn = document.getElementById("startRecording");
const stopRecordingBtn = document.getElementById("stopRecording");
const playRecordingBtn = document.getElementById("playRecording");
const submitRecordingBtn = document.getElementById("submitRecording");
const audioVisualizer = document.getElementById("audioVisualizer");
const timerDisplay = document.querySelector(".recorder-timer");
const audioSubmissionForm = document.getElementById("audioSubmissionForm");

// Recording variables
let mediaRecorder;
let audioChunks = [];
let audioBlob;
let audioUrl;
let recordingTimer;
let seconds = 0;
let audioContext;
let analyser;
let visualizerCanvas;
let canvasContext;

// Populate book select dropdown
function populateBookSelect() {
  books.forEach((book) => {
    const option = document.createElement("option");
    option.value = book.id;
    option.textContent = book.title;
    bookSelect.appendChild(option);
  });
}

// Initialize audio visualizer
function setupVisualizer() {
  visualizerCanvas = audioVisualizer;
  canvasContext = visualizerCanvas.getContext("2d");

  // Set canvas dimensions
  visualizerCanvas.width = visualizerCanvas.offsetWidth;
  visualizerCanvas.height = visualizerCanvas.offsetHeight;
}

// Update timer display
function updateTimer() {
  seconds++;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  timerDisplay.textContent = `${minutes
    .toString()
    .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

// Start recording function
async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Set up audio context for visualizer
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.fftSize = 256;

    // Start recording
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      audioUrl = URL.createObjectURL(audioBlob);
      playRecordingBtn.disabled = false;
      submitRecordingBtn.disabled = false;
    };

    // Start timer
    seconds = 0;
    updateTimer();
    recordingTimer = setInterval(updateTimer, 1000);

    // Start visualizer
    drawVisualizer();

    mediaRecorder.start();
    startRecordingBtn.disabled = true;
    stopRecordingBtn.disabled = false;
  } catch (error) {
    console.error("Error accessing microphone:", error);
    alert(
      "Unable to access your microphone. Please check your permissions and try again."
    );
  }
}

// Stop recording function
function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    clearInterval(recordingTimer);
    stopRecordingBtn.disabled = true;
    startRecordingBtn.disabled = false;

    // Stop all tracks in the stream
    mediaRecorder.stream.getTracks().forEach((track) => track.stop());
  }
}

// Play recording function
function playRecording() {
  if (audioUrl) {
    const audio = new Audio(audioUrl);
    audio.play();
  }
}

// Draw audio visualizer
function drawVisualizer() {
  if (!analyser) return;

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    if (!analyser) return;

    requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);

    canvasContext.fillStyle = "#f5f5f5";
    canvasContext.fillRect(
      0,
      0,
      visualizerCanvas.width,
      visualizerCanvas.height
    );

    const barWidth = (visualizerCanvas.width / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = dataArray[i] / 2;

      canvasContext.fillStyle = `rgb(${barHeight + 100}, 65, 192)`;
      canvasContext.fillRect(
        x,
        visualizerCanvas.height - barHeight,
        barWidth,
        barHeight
      );

      x += barWidth + 1;
    }
  }

  draw();
}

// Submit recording function
function submitRecording(event) {
  event.preventDefault();

  const bookId = bookSelect.value;
  const contributorName = document.getElementById("contributorName").value;
  const recordingTitle = document.getElementById("recordingTitle").value;
  const recordingDescription = document.getElementById(
    "recordingDescription"
  ).value;
  const termsAgreement = document.getElementById("termsAgreement").checked;

  if (
    !bookId ||
    !contributorName ||
    !recordingTitle ||
    !termsAgreement ||
    !audioBlob
  ) {
    alert(
      "Please fill in all required fields and record audio before submitting."
    );
    return;
  }

  // In a real application, you would upload the audioBlob to your server
  // For this example, we'll simulate a successful upload

  // Create FormData object to send to server
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.wav");
  formData.append("bookId", bookId);
  formData.append("contributor", contributorName);
  formData.append("title", recordingTitle);
  formData.append("description", recordingDescription);

  // Simulate upload with timeout
  submitRecordingBtn.disabled = true;
  submitRecordingBtn.textContent = "Uploading...";

  setTimeout(() => {
    alert(
      "Thank you for your contribution! Your recording has been submitted for review."
    );
    window.location.href = "audioPlayer.html";
  }, 2000);

  // In a real application, you would use fetch to send the data:

  fetch("http://localhost:8080/api/audiobooks", {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    credentials: "include",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      alert(
        "Thank you for your contribution! Your recording has been submitted for review."
      );
      window.location.href = "audioPlayer.html";
    })
    .catch((error) => {
      console.error("Error uploading recording:", error);
      alert("There was an error uploading your recording. Please try again.");
      submitRecordingBtn.disabled = false;
      submitRecordingBtn.textContent = "Submit Recording";
    });
}

// Event listeners
startRecordingBtn.addEventListener("click", startRecording);
stopRecordingBtn.addEventListener("click", stopRecording);
playRecordingBtn.addEventListener("click", playRecording);
audioSubmissionForm.addEventListener("submit", submitRecording);

// Initialize
window.addEventListener("load", () => {
  populateBookSelect();
  setupVisualizer();
});

// Handle window resize for visualizer
window.addEventListener("resize", () => {
  if (visualizerCanvas) {
    visualizerCanvas.width = visualizerCanvas.offsetWidth;
  }
});
