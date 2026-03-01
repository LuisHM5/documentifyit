"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionResourceType = exports.PermissionLevel = void 0;
var PermissionLevel;
(function (PermissionLevel) {
    PermissionLevel["Owner"] = "owner";
    PermissionLevel["Admin"] = "admin";
    PermissionLevel["Editor"] = "editor";
    PermissionLevel["Reviewer"] = "reviewer";
    PermissionLevel["Viewer"] = "viewer";
})(PermissionLevel || (exports.PermissionLevel = PermissionLevel = {}));
var PermissionResourceType;
(function (PermissionResourceType) {
    PermissionResourceType["Document"] = "document";
    PermissionResourceType["Folder"] = "folder";
})(PermissionResourceType || (exports.PermissionResourceType = PermissionResourceType = {}));
//# sourceMappingURL=permission.js.map