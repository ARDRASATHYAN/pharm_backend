const express = require('express');
const { createDrugSchedule, getAllDrugSchedules, getDrugScheduleById, updateDrugSchedule, deleteDrugSchedule } = require('../controllers/drugScheduleController');
const drugscheduleRouter = express.Router();


// Define your Drug Schedule routes here
drugscheduleRouter.post('/', createDrugSchedule);
drugscheduleRouter.get('/', getAllDrugSchedules);
drugscheduleRouter.get('/:id', getDrugScheduleById);
drugscheduleRouter.put('/:id', updateDrugSchedule);
drugscheduleRouter.delete('/:id', deleteDrugSchedule); 

module.exports = drugscheduleRouter;