const billService = require('../services/bill/billService');

class BillController {
  // Get bill providers
  async getProviders(req, res, next) {
    try {
      const providers = billService.getProviders();
      res.status(200).json({
        success: true,
        data: providers
      });
    } catch (error) {
      next(error);
    }
  }

  // Pay electricity bill
  async payElectricity(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { provider, customerId, amount, customerName } = req.body;

      if (!provider || !customerId || !amount) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Provider, customer ID, and amount are required'
        });
      }

      const result = await billService.payElectricity(
        userId,
        provider,
        customerId,
        amount,
        customerName
      );

      res.status(200).json({
        success: true,
        message: 'Electricity bill paid successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Pay water bill
  async payWater(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { provider, customerId, amount, customerName } = req.body;

      if (!provider || !customerId || !amount) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Provider, customer ID, and amount are required'
        });
      }

      const result = await billService.payWater(
        userId,
        provider,
        customerId,
        amount,
        customerName
      );

      res.status(200).json({
        success: true,
        message: 'Water bill paid successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Pay internet bill
  async payInternet(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { provider, customerId, amount, customerName } = req.body;

      if (!provider || !customerId || !amount) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Provider, customer ID, and amount are required'
        });
      }

      const result = await billService.payInternet(
        userId,
        provider,
        customerId,
        amount,
        customerName
      );

      res.status(200).json({
        success: true,
        message: 'Internet bill paid successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Pay TV bill
  async payTV(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { provider, customerId, amount, customerName } = req.body;

      if (!provider || !customerId || !amount) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Provider, customer ID, and amount are required'
        });
      }

      const result = await billService.payTV(
        userId,
        provider,
        customerId,
        amount,
        customerName
      );

      res.status(200).json({
        success: true,
        message: 'TV bill paid successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Generic bill payment
  async payBill(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { category, provider, customerId, amount, customerName } = req.body;

      if (!category || !provider || !customerId || !amount) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Category, provider, customer ID, and amount are required'
        });
      }

      const result = await billService.payBill(
        userId,
        category,
        provider,
        customerId,
        amount,
        customerName
      );

      res.status(200).json({
        success: true,
        message: 'Bill paid successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Get bill by ID
  async getBill(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { billId } = req.params;

      const bill = await billService.getBill(billId, userId);

      res.status(200).json({
        success: true,
        data: bill
      });
    } catch (error) {
      next(error);
    }
  }

  // Get bill history
  async getBillHistory(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;

      const history = await billService.getBillHistory(userId, limit, offset);

      res.status(200).json({
        success: true,
        data: {
          history,
          count: history.length,
          limit,
          offset
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get bills by category
  async getBillsByCategory(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { category } = req.params;
      const limit = parseInt(req.query.limit) || 20;

      const bills = await billService.getBillsByCategory(userId, category, limit);

      res.status(200).json({
        success: true,
        data: {
          bills,
          count: bills.length,
          category,
          limit
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get bill stats
  async getBillStats(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;

      const stats = await billService.getBillStats(userId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  // Verify customer
  async verifyCustomer(req, res, next) {
    try {
      const { category, provider, customerId } = req.body;

      if (!category || !provider || !customerId) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Category, provider, and customer ID are required'
        });
      }

      const result = await billService.verifyCustomer(category, provider, customerId);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BillController();
