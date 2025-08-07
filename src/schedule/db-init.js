"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBInitTask = void 0;
const core_1 = require("@midwayjs/core");
const fs_1 = require("fs");
const path_1 = require("path");
let DBInitTask = class DBInitTask {
    async exec() {
        const sql = (0, fs_1.readFileSync)((0, path_1.join)(__dirname, '../../database/init.sql'), 'utf8');
        await this.sequelize.query(sql);
    }
};
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", Object)
], DBInitTask.prototype, "sequelize", void 0);
DBInitTask = __decorate([
    (0, core_1.Provide)(),
    (0, core_1.Schedule)({
        cron: '0 0 0 * * *',
        type: 'worker'
    })
], DBInitTask);
exports.DBInitTask = DBInitTask;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGItaW5pdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRiLWluaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEseUNBQTJEO0FBQzNELDJCQUFrQztBQUNsQywrQkFBNEI7QUFPckIsSUFBTSxVQUFVLEdBQWhCLE1BQU0sVUFBVTtJQUlyQixLQUFLLENBQUMsSUFBSTtRQUNSLE1BQU0sR0FBRyxHQUFHLElBQUEsaUJBQVksRUFBQyxJQUFBLFdBQUksRUFBQyxTQUFTLEVBQUUseUJBQXlCLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUM3RSxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7Q0FDRixDQUFBO0FBUEM7SUFBQyxJQUFBLGFBQU0sR0FBRTs7NkNBQ007QUFGSixVQUFVO0lBTHRCLElBQUEsY0FBTyxHQUFFO0lBQ1QsSUFBQSxlQUFRLEVBQUM7UUFDUixJQUFJLEVBQUUsYUFBYTtRQUNuQixJQUFJLEVBQUUsUUFBUTtLQUNmLENBQUM7R0FDVyxVQUFVLENBUXRCO0FBUlksZ0NBQVUifQ==