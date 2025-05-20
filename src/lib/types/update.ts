import AppUser from "./user";

export interface UpdateFile {
    type: string;
    url: string;
    created_at: string;
}


export interface Comment {
    id: string;
    user: AppUser;
    content: string;
    createdAt?: string;
}

export interface Update {
    id: string;
    description: string;
    flow_id: string;
    user_id: string;
    files: UpdateFile[];
    comments?: Comment[]; 
    created_at: string;
    updated_at: string;
}
