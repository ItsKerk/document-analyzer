const filesList = document.querySelector('.filesList');
const filesContainer = document.querySelector('.filesContainer');
const dottedContainer = document.querySelector('.dottedContainer');
const uploadContainer = document.querySelector('.uploadContainer');

//Upload Files to Display
document.querySelector('#filesInput').addEventListener('change', function(event) {
  const files = event.target.files;

  if (files.length > 0) {
    addDisplay();
    if(filesList.children.length !== 0){
        filesList.innerHTML = '';
    }
    for (const file of files) {
        const fileExtension = file.name.split('.').pop();
        const formattedSize = formatFileSize(file.size);
        if(fileExtension=='pdf'){
            filesList.innerHTML += `<div class="file">
                                        <img src="/static/images/pdf-icon.svg" alt="pdfIcon" class="fileIcon"/>
                                            <div class="fileInfo">
                                                <span class="fileName">${file.name}</span>
                                                <span class="fileSize">${formattedSize}</span>
                                            </div>
                                        <img src="/static/images/x-black.png" alt="x-black" class="deleteFile"/>
                                    </div>
                                    `
        }else{
            filesList.innerHTML += `<div class="file">
                                        <img src="/static/images/doc-icon.svg" alt="docIcon" class="fileIcon"/>
                                            <div class="fileInfo">
                                                <span class="fileName">${file.name}</span>
                                                <span class="fileSize">${formattedSize}</span>
                                            </div>
                                        <img src="/static/images/x-black.png" alt="x-black" class="deleteFile"/>
                                    </div>
                                    `
        }
    }
    checkOverflow();
  } else {
    console.log("No files selected.");
  }
});

//File Size Formatter
function formatFileSize(size) {
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB'];
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
}

//Clear All Files button 
document.querySelector('.clearBtn').addEventListener('click', () => {
    filesList.innerHTML = '';
    removeDisplay();
});

//Remove file
document.querySelector('.filesList').addEventListener('click', (event) => {
    if (event.target.classList.contains('deleteFile')) {
        const fileItem = event.target.closest('.file');
        if (fileItem) {
            fileItem.remove();
            checkOverflow();
        }
        if(filesList.children.length == 0){
            removeDisplay();
        }
    }
});

//Upload Files to db
document.querySelector('.uploadBtn').addEventListener('click', async () => {
    const files = document.querySelector('#filesInput').files;
    if (files.length > 0) {
        const formData = new FormData();
        for (const file of files) {
            formData.append('files', file);
        }

        try{
            //Sending the Request
            const response = await fetch('http://localhost:8000/upload/', {
                method: 'POST',
                body: formData  //Sends the file data
            });

        if(!response.ok){
            const errorDetails = await response.json();
            console.error('Upload failed:', errorDetails);
        }else {
            //Reload the page after successful upload
            location.reload();
        }   

        }catch(error){
            console.error('Error during fetch:', error);
        }
    }
});

//Function to check if overflow is present
function checkOverflow() {
  if (filesList.scrollHeight > filesList.clientHeight) {
    filesList.style.paddingRight = '10px';  //Add padding when overflow appears
  } else {
    filesList.style.paddingRight = '0';  //Remove padding when no overflow
  }
}

//Define the handleResize function in the global scope
function handleResize() {
    const width = window.innerWidth;

    if (width <= 760) {
        if (filesList.children.length > 0) {
            dottedContainer.style.width = '100%';
            uploadContainer.style.height = '730px';
        }
    } else {
        if (filesList.children.length > 0) {
            dottedContainer.style.width = '50%';
            uploadContainer.style.height = '370px';
        }
    }
}

//Check overflow on page load and window resize
window.addEventListener('load', checkOverflow);
window.addEventListener('resize', checkOverflow);

//Add event listener to handle window resizing
window.addEventListener('resize', handleResize);

//Call handleResize on initial load
handleResize();

//Responsive Design
function addDisplay(){
    filesContainer.style.display = 'flex';
    if(window.innerWidth > 760){
        dottedContainer.style.width = '50%';
    }else{
        uploadContainer.style.height = '730px';
    }
}

//Responsive Design
function removeDisplay(){
    document.querySelector('#filesInput').value = '';
    
    filesContainer.style.display = 'none';
    if(window.innerWidth > 760){
        dottedContainer.style.width = '100%';
    }else{
        uploadContainer.style.height = '370px';
    }
}