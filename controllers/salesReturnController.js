const db = require('../models');
const { addStock } = require('../utils/StockService');
const { SalesInvoices, SalesItems, SalesReturn, SaleReturnItem, Item } = db;

exports.createSalesReturn = async (req, res) => {
  const t = await db.sequelize.transaction();

  try {
    const { store_id, sale_id, return_date, reason, items } = req.body;
    const userId = req.user?.user_id || null;

    // 🔴 Validation
    if (!store_id || !sale_id || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'store_id, sale_id and items are required',
      });
    }

    // 🔍 Check sale exists
    const sale = await SalesInvoices.findByPk(sale_id);
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale invoice not found',
      });
    }

    let totalAmount = 0;
    let totalGst = 0;

    // 🧾 Create SALES RETURN HEADER (temporary)
    const salesReturn = await SalesReturn.create({
      store_id,
      sale_id,
      return_date,
      reason,
      total_amount: 0,
      total_gst: 0,
      net_amount: 0,
      created_by: userId,
    }, { transaction: t });

    // 📦 Process items
    for (const item of items) {
      const {
        item_id,
        batch_no,
        qty,
        rate,
        gst_percent = 0,
      } = item;

      const qtyNum = Number(qty);
      const rateNum = Number(rate);

      if (!item_id || !qtyNum || !rateNum) {
        throw new Error('Invalid return item data');
      }

      // 🔍 Validate item exists
      const itemMaster = await Item.findByPk(item_id);
      if (!itemMaster) {
        throw new Error(`Invalid item_id: ${item_id}`);
      }

      // 🔍 Check item belongs to the sale
      const saleItem = await SalesItems.findOne({
        where: { sale_id, item_id, batch_no },
      });

      if (!saleItem) {
        throw new Error('Item does not belong to this sale');
      }

      // ❌ Prevent over-return
      if (qtyNum > Number(saleItem.qty)) {
        throw new Error('Return quantity exceeds sold quantity');
      }

      // 💰 Calculations
      const amount = qtyNum * rateNum;
      const gstAmount = (amount * Number(gst_percent)) / 100;

      totalAmount += amount;
      totalGst += gstAmount;

      // 🧾 Create RETURN ITEM
      await SaleReturnItem.create({
        return_id: salesReturn.return_id,
        item_id,
        batch_no,
        qty: qtyNum,
        rate: rateNum,
        amount,
      }, { transaction: t });

      // 📈 Add stock back
      await addStock({
        store_id,
        item_id,
        batch_no,
        qty: qtyNum,
        transaction: t,
      });
    }

    // 🧮 Update totals
    await salesReturn.update({
      total_taxable: totalAmount,
      total_gst: totalGst,
      total_amount: totalAmount + totalGst,
    }, { transaction: t });

    await t.commit();

    res.status(201).json({
      success: true,
      message: 'Sales return created successfully',
      data: salesReturn,
    });

  } catch (error) {
    await t.rollback();
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to create sales return',
      error: error.message,
    });
  }
};
