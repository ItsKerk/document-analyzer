//Open chatbot
document.querySelector('.chatbotIcon').addEventListener('click', () => {
    chatbotOpen = document.querySelector('.chatbotOpen')
    if (chatbotOpen.style.display === 'none' || chatbotOpen.style.display === '') {
        chatbotOpen.style.display = 'flex';
    } else {
        chatbotOpen.style.display = 'none';
    }
})

//Send file summary
if(fileID){
    document.querySelector('.sendInput').addEventListener('click', async () => {
        const message = document.querySelector('.chatbotInput').value;
        if(message){
            document.querySelector('.chatbotPlaceHolder').style.display = 'none';   //Hide Placeholder
            const chatbotText = document.querySelector('.chatbotText');
    
            //Create chatbot input
            chatbotText.innerHTML += `<span class="userInput">${message}</span>`
            document.querySelector('.chatbotInput').value = '';
            chatbotText.scrollTop = chatbotText.scrollHeight;   //Scroll to new msg

            try{
                const response = await fetch(`http://localhost:8000/file/${fileID}`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ message: message })
                });
    
                if(!response.ok){
                    const errorDetails = await response.json();
                    console.error('Send message failed:', errorDetails);
                } 
    
                //Create chatbot output
                const data = await response.json();
                chatbotText.innerHTML += `<span class="chatbotOutput">${data.answer}</span>`
    
                chatbotText.scrollTop = chatbotText.scrollHeight;   //Scroll to new msg
            }catch (error) {
                console.error('Error sending message:', error);
            }
        }
    })
}

//Send sections summary
if(query){
    document.querySelector('.sendInput').addEventListener('click', async () => {
        const message = document.querySelector('.chatbotInput').value;
        if(message){
            document.querySelector('.chatbotPlaceHolder').style.display = 'none';   //Hide Placeholder
            const chatbotText = document.querySelector('.chatbotText');
    
            //Create chatbot input
            chatbotText.innerHTML += `<span class="userInput">${message}</span>`
            document.querySelector('.chatbotInput').value = '';
            chatbotText.scrollTop = chatbotText.scrollHeight;   //Scroll to new msg

            //Get sections id
            sectionIDs = []
            const resultSection = document.querySelectorAll('.resultSection')
            for (let i = 0; i < resultSection.length; i++){
                sectionIDs[i] = resultSection[i].id;
            }

            try{
                const response = await fetch(`http://localhost:8000/sections/`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ sections_ids: sectionIDs, message: message })
                });
    
                if(!response.ok){
                    const errorDetails = await response.json();
                    console.error('Send message failed:', errorDetails);
                } 
    
                //Create chatbot output
                const data = await response.json();
                chatbotText.innerHTML += `<span class="chatbotOutput">${data.answer}</span>`
    
                chatbotText.scrollTop = chatbotText.scrollHeight;   //Scroll to new msg
            }catch (error) {
                console.error('Error sending message:', error);
            }
        }
    })
}