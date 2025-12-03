const { Op } = require("sequelize");
const db = require('../models'); 
const { DrugSchedule } = db;

exports.createDrugSchedule = async (req, res) => {
  try {
    const {schedule_code ,schedule_name ,description ,requires_prescription ,restricted_sale  } = req.body;
    if(!schedule_code || !schedule_name) {
      return res.status(400).json({ message: 'schedule_code and schedule_name are required' });
    }
    const existingSchedule = await DrugSchedule.findOne({ where: { schedule_code } });
    if (existingSchedule) {
      return res.status(409).json({ message: 'Drug Schedule with this code already exists' });
    }   

    const newSchedule = await DrugSchedule.create({
        schedule_code,  
        schedule_name,
        description,
        requires_prescription: requires_prescription ?? false,
        restricted_sale: restricted_sale ?? false,
    });
    res.status(201).json({ message: 'Drug Schedule created successfully', data: newSchedule });
  } catch (error) {
    console.error('Error creating Drug Schedule:', error);
    res.status(500).json({ message: 'Internal server error' });
  } 
};

// get all drug schedules
exports.getAllDrugSchedules = async (req, res) => {
  try {
    const { search = "", page = 1, perPage = 10 } = req.query;

    const where = {};

    // Optional search
    if (search) {
      where.schedule_code = { [Op.like]: `%${search}%` };
    }

    const limit = parseInt(perPage);
    const offset = (page - 1) * limit;

    const { rows: data, count: total } = await DrugSchedule.findAndCountAll({
      where,
      offset,
      limit,
      order: [["schedule_id", "ASC"]],
    });

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      total,
      totalPages,
      page: parseInt(page),
      perPage: limit,
      data,
    });
  } catch (error) {
    console.error("Error fetching Drug Schedules:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// get drug schedule by id
exports.getDrugScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await DrugSchedule.findByPk(id);
    if (!schedule) {
        return res.status(404).json({ message: 'Drug Schedule not found' });
    }
    res.status(200).json({ data: schedule });
    } catch (error) {
    console.error('Error fetching Drug Schedule by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
    }
};

// update drug schedule
exports.updateDrugSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const {schedule_code ,schedule_name ,description ,requires_prescription ,restricted_sale  } = req.body;
    const schedule = await DrugSchedule.findByPk(id);
    if (!schedule) {
        return res.status(404).json({ message: 'Drug Schedule not found' });
    }
    if (schedule_code) {
      const existingSchedule = await DrugSchedule.findOne({
        where: {
          schedule_code,
          schedule_id: { [Op.ne]: id },
        },
      });

      if (existingSchedule) {
        return res
          .status(409)
          .json({ message: "Drug Schedule with this code already exists" });
      }
    }
    await schedule.update({
        schedule_code: schedule_code ?? schedule.schedule_code,
        schedule_name: schedule_name ?? schedule.schedule_name,
        description: description ?? schedule.description,
        requires_prescription: requires_prescription ?? schedule.requires_prescription,
        restricted_sale: restricted_sale ?? schedule.restricted_sale,
    });
    res.status(200).json({ message: 'Drug Schedule updated successfully', data: schedule });
    }
    catch (error) {
    console.error('Error updating Drug Schedule:', error);
    res.status(500).json({ message: 'Internal server error' });
    }
};
// delete drug schedule
exports.deleteDrugSchedule = async (req, res) => {
  try { 
    const { id } = req.params;
    const schedule = await DrugSchedule.findByPk(id);
    if (!schedule) {
        return res.status(404).json({ message: 'Drug Schedule not found' });
    }
    await schedule.destroy();
    res.status(200).json({ message: 'Drug Schedule deleted successfully' });
    }
    catch (error) {
    console.error('Error deleting Drug Schedule:', error);
    res.status(500).json({ message: 'Internal server error' });
    }
};  

