#pip install fastapi
#pip install uvicorn
#pip install sqlalchemy
#pip install python-multipart

import os
import re
import sys
import uvicorn

from io import BytesIO
from typing import List
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi import Body, FastAPI, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session
from backend.FAISS.FAISS_models import FAISS_delete, FAISS_index,FAISS_search
from backend.utils.summary_model import generate_summary
from backend.files_db.database import SessionLocal, engine, Base
from backend.files_db.models import Files, TextSections
from backend.utils.file_to_image import pdf_to_image,image_to_base64
from backend.utils.file_to_text import doc_to_text,pdf_to_text

#Absolute path to the project root
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, project_root)

app = FastAPI()

#Open main
@app.get("/main", response_class=HTMLResponse)
async def read_root():
    with open(os.path.join("frontend", "main.html"), "r") as f:
        html_content = f.read()
    return html_content

#Open summarize
@app.get("/summarize", response_class=HTMLResponse)
async def read_summarize():
    with open(os.path.join("frontend", "summarize.html"), "r") as f:
        html_content = f.read()
    return html_content

#Mount the entire frontend directory
app.mount("/static", StaticFiles(directory="frontend"))

#Dependency to get DB session
def get_db():
    db = SessionLocal()  #Create a database session
    try:
        yield db         #Provide it to the caller
    finally:
        db.close()       #Ensure the session is closed after use

#Create tables in the database
Base.metadata.create_all(bind=engine)

#Upload Files
@app.post("/upload/")
async def upload_file(files: list[UploadFile] = File(...), db: Session = Depends(get_db)):

    for file in files:
        #Check if existing files
        existing_file = db.query(Files).filter(Files.file_name == file.filename).first()
        if existing_file:
            continue

        try:
            #Store file to DB
            file_data = await file.read()
            new_file = Files(file_name=file.filename, data=file_data)
            db.add(new_file)
            db.commit() 
            db.refresh(new_file)

            #Process file to get text
            file_extension = os.path.splitext(file.filename)[1]
            if file_extension == ".pdf":
                file_text = pdf_to_text(file_data)
            elif file_extension in [".doc",".docx"]:
                file_text = doc_to_text(file_data)

            #Split text into sections and store in the database
            text_sections = file_text.split("\n")
            for section in text_sections:
                section = re.sub(r'\s+', ' ', section.strip())  #Remove extra spaces
                if section.strip():  #Skip empty sections
                    new_section = TextSections(file_id=new_file.id, section_text=section)
                    db.add(new_section)
                    db.commit()
                    db.refresh(new_section)

                    #Index the section using its unique section ID
                    FAISS_index(section, new_section.id) 


        except Exception as e:
            print(f"Error processing {file.filename}: {str(e)}")
            db.rollback() 
            continue 
            

#Get all files from the database
@app.get("/files/")
async def get_files(db: Session = Depends(get_db)):
    files = db.query(Files).all()

    if not files:
        return []

    file_list = []
    for file in files:
        try:
            file_extension = os.path.splitext(file.file_name)[1]
            screenshot = None

            #Handle supported file types
            if file_extension == ".pdf":
                screenshot = pdf_to_image(file.data)
            elif file_extension in [".doc",".docx"]:
                screenshot = image_to_base64()

            file_list.append({
                "id": file.id,
                "name": os.path.splitext(file.file_name)[0],
                "screenshot": screenshot
            })

        except Exception as e:
            print(f"Error processing file {file.id}: {str(e)}")
            continue
        
    return file_list


#Delete file by ID
@app.delete("/files/{file_id}")
async def delete_file(file_id: int, db: Session = Depends(get_db)):
    file = db.query(Files).filter(Files.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404,detail="File not found.")

    #Get text sections associated with the file
    text_sections =  db.query(TextSections).filter(TextSections.file_id == file_id).all()
    #Get all section IDs associated with the file
    section_ids = [section.id for section in text_sections]
    
    try:
        #Delete vectors from the FAISS
        FAISS_delete(section_ids)

        #Delete sections from the database
        db.query(TextSections).filter(TextSections.file_id == file_id).delete()

        #Delete file
        db.delete(file)
        db.commit()

    except Exception as e:
        print(f"Error deleting file {file_id}: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error. Please try again later.")


