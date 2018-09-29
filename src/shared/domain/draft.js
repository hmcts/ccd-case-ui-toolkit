"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Draft = /** @class */ (function () {
    function Draft() {
    }
    Draft.stripDraftId = function (draftId) {
        return draftId.slice(5);
    };
    Draft.isDraft = function (id) {
        return String(id).startsWith(this.DRAFT);
    };
    Draft.DRAFT = 'DRAFT';
    return Draft;
}());
exports.Draft = Draft;
//# sourceMappingURL=draft.js.map