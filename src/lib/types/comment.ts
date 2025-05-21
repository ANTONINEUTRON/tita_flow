import AppUser from "./user";

export interface Comment {
    id: string;
    user_id: string;
    update_id: string;
    content: string;
    created_at?: string;
    updated_at?: string;
}



export interface CommentResponse {
    id: string;
    users: AppUser;
    update_id: string;
    content: string;
    created_at?: string;
    updated_at?: string;
}
