import fs from "fs"
import path from "path";

const staticFiles = "files"
const contactAvatarFolder = path.join(staticFiles, 'contacts')
const templateFolder = path.join(staticFiles, 'template')

function removeHeader(base64:string){
    const base64Data = base64.replace(/^data:image\/png;base64,/, '');
    return base64Data
}

export function contactAvatarFileName(contactId:any){
    return `contact_${contactId}_avatar.png`
}

export async function saveContactAvatar(contactId:any, avatarBase64?:string){
    const fileName = contactAvatarFileName(contactId)
    if (!fs.existsSync(staticFiles)) {
        fs.mkdirSync(staticFiles);
    }
    if (!fs.existsSync(contactAvatarFolder)) {
        fs.mkdirSync(contactAvatarFolder);
    }
    if(avatarBase64){
        fs.writeFileSync(path.join(contactAvatarFolder, fileName), removeHeader(avatarBase64), 'base64');
    } else {
        fs.writeFileSync(path.join(contactAvatarFolder, fileName), await getBlankAvatar(), 'base64');
    }
}

export async function getBlankAvatar(){
    if (!fs.existsSync(staticFiles)) {
        fs.mkdirSync(staticFiles);
    }
    if (!fs.existsSync(templateFolder)) {
        fs.mkdirSync(templateFolder);
    }
    const blank = fs.readFileSync(path.join(templateFolder, "profile.png"), { encoding: 'base64' })
    return blank
}

export async function getContactAvatar(contactId: any){
    const fileName = contactAvatarFileName(contactId)
    if(!fs.existsSync(path.join(contactAvatarFolder, fileName))){
        return await getBlankAvatar()
    }
    const base64 = fs.readFileSync(path.join(contactAvatarFolder, fileName), { encoding: 'base64' });
    return base64
}