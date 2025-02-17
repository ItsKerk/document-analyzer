//Get fileID or query from URL
const urlParams = new URLSearchParams(window.location.search);
const fileID = urlParams.get('fileID');
const query = urlParams.get('query');

const main = document.querySelector('.main');

if(fileID && !query){
    getFile(fileID);
}

//Get file iframe or text
async function getFile(fileID) {
    try {
        const response = await fetch(`http://localhost:8000/files/${fileID}`);

        if(!response.ok){
            const errorDetails = await response.json();
            console.error('Fetch file failed:', errorDetails);
        } 

        //Check if pdf or doc
        const contentType = response.headers.get("Content-Type");

        if(contentType === "application/pdf"){
            main.innerHTML = `<iframe src="${response.url}" class="fileIframe"></iframe>`
        }
        else{
            const data = await response.json();
            main.innerHTML = `  <div class="fileTextContainer">
                                    <p>${data.text}</p>
                                </div>`;
        }

    } catch (error) {
        console.error('Error fetching files:', error);
    }
}


if(query && !fileID){
    getSectionsFromQuery(query);
}

//Get sections from query
async function getSectionsFromQuery(query) {
    try{
        //Sending the Request
        const response = await fetch(`http://localhost:8000/search/${query}`);

        if(!response.ok){
            const errorDetails = await response.json();
            console.error('Upload failed:', errorDetails);
        }   

        const data = await response.json();
        main.innerHTML = `<div class="queryContainer">
                            <h1>Query:</h1>
                            <p class="usersQuery">${query}</p>
                          </div>
                          <div class="resultsContainer"></div>`;

        const resultsContainer = document.querySelector('.resultsContainer')
        for (const section of data.results) {
            resultsContainer.innerHTML += `<div class="resultSection" id="${section.section_id}">
                                                <p class="resultText">${section.section_text}</p>
                                                <h3 class="resultName">Source: <b>${section.file_name}</b></h3>
                                                <h3 class="resultScore">Accuracy Score: <b>${section.relevance_score}</b></h3>
                                            </div>`
        }

        //Change chatbot text
        document.querySelector('.chatbotPlaceHolder').innerHTML += `<br><br>Choose which sections you want to summarize!`;
        document.querySelector('.chatbotInput').placeholder  = "Ex: Summarize 1, 3 and 4 or all";

        }catch(error){
            console.error('Error during fetch:', error);
        }
}