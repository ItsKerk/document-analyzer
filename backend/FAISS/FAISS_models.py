#pip install faiss-cpu sentence-transformers numpy
import os
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

#Model that converts text into vector embeddings
model = SentenceTransformer("all-MiniLM-L6-v2")

#FAISS index file path
FAISS_INDEX_PATH = "backend/FAISS/file_index.faiss"

#Converts sections into embeddings and stores them in a FAISS index
def FAISS_index(section_text, section_id):

    #Convert the section text into a vector embedding
    vector = model.encode(section_text, show_progress_bar=False)

    #Check if an existing FAISS index exists
    if os.path.exists(FAISS_INDEX_PATH):
        index = faiss.read_index(FAISS_INDEX_PATH)  #Load existing index
    else:
        index_flat = faiss.IndexFlatL2(vector.shape[0])
        index = faiss.IndexIDMap(index_flat)  #Create a new FAISS index

    #Add the vector and its associated section_id to the FAISS index
    index.add_with_ids(np.array([vector], dtype="float32"), np.array([section_id], dtype="int64"))

    #Save the updated FAISS index
    faiss.write_index(index, FAISS_INDEX_PATH)


#This function searches for relevant sections in the FAISS index
def FAISS_search(query: str, top_k: int = 5):
    #Convert the query text into a vector embedding
    query_vector = model.encode(query, show_progress_bar=False)

    #Check if the FAISS index exists
    if not os.path.exists(FAISS_INDEX_PATH):
        return []

    #Load the existing FAISS index
    index = faiss.read_index(FAISS_INDEX_PATH)

    #Perform the similarity search
    distances, IDs = index.search(np.array([query_vector], dtype="float32"), top_k)

    #Convert distances to relevance scores
    scores = 1 / (1 + distances[0])  

    #Convert FAISS IDs to a list of Python integers
    section_ids = [int(id) for id in IDs[0] if id != -1]

    #Return list with pair elements
    return list(zip(section_ids, scores))


#Delete sections
def FAISS_delete(section_ids):
    #Check if the FAISS index exists
    if not os.path.exists(FAISS_INDEX_PATH):
        return []

    #Load the existing FAISS index
    index = faiss.read_index(FAISS_INDEX_PATH)

    #Convert list of section IDs into a NumPy array
    section_ids_array = np.array(section_ids, dtype="int64")
    
    #Remove Vectors by ID
    index.remove_ids(section_ids_array)

    #Save the updated FAISS index
    faiss.write_index(index, FAISS_INDEX_PATH)