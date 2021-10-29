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

module.exports = router;
