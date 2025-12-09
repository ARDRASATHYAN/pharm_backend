const db = require('../models');
const { addStock } = require('../utils/StockService');
const { ExcessStock, StoreStock } = db;

exports.createExcessItem = async (req, res) => {
    const t = await db.sequelize.transaction();   

    const createdRows = [];

    try {
        const { store_id, created_by, entry_date, items = [] } = req.body;

        if (!store_id) {
            await t.rollback();
            return res.status(400).json({ message: "store_id required" });
        }

        if (!created_by) {
            await t.rollback();
            return res.status(400).json({ message: "userid required" });
        }

        if (!items.length) {
            await t.rollback();
            return res.status(400).json({ message: "at least 1 item required" });
        }

        for (const row of items) {
            const { item_id, batch_no, qty, reason } = row;

            if (!item_id || !qty) {
                await t.rollback();
                return res.status(400).json({ message: "item and qty required" });
            }

            const qtyNum = Number(qty);

            if (isNaN(qtyNum) || qtyNum <= 0) {
                await t.rollback();
                return res.status(400).json({ message: "qty must be +ve number" });
            }

            const existStockItem = await StoreStock.findOne({
                where: { item_id, batch_no, store_id },   // ✅ FIXED
                transaction: t,
            });

            if (!existStockItem) {
                await t.rollback();
                return res.status(400).json({ message: "there is no item in stock" });
            }

            const newItem = await ExcessStock.create({
                store_id,
                entry_date,
                created_by,
                item_id,
                qty: qtyNum,
                batch_no,
                reason
            }, { transaction: t });

            createdRows.push(newItem);

            await addStock({
                store_id,
                item_id,
                batch_no,
                qty: qtyNum,
                transaction: t
            });
        }

        await t.commit();

        return res.status(201).json({
            message: "excess stock recorded and stock increased successfully",
            data: createdRows,
        });

    } catch (err) {
        await t.rollback();
        return res.status(500).json({ message: "internal server error", error: err.message });
    }
};


exports.getAllExcessItem=async (req,res)=>{
   try {
           const where = {}
           const { search = "", page = 1, perpage = 10 } = req.query;
   
           const limit = parseInt(perpage);
           if (search) {
               where[Op.or] = [
                   { batch_no: { [Op.like]: `%${search}%` } }
               ]
           }
           const offset = (page - 1) * limit;
           const { rows: excess_item, count } = await ExcessStock.findAndCountAll({
               where,
               offset,
               limit,
               order: [['excess_id', 'ASC']],
               include: [
                   { model: db.Store, as: "store", attributes: ["store_name"] },
                   { model: db.Item, as: "item", attributes: ["name"] },
                   { model: db.User, as: "user", attributes: ["username"] },
               ],
           });
   
           const totalPages = Math.ceil(count / limit);
   
           res.json({
               total: count,
               totalPages,
               page: parseInt(page),
               perPage: limit,
               excess_item
           });
   
   
       }
    catch(err){
        return res.status(500).json({
            message:"internal server error"
        })
    }
}
