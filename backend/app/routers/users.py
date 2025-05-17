from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from pydantic import BaseModel
from .auth import get_current_active_user, User, get_password_hash, fake_users_db

router = APIRouter()

class UserCreate(BaseModel):
    username: str
    email: str
    full_name: str
    password: str

class UserResponse(BaseModel):
    username: str
    email: str
    full_name: str

@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, current_user: User = Depends(get_current_active_user)):
    # In a real application, you would check if the user has admin privileges
    if user.username in fake_users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    hashed_password = get_password_hash(user.password)
    fake_users_db[user.username] = {
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "hashed_password": hashed_password,
        "disabled": False
    }
    
    return {
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name
    }

@router.get("/users", response_model=List[UserResponse])
async def read_users(current_user: User = Depends(get_current_active_user)):
    # In a real application, you would check if the user has admin privileges
    users = []
    for username, user_data in fake_users_db.items():
        users.append({
            "username": user_data["username"],
            "email": user_data["email"],
            "full_name": user_data["full_name"]
        })
    return users

@router.get("/users/{username}", response_model=UserResponse)
async def read_user(username: str, current_user: User = Depends(get_current_active_user)):
    # In a real application, you would check if the user has admin privileges or is the requested user
    if username not in fake_users_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user_data = fake_users_db[username]
    return {
        "username": user_data["username"],
        "email": user_data["email"],
        "full_name": user_data["full_name"]
    }

@router.delete("/users/{username}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(username: str, current_user: User = Depends(get_current_active_user)):
    # In a real application, you would check if the user has admin privileges
    if username not in fake_users_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    del fake_users_db[username]
    return None