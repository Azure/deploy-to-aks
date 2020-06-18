"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const core = require("@actions/core");
const set_context_1 = require("./set-context");
const create_secret_1 = require("./create-secret");
const deploy_1 = require("./deploy");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        yield set_context_1.run_set_context().catch(core.setFailed);
        let secret_name = core.getInput('secret-name');
        if (secret_name) {
            yield create_secret_1.run_create_secret().catch(core.setFailed);
        }
        yield deploy_1.run_deploy().catch(core.setFailed);
    });
}
exports.run = run;
run().catch(core.setFailed);
