# **Document Analyzer**


Document Analyzer is a FastAPI-based application designed to analyze and summarize documents using machine learning models.  
It utilizes FAISS for efficient similarity searches and Google Pegasus for summarization.


## **Features**

* **Frontend**: A web-based interface for document analysis

* **FastAPI Backend**: A lightweight backend for API services.

* **FAISS Integration**: Efficient similarity search and retrieval using FAISS.

* **Summarization**: Generates concise summaries of documents using Google's pegasus-cnn_dailymail model.


## **Project Structure**

Document Analyzer/  
│── backend/            
│   │── FAISS/  
│   │   └── FAISS_models.py            #FAISS implementation with sentence embeddings  
│   │── utils/    
│   │   └── summary_model.py       #Summarization model  
│   │── main.py                    #FastAPI backend   
│  
│── frontend/  
│   └── (Frontend files)         
│  
│── Dockerfile                  #Docker configuration   
│── README.md                                     
│── requirements.txt         #Python dependencies 


## **Installation**

### **Prerequisites**

* Python 3.9+
* pip

### **Setup**
1. Install dependencies:   
`pip install -r requirements.txt \`

2.  Run:  
`uvicorn main:app --reload`

3. Open:  
http://localhost:8000/main

## **Running with Docker**

### Option 1: Build the Docker Image (from source)  
If you want to build the Docker image, run the following command:  
`docker build -t document-analyzer . `  

### OR

### Option 2: Using the Pre-built Docker Image (via Docker Hub)  
Pull the pre-built image from Docker Hub:  
`docker pull kerkt/document-analyzer`  

### 3. Create and Run the Container  
After building the image or pulling the pre-built image, run the container with:  
`docker run -d -p 8000:8000 --name document-analyzer kerkt/document-analyzer`
