from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: str = Field(alias="_id")
    hashed_password: str
    created_at: datetime
    
    class Config:
        populate_by_name = True

class UserResponse(UserBase):
    id: str = Field(alias="_id")
    created_at: datetime
    
    class Config:
        populate_by_name = True

class DocumentBase(BaseModel):
    filename: str
    file_path: str
    category: Optional[str] = None
    summary: Optional[str] = None
    botpress_file_id: Optional[str] = None
    status: str = "uploaded"

class DocumentCreate(DocumentBase):
    user_id: str

class DocumentInDB(DocumentCreate):
    id: str = Field(alias="_id")
    uploaded_at: datetime
    
    class Config:
        populate_by_name = True

class DocumentResponse(DocumentBase):
    id: str = Field(alias="_id")
    user_id: str
    uploaded_at: datetime
    
    class Config:
        populate_by_name = True
