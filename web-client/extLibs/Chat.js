//
// Código generado desde Chat.ice
// Ice version 3.7.10
//

(function(module, require, exports)
{
    const Ice = require("ice").Ice;
    const _ModuleRegistry = Ice._ModuleRegistry;
    const Slice = Ice.Slice;

    let Chat = _ModuleRegistry.module("Chat");

    // MessageDTO struct
    Chat.MessageDTO = class {
        constructor(from = "", to = "", group = "", message = "", timestamp = "", messageType = "") {
            this.from = from;
            this.to = to;
            this.group = group;
            this.message = message;
            this.timestamp = timestamp;
            this.messageType = messageType;
        }

        _write(ostr) {
            ostr.writeString(this.from);
            ostr.writeString(this.to);
            ostr.writeString(this.group);
            ostr.writeString(this.message);
            ostr.writeString(this.timestamp);
            ostr.writeString(this.messageType);
        }

        _read(istr) {
            this.from = istr.readString();
            this.to = istr.readString();
            this.group = istr.readString();
            this.message = istr.readString();
            this.timestamp = istr.readString();
            this.messageType = istr.readString();
        }

        static get minWireSize() {
            return 6;
        }
    };

    Slice.defineStruct(Chat.MessageDTO, true, false);

    // UserDTO struct
    Chat.UserDTO = class {
        constructor(username = "", online = false) {
            this.username = username;
            this.online = online;
        }

        _write(ostr) {
            ostr.writeString(this.username);
            ostr.writeBool(this.online);
        }

        _read(istr) {
            this.username = istr.readString();
            this.online = istr.readBool();
        }

        static get minWireSize() {
            return 2;
        }
    };

    Slice.defineStruct(Chat.UserDTO, true, false);

    // GroupDTO struct
    Chat.GroupDTO = class {
        constructor(name = "", description = "") {
            this.name = name;
            this.description = description;
        }

        _write(ostr) {
            ostr.writeString(this.name);
            ostr.writeString(this.description);
        }

        _read(istr) {
            this.name = istr.readString();
            this.description = istr.readString();
        }

        static get minWireSize() {
            return 2;
        }
    };

    Slice.defineStruct(Chat.GroupDTO, true, false);

    // Sequences
    Slice.defineSequence(Chat, "MessageListHelper", "Chat.MessageDTO", true);
    Slice.defineSequence(Chat, "UserListHelper", "Chat.UserDTO", true);
    Slice.defineSequence(Chat, "GroupListHelper", "Chat.GroupDTO", true);
    Slice.defineSequence(Chat, "AudioBytesHelper", "Ice.ByteHelper", true);

    // ChatService interface
    const iceC_Chat_ChatService_ids = [
        "::Chat::ChatService",
        "::Ice::Object"
    ];

    Chat.ChatService = class extends Ice.Object {
    };

    Chat.ChatServicePrx = class extends Ice.ObjectPrx {
    };

    Slice.defineOperations(Chat.ChatService, Chat.ChatServicePrx, iceC_Chat_ChatService_ids, 0, {
        "createGroup": [, , , , [1], [[7], [7]], , , , ],
        "joinGroup": [, , , , [1], [[7], [7]], , , , ],
        "getGroups": [, , , , ["Chat.GroupListHelper"], , , , , ],
        "sendMessage": [, , , , [1], [[7], [7], [7]], , , , ],
        "sendGroupMessage": [, , , , [1], [[7], [7], [7]], , , , ],
        "getHistory": [, , , , ["Chat.MessageListHelper"], , , , , ],
        "getConnectedUsers": [, , , , ["Chat.UserListHelper"], , , , , ],
        "registerUser": [, , , , [1], [[7]], , , , ]
    });

    // Observer interface
    const iceC_Chat_Observer_ids = [
        "::Chat::Observer",
        "::Ice::Object"
    ];

    Chat.Observer = class extends Ice.Object {
    };

    Chat.ObserverPrx = class extends Ice.ObjectPrx {
    };

    Slice.defineOperations(Chat.Observer, Chat.ObserverPrx, iceC_Chat_Observer_ids, 0, {
        "notifyNewMessage": [, , , , , [["Chat.MessageDTO"]], , , , ],
        "notifyUserConnected": [, , , , , [[7]], , , , ],
        "notifyUserDisconnected": [, , , , , [[7]], , , , ],
        "notifyGroupCreated": [, , , , , [["Chat.GroupDTO"]], , , , ]
    });

    // Subject interface
    const iceC_Chat_Subject_ids = [
        "::Chat::Subject",
        "::Ice::Object"
    ];

    Chat.Subject = class extends Ice.Object {
    };

    Chat.SubjectPrx = class extends Ice.ObjectPrx {
    };

    Slice.defineOperations(Chat.Subject, Chat.SubjectPrx, iceC_Chat_Subject_ids, 0, {
        "attachObserver": [, , , , , [["Chat.ObserverPrx"]], , , , ],
        "detachObserver": [, , , , , [["Chat.ObserverPrx"]], , , , ]
    });

    exports.Chat = Chat;
}
(typeof(global) !== "undefined" && typeof(global.process) !== "undefined" ? module : undefined,
 typeof(global) !== "undefined" && typeof(global.process) !== "undefined" ? require :
 (typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope) ? self.Ice._require : window.Ice._require,
 typeof(global) !== "undefined" && typeof(global.process) !== "undefined" ? exports :
 (typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope) ? self : window));
