//Open summarize with query
document.querySelector('.searchBtn').addEventListener('click', () => {
    const query = document.querySelector('.searchKeywordsInput').value;
    if(query){
        window.open(`/summarize?query=${query}`, '_blank');
    }
})
