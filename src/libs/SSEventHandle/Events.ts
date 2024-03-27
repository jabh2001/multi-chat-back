import { AgentType, ContactType, ConversationType, InboxType, LabelType, TeamType } from "../../types"

export type MultiChatEventMap = {
    "insert-agent":AgentType,
    "update-agent":Partial<AgentType>,
    "delete-agent":AgentType["id"][],
    "insert-contact":ContactType,
    "update-contact":Partial<ContactType>,
    "delete-contact":ContactType["id"][],
    "insert-team":TeamType,
    "update-team":Partial<TeamType>,
    "delete-team":TeamType["id"][],
    "insert-label":LabelType,
    "update-label":Partial<LabelType>,
    "delete-label":LabelType["id"][],
    "insert-inbox":InboxType,
    "update-inbox":Partial<InboxType>,
    "delete-inbox":InboxType["id"][],
    "insert-conversation":ConversationType,
    "update-conversation":Partial<ConversationType>,
    "delete-conversation":ConversationType["id"][],
    "update-conversation-last-message":{ conversationId:ConversationType["id"], lastMessage:string, lastMessageDate:string},
    "qr-update":{name:string, user:any | false, qr:string},
    "close":undefined,
} & { 
    [key in `qr-${number}` | `qr-update-${number}`]: {name:string, user:any | false, qr:string};
}& { 
    [key in `qr-${string}-${boolean}`]: {};
};

export type MultiChatEventName=keyof MultiChatEventMap