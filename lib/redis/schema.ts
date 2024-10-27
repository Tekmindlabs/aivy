interface UserSchema {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

// Keys:
// users:{id} -> UserSchema
// users:email:{email} -> id
// users:chats:{userId} -> Set of chat IDs
