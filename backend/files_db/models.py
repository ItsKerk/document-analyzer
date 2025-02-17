from sqlalchemy import Column, ForeignKey, Integer, LargeBinary, String, Text
from backend.files_db.database import Base
from sqlalchemy.orm import relationship

class Files(Base):
    __tablename__ = "files"
    
    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String, index=True)
    data = Column(LargeBinary, nullable=False)  #BLOB: Stores binary content
    
    #Relationship to TextSections (One-to-many: one file can have many sections)
    sections = relationship("TextSections", back_populates="file")

#TextSection model to store text sections of each file
class TextSections(Base):
    __tablename__ = 'text_sections'
    
    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey('files.id'))  #Reference to the Files table
    section_text = Column(Text)  #Store the actual text of the section

    #Relationship to the Files table
    file = relationship("Files", back_populates="sections")