const forbiddenFileNameChars = ["/", "\\", ":", "*", "?", "\"", "<", ">", "|",".",""];

myFilesList = document.querySelector('.myFilesList');
//Open file
myFilesList.addEventListener('click', (event) => {
    const fileElement = event.target.closest('.myFile');
    const moreInfo = event.target.closest('.moreInfo');
    const popupList = event.target.closest('.popupList');

    //If the click is on the file itself (not the three dots or popup options)
    if (fileElement && !moreInfo && !popupList) {
        const fileID = fileElement.closest('.myFile').id;
        window.open(`/summarize?fileID=${fileID}`, '_self');
    }
});

//Popup functionality
myFilesList.addEventListener('click', (event) => {
    
    //Rename file
    const renameButton = event.target.closest('.myFileRename');
    if (renameButton) {
        const fileID = renameButton.closest('.myFile').id;  //Find the file ID
        const fileName = renameButton.closest('.myFile').querySelector('.myFileName').textContent;  //Find the file name associated with the clicked rename button
        openRenamePopup(fileID,fileName);
    }

    //Delete file
    const deleteButton = event.target.closest('.myFileDelete');
    if (deleteButton) {
        const fileID = deleteButton.closest('.myFile').id;  //Find the file ID
        deleteFile(fileID);
    }

    //Open file in new tab
    const openButton = event.target.closest('.myFileOpen');
    if (openButton) {
        const fileID = openButton.closest('.myFile').id;  //Find the file ID
        window.open(`/summarize?fileID=${fileID}`, '_blank');
    }
});

//Delete file
async function deleteFile(fileID) {
    try {
        const response = await fetch(`http://localhost:8000/files/${fileID}`, {
            method: 'DELETE'
        });

        if(!response.ok){
            const errorDetails = await response.json();
            console.error('Delete file failed:', errorDetails);
        }else {
            //Reload the page after successful delete
            location.reload();
        }     

    } catch (error) {
        console.error('Error deleting file:', error);
    }
}

//Rename file
const renameFilePopup = document.querySelector('.renameFilePopup');
const overlay = document.querySelector('.overlay');
const newFileNameInput = document.querySelector('.newFileNameInput');

function openRenamePopup(fileID,fileName) {
    renameFilePopup.style.display = 'flex';
    overlay.style.display = 'block';
    newFileNameInput.value = fileName;

    //Close rename file popup
    document.querySelector('.closeFileBtn').addEventListener('click', () => {
        renameFilePopup.style.display = 'none';
        overlay.style.display = 'none';
    });

    //Rename file
    const renameFileBtn = document.querySelector('.renameFileBtn');
    renameFileBtn.addEventListener('click', async () => {
        if(newFileNameInput.value == fileName){
            renameFilePopup.style.display = 'none';
            overlay.style.display = 'none';
            return;
        }else if(newFileNameInput.value == forbiddenFileNameChars){
        
        }else{
            try {
                const response = await fetch(`http://localhost:8000/files/${fileID}`, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ new_name: newFileNameInput.value })
                });

                if(!response.ok){
                    const errorDetails = await response.json();
                    console.error('Rename file failed:', errorDetails);
                }else {
                    //Reload the page after successful rename
                    location.reload();
                }     

            } catch (error) {
                console.error('Error renaming file:', error);
            }
        }
    });
}

//Track the currently open popup
let currentOpenPopup = null;

//Popup display - Add event listener to the parent element
myFilesList.addEventListener('click', (event) => {
    //Check if the clicked element is a .moreInfo button
    if (event.target.classList.contains('moreInfo')) {
        const moreInfoPopUp = event.target.closest('.myFileDetails').querySelector('.moreInfoPopUp');

        //Close the currently open popup (if any)
        if (currentOpenPopup && currentOpenPopup !== moreInfoPopUp) {
            currentOpenPopup.style.display = 'none';
        }

        //Toggle the clicked popup
        if (moreInfoPopUp.style.display === 'none' || !moreInfoPopUp.style.display) {
            moreInfoPopUp.style.display = 'flex';
            currentOpenPopup = moreInfoPopUp; //Update the currently open popup
        } else {
            moreInfoPopUp.style.display = 'none';
            currentOpenPopup = null; //No popup is open now
        }
    }
});

//Close popup when clicking outside
document.addEventListener('click', (event) => {
    //Check if the click is outside any .moreInfoPopUp and not on a .moreInfo button
    if (!event.target.closest('.moreInfoPopUp') && !event.target.classList.contains('moreInfo')) {
        if (currentOpenPopup) {
            currentOpenPopup.style.display = 'none';
            currentOpenPopup = null; //No popup is open now
        }
    }
});

//Adjust the popup position to prevent overlapping the right edge
function adjustPopupPosition(popup, padding = 70) {
    const rect = popup.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    //Calculate the space available on the right
    const spaceOnRight = viewportWidth - rect.right;

    //If the popup is too close to the right edge adjust its position
    if (spaceOnRight < padding) {
        const overlapAmount = padding - spaceOnRight;
        popup.style.left = `-${overlapAmount}px`; //Move the popup left to fit
    } else {
        popup.style.left = '0'; //Reset to default position
    }
}

//Update popup position on window resize
window.addEventListener('resize', () => {
    if (currentOpenPopup) {
        adjustPopupPosition(currentOpenPopup);
    }
});