#Rename file by ID
@app.put("/files/{file_id}")
async def rename_file(file_id: int, new_name: str = Body(..., embed=True), db: Session = Depends(get_db)):
    file = db.query(Files).filter(Files.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404,detail="File not found.")

    #Extract the file extension
    file_extension = os.path.splitext(file.file_name)[1]  
    new_name += file_extension
    #Check if a file with the new name already exists
    existing_file = db.query(Files).filter(Files.file_name == new_name).first()

    if not existing_file:
        try:
            file.file_name = new_name
            db.commit()

        except Exception as e:
            print(f"Error renaming file {file_id}: {str(e)}")
            db.rollback()
            raise HTTPException(status_code=500, detail="Internal server error. Please try again later.")


#Get file by ID - Open
@app.get("/files/{file_id}")
async def get_file(file_id: int, db: Session = Depends(get_db)):
    file = db.query(Files).filter(Files.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404,detail="File not found.")

    try:
        file_extension = os.path.splitext(file.file_name)[1]
        if file_extension == ".pdf":
            #Create a BytesIO stream from the binary data
            #BytesIO(file.data) wraps the binary data into a streamable object, which will be sent to the client in chunks.
            return StreamingResponse(BytesIO(file.data), media_type="application/pdf")
        
        elif file_extension in [".doc",".docx"]:
            file_text = doc_to_text(file.data)
            return JSONResponse(content={"text": file_text}) 
        
    except Exception as e:
        print(f"Error getting file {file_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error. Please try again later.")
    
    
#Get relevant sections based on users query
@app.get("/search/{query}")
async def search(query: str, top_k: int = 5, db: Session = Depends(get_db)):
    try:
        search_results = FAISS_search(query, top_k)    #Get the section IDs from the FAISS index
        results = []

        for section_id, relevance in search_results:
            #Fetch the TextSection from the database
            section = db.query(TextSections).filter(TextSections.id == section_id).first()
            if section:
                #Fetch the file name and relevant text
                file = db.query(Files).filter(Files.id == section.file_id).first()
                if file:
                    results.append({
                        "file_name": file.file_name,
                        "section_id": section.id,
                        "section_text": section.section_text,
                        "relevance_score": round(float(relevance), 3)  #Round score for readability
                    })

        results.sort(key=lambda x: x["relevance_score"], reverse=True)  #Sort highest score
        return {"results": results}
    
    except Exception as e:
        print(f"Error searching in files: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error. Please try again later.")

#File summary
@app.post("/file/{file_id}")
async def get_file_summary(file_id: int, message: str = Body(..., embed=True), db: Session = Depends(get_db)):
    if any(word in message.lower() for word in ["summarize", "summary", "summaries"]):
        file = db.query(Files).filter(Files.id == file_id).first()
        if not file:
            raise HTTPException(status_code=404,detail="File not found.")

        try:
            #Get text sections associated with the file
            sections =  db.query(TextSections).filter(TextSections.file_id == file_id).all()
            section_text = [section.section_text for section in sections]

            reconstructed_text = "\n".join(section_text)
            answer = generate_summary(reconstructed_text)

        except Exception as e:
            print(f"Error getting summary: {str(e)}")
            answer = "There was an error with the summary. Please try again later..."
        
    else:
        answer = "Currently, I can only summarize. Try asking for a summary!"

    return {"answer": answer}
    

#Sections summary
@app.post("/sections/")
async def get_sections_summary(sections_ids: List[str] = Body(..., embed=True), message: str = Body(..., embed=True), db: Session = Depends(get_db)):
    if any(word in message.lower() for word in ["summarize", "summary", "summaries"]):
        try:
            reconstructed_text = ""     
            matches = re.findall(r'\b([1-5])\b', message)   #Find ints in message

            #Summarize specific sections
            if matches:
                match_sections_id = []
                #Find sectionsIDs from matches
                for index in matches:
                    adjusted_index = (int(index) - 1) % len(sections_ids)  
                    match_sections_id.append(sections_ids[adjusted_index])

                for section_id in match_sections_id:
                    section =  db.query(TextSections).filter(TextSections.id == section_id).first()
                    reconstructed_text += "\n" + section.section_text

            #If not specific section then summarize all
            else:
                for section_id in sections_ids:
                    section =  db.query(TextSections).filter(TextSections.id == section_id).first()
                    reconstructed_text += "\n" + section.section_text
                
            answer = generate_summary(reconstructed_text)

        except Exception as e:
            print(f"Error getting summary: {str(e)}")
            answer = "There was an error with the summary. Please try again later..."
    else:
        answer = "Currently, I can only summarize. Try asking for a summary!"

    return {"answer": answer}
    

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)