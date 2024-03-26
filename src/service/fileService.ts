import fs from "fs"
import path from "path";

const staticFiles = "files"
const contactAvatarFolder = path.join(staticFiles, 'contacts')

function removeHeader(base64:string){
    const base64Data = base64.replace(/^data:image\/png;base64,/, '');
    return base64Data
}

export function contactAvatarFileName(contactId:any){
    return `contact_${contactId}_avatar.png`
}

export async function saveContactAvatar(contactId:any, avatarBase64:string){
    const fileName = contactAvatarFileName(contactId)
    if (!fs.existsSync(staticFiles)) {
        fs.mkdirSync(staticFiles);
    }
    if (!fs.existsSync(contactAvatarFolder)) {
        fs.mkdirSync(contactAvatarFolder);
    }
    fs.writeFileSync(path.join(contactAvatarFolder, fileName), removeHeader(avatarBase64), 'base64');
}

export async function getContactAvatar(contactId: any){
    const fileName = contactAvatarFileName(contactId)
    const base64 = fs.readFileSync(path.join(contactAvatarFolder, fileName), { encoding: 'base64' });
    return base64
}