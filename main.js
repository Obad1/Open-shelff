// Global variables for pagination
let currentPage = 1;
const itemsPerPage = 12;
let totalPages = 1;

async function fetchBooks(page = 1) {
  try {
    // Show loading state
    const bookGrid = document.getElementById("bookGrid");
    bookGrid.innerHTML =
      '<div class="loading-indicator">Loading books...</div>';

    // Fetch books from the API with pagination
    const response = await fetch(
      `http://localhost:8080/api/books?page=${page}&limit=${itemsPerPage}`
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
    const books = data.items || data;

    renderBooks(books);

    // Store the fetched books for search functionality
    if (!window.allBooks) {
      window.allBooks = [];
    }
    window.allBooks = [...window.allBooks, ...books];

    return books;
  } catch (error) {
    console.error("Error fetching books:", error);
    const bookGrid = document.getElementById("bookGrid");
    bookGrid.innerHTML = `
      <div class="error-message">
        <p>Sorry, we couldn't load the books. Please try again later.</p>
        <button onclick="fetchBooks(${currentPage})">Retry</button>
      </div>
    `;
    return [];
  }
}

// Function to render books
function renderBooks(books) {
  const bookGrid = document.getElementById("bookGrid");
  bookGrid.innerHTML = "";

  if (books.length === 0) {
    bookGrid.innerHTML = '<div class="no-results">No books found</div>';
    return;
  }

  books.forEach((book) => {
    const card = document.createElement("div");
    card.className = "book-card";
    card.innerHTML = `
      <img src="${book.image || "images/default-cover.jpg"}" alt="${
      book.title
    }">
      <div class="book-title">${book.title}</div>
      <div class="book-author">by ${book.author}</div>
      <a href="book.html?id=${book.id}">View Details</a>
    `;
    bookGrid.appendChild(card);
  });
}

// Add search functionality if needed
function setupSearch() {
  const searchInput = document.getElementById("bookSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase();

      // Make sure we have the books data
      if (!window.allBooks) return;

      const filteredBooks = window.allBooks.filter(
        (book) =>
          book.title.toLowerCase().includes(searchTerm) ||
          book.author.toLowerCase().includes(searchTerm)
      );
      renderBooks(filteredBooks);
    });
  }
}

// Function to render pagination controls
function renderPagination() {
  const paginationContainer = document.getElementById("pagination");
  if (!paginationContainer) {
    // Create pagination container if it doesn't exist
    const container = document.createElement("div");
    container.id = "pagination";
    container.className = "pagination";
    document.querySelector("body").appendChild(container);
  }

  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  // Previous button
  const prevBtn = document.createElement("button");
  prevBtn.textContent = "Previous";
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      fetchBooks(currentPage - 1);
    }
  });
  pagination.appendChild(prevBtn);

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.textContent = i;
    pageBtn.className = i === currentPage ? "active" : "";
    pageBtn.addEventListener("click", () => {
      fetchBooks(i);
    });
    pagination.appendChild(pageBtn);
  }

  // Next button
  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      fetchBooks(currentPage + 1);
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

// Initial fetch and render
document.addEventListener("DOMContentLoaded", () => {
  fetchBooks();
  setupSearch();

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
    }
  `;
  document.head.appendChild(style);
});
