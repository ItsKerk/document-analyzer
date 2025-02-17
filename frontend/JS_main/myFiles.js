myFilesList = document.querySelector('.myFilesList');

//Get Files
async function getFiles() {
    try {
        const response = await fetch('http://localhost:8000/files/');

        if(!response.ok){
            const errorDetails = await response.json();
            console.error('Get files failed:', errorDetails);
        }   

        const data = await response.json();                                                                       

        if(data.length > 0) {
            document.querySelector('.myFilesContainer').style.display = 'flex';
            document.querySelector('.searchContainer').style.display = 'flex';
        }
        for (let i = data.length - 1; i >= 0; i--) {
            const file = data[i];
            myFilesList.innerHTML += `<div class="myFile" id="${file.id}">
                                        <img src="${file.screenshot}" alt="filepicture" class="myFilePic">
                                        <div class="myFileInfo">
                                            <span class="myFileName">${file.name}</span>
                                            <div class="myFileDetails">
                                                <img src="/static/images/dots.png" alt="moreInfo" class="moreInfo"/>
                                                <div class="moreInfoPopUp">
                                                    <div class="myFileRename popupList">
                                                        <img src="/static/images/edit.png" alt="renamefile" class="popupIcon">
                                                        <span class="popupText">Rename</span>
                                                    </div>
                                                    <div class="myFileDelete popupList">
                                                        <img src="/static/images/trash.png" alt="deletefile" class="popupIcon">
                                                        <span class="popupText">Delete</span>
                                                    </div>
                                                    <div class="myFileOpen popupList">
                                                        <img src="/static/images/open.png" alt="openfile" class="popupIcon">
                                                        <span class="popupText">Open in new page</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                      </div>`;
        }

    } catch (error) {
        console.error('Error fetching files:', error);
    }
}
getFiles();

//Hide myFilesContainer and searchContainer if there are no files
function noFiles(){
    if (myFilesList.children.length === 0) {
        document.querySelector('.myFilesContainer').style.display = 'none';
        document.querySelector('.searchContainer').style.display = 'none';
    }else{
        document.querySelector('.myFilesContainer').style.display = 'flex';
        document.querySelector('.searchContainer').style.display = 'flex';
    }
}
noFiles();