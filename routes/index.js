const express = require("express");
const router = express.Router();

const myDb = require("../db/mySqliteDB.js");

/* GET home page. */
router.get("/", async function (req, res, next) {
  res.redirect("/cars");
});

// http://localhost:3000/cars?pageSize=24&page=3&q=John
// display cars -- all cars or fit certain search queries
router.get("/cars", async (req, res, next) => {
  const startYear = req.query.startYear || "";
  const model = req.query.model || "";
  const make = req.query.make || "";
  const page = +req.query.page || 1;
  const pageSize = +req.query.pageSize || 24;
  const msg = req.query.msg || null;
  try {
    let total = await myDb.getCarCount(startYear, model, make);
    let cars = await myDb.getCars(startYear, model, make, page, pageSize);
    res.render("./pages/index", {
      cars,
      startYear,
      model,
      make,
      msg,
      currentPage: page,
      lastPage: Math.ceil(total / pageSize),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/bookings", async (req, res, next) => {
  const startDate = req.query.startDate || "";
  const endDate = req.query.endDate || "";
  const model = req.query.model || "";
  const make = req.query.make || "";
  const page = +req.query.page || 1;
  const pageSize = +req.query.pageSize || 24;
  try {
    let total = await myDb.getBookingCount(startDate, endDate, model, make);
    let bookings = await myDb.getBookings(
      startDate,
      endDate,
      model,
      make,
      page,
      pageSize
    );
    res.render("./pages/bookingIndex", {
      bookings,
      startDate,
      endDate,
      model,
      make,
      currentPage: page,
      lastPage: Math.ceil(total / pageSize),
    });
  } catch (err) {
    next(err);
  }
});

// booking details
router.get("/bookings/:bookingID", async (req, res, next) => {
  const bookingID = req.params.bookingID;
  try {
    let booking = await myDb.getBookingByID(bookingID);

    console.log("get booking by id", {
      booking,
    });

    res.render("./components/bookingDetail.ejs", {
      booking,
    });
  } catch (err) {
    next(err);
  }
});

// branches router
router.get("/branches", async (req, res, next) => {
  const topK = req.query.topK || "";
  const page = +req.query.page || 1;
  const pageSize = +req.query.pageSize || 24;
  const msg = req.query.msg || null;
  console.log("get branches by topK", {
    topK,
  });
  try {
    let total = await myDb.getBranchCount(topK);
    let branches = await myDb.getBranches(topK);
    res.render("./pages/branchesIndex", {
      branches,
      topK,
      msg,
      currentPage: page,
      lastPage: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// http://localhost:3000/customers?pageSize=24&page=3&q=John
// display customers -- all customers or fit certain search queries
router.get("/customers", async (req, res, next) => {
  const page = +req.query.page || 1;
  const pageSize = +req.query.pageSize || 200;
  const times = req.query.times || "";
  try {
    let total = await myDb.getCustomerCount(times);
    let customers = await myDb.getCustomers(times, page, pageSize);
    res.render("./pages/customersIndex", {
      customers,
      times,
      currentPage: page,
      lastPage: Math.ceil(total / pageSize),
    });
  } catch (err) {
    next(err);
  }
});

// get customer details
router.get("/customers/:customerID", async (req, res, next) => {
  const customerID = req.params.customerID;
  try {
    let customer = await myDb.getCustomerByID(customerID);
    let bookings = await myDb.getCustomerBookingHistory(customerID);
    let membershipStatus = await myDb.getCustomerMembershipStatus(customerID);

    console.log("get customer by id", {
      customer,
    });

    res.render("./components/customerDetail.ejs", {
      customer,
      bookings,
      membershipStatus,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/createBranch", async (req, res, next) => {
  const branch = req.body;

  try {
    const newBranch = await myDb.createBranch(branch);

    console.log("Created", newBranch);
    res.redirect("/branches/?msg=created");
  } catch (err) {
    console.log("Error creating branch", err);
    next(err);
  }
});

router.post("/createCar", async (req, res, next) => {
  const car = req.body;

  try {
    const newCar = await myDb.createCar(car);

    console.log("Created", newCar);
    res.redirect("/cars/?msg=created");
  } catch (err) {
    console.log("Error creating car", err);
    next(err);
  }
});

router.get("/cars/:carID/edit", async (req, res, next) => {
  const carID = req.params.carID;

  const msg = req.query.msg || null;
  try {
    let car = await myDb.getCarByID(carID);

    console.log("edit car", {
      car,
      msg,
    });

    res.render("./pages/editCar", {
      car,
      msg,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/cars/:carID/edit", async (req, res, next) => {
  const carID = req.params.carID;
  const car = req.body;

  try {
    let updatedCar = await myDb.updateCarByID(carID, car);
    console.log("update", updatedCar);

    if (updatedCar && updatedCar.changes === 1) {
      res.redirect("/cars/?msg=Updated");
    } else {
      res.redirect("/cars/?msg=Error Updating");
    }
  } catch (err) {
    next(err);
  }
});

router.get("/cars/:carID/delete", async (req, res, next) => {
  const carID = req.params.carID;

  try {
    let deletedCar = await myDb.deleteCarByID(carID);
    console.log("delete", deletedCar);

    if (deletedCar && deletedCar.changes === 1) {
      res.redirect("/cars/?msg=Deleted");
    } else {
      res.redirect("/cars/?msg=Error Deleting");
    }
  } catch (err) {
    next(err);
  }
});

router.get("/branches/:rentalBranchID/delete", async (req, res, next) => {
  const rentalBranchID = req.params.rentalBranchID;

  try {
    let deletedBranch = await myDb.deleteBranchByID(rentalBranchID);
    console.log("delete", deletedBranch);

    if (deletedBranch && deletedBranch.changes === 1) {
      res.redirect("/branches/?msg=Deleted");
    } else {
      res.redirect("/branches/?msg=Error Deleting");
    }
  } catch (err) {
    next(err);
  }
});

router.get("/branches/:rentalBranchID/edit", async (req, res, next) => {
  const rentalBranchID = req.params.rentalBranchID;

  const msg = req.query.msg || null;
  try {
    let branch = await myDb.getBranchByID(rentalBranchID);

    console.log("edit branch", {
      branch,
      msg,
    });

    res.render("./pages/editBranch", {
      branch,
      msg,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/branches/:rentalBranchID/edit", async (req, res, next) => {
  const rentalBranchID = req.params.rentalBranchID;
  const branch = req.body;

  try {
    let updatedBranch = await myDb.updateBranchByID(rentalBranchID, branch);
    console.log("update", updatedBranch);

    if (updatedBranch && updatedBranch.changes === 1) {
      res.redirect("/branches/?msg=Updated");
    } else {
      res.redirect("/branches/?msg=Error Updating");
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
