import { Comment } from "./comment";
import { UpdateFile } from "./update";
import AppUser from "./user";

export interface UpdateResponse {
    id: string;
    description: string;
    flow_id: string;
    users: AppUser;
    files: UpdateFile[];
    created_at: string;
    updated_at: string;
    comments?: Comment[];
}
