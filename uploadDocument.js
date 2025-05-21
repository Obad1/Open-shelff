// DOM elements
const documentUploadForm = document.getElementById('documentUploadForm');
const documentFileInput = document.getElementById('documentFile');
const fileNameDisplay = document.querySelector('.file-name');
const fileUploadButton = document.querySelector('.file-upload-button');
const submitButton = document.getElementById('submitDocument');

// Handle file selection
documentFileInput.addEventListener('change', function(event) {
  const file = event.target.files[0];
  
  if (file) {
    // Display file name
    fileNameDisplay.textContent = file.name;
    
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      alert('File size exceeds the 10MB limit. Please choose a smaller file.');
      documentFileInput.value = '';
      fileNameDisplay.textContent = 'No file chosen';
      return;
    }
    
    // Check file type
    const acceptedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!acceptedTypes.includes(fileExtension)) {
      alert('Invalid file type. Please upload a PDF, DOC, DOCX, or TXT file.');
      documentFileInput.value = '';
      fileNameDisplay.textContent = 'No file chosen';
    }
  } else {
    fileNameDisplay.textContent = 'No file chosen';
  }
});

// Make the custom button trigger the file input
fileUploadButton.addEventListener('click', function() {
  documentFileInput.click();
});

// Handle form submission
documentUploadForm.addEventListener('submit', function(event) {
  event.preventDefault();
  
  // Get form values
  const title = document.getElementById('documentTitle').value;
  const author = document.getElementById('authorName').value;
  const category = document.getElementById('documentCategory').value;
  const description = document.getElementById('documentDescription').value;
  const file = documentFileInput.files[0];
  const tags = document.getElementById('documentTags').value;
  const termsAgreed = document.getElementById('termsAgreement').checked;
  const licenseAgreed = document.getElementById('licenseAgreement').checked;
  
  // Validate required fields
  if (!title || !author || !category || !file || !termsAgreed) {
    alert('Please fill in all required fields and accept the terms.');
    return;
  }
  
  // Create FormData object to send to server
  const formData = new FormData();
  formData.append('title', title);
  formData.append('author', author);
  formData.append('category', category);
  formData.append('description', description);
  formData.append('document', file);
  formData.append('tags', tags);
  formData.append('licenseAgreed', licenseAgreed);
  
  // Show loading state
  submitButton.disabled = true;
  submitButton.textContent = 'Uploading...';
  
  // Simulate upload with timeout (in a real app, you would use fetch to send to server)
  setTimeout(() => {
    // Show success message
    alert('Thank you for your contribution! Your document has been submitted for review.');
    
    // Reset form
    documentUploadForm.reset();
    fileNameDisplay.textContent = 'No file chosen';
    
    // Reset button
    submitButton.disabled = false;
    submitButton.textContent = 'Upload Document';
    
    // Redirect to community documents page
    window.location.href = 'communityDocuments.html';
  }, 2000);
  
  // In a real application, you would use fetch to send the data:
  /*
  fetch('/api/documents', {
    method: 'POST',
    body: formData
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    alert('Thank you for your contribution! Your document has been submitted for review.');
    documentUploadForm.reset();
    fileNameDisplay.textContent = 'No file chosen';
    window.location.href = 'communityDocuments.html';
  })
  .catch(error => {
    console.error('Error uploading document:', error);
    alert('There was an error uploading your document. Please try again.');
    submitButton.disabled = false;
    submitButton.textContent = 'Upload Document';
  });
  */
});