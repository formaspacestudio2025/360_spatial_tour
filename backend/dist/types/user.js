"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_HIERARCHY = exports.Permission = void 0;
exports.hasRole = hasRole;
// Enterprise Permission Constants
var Permission;
(function (Permission) {
    Permission["VIEW_PROJECT"] = "view_project";
    Permission["EDIT_PROJECT"] = "edit_project";
    Permission["DELETE_PROJECT"] = "delete_project";
    Permission["MANAGE_MEMBERS"] = "manage_members";
    Permission["EDIT_GRAPH"] = "edit_graph";
    Permission["UPLOAD_MEDIA"] = "upload_media";
    Permission["CREATE_ISSUES"] = "create_issues";
    Permission["RESOLVE_ISSUES"] = "resolve_issues";
    Permission["COMMENT"] = "comment";
    Permission["EXPORT_DATA"] = "export_data";
})(Permission || (exports.Permission = Permission = {}));
exports.ROLE_HIERARCHY = {
    client_guest: 1,
    viewer: 2,
    contractor: 3,
    editor: 4,
    manager: 5,
    admin: 6,
};
function hasRole(userRole, requiredRole) {
    return exports.ROLE_HIERARCHY[userRole] >= exports.ROLE_HIERARCHY[requiredRole];
}
//# sourceMappingURL=user.js.map