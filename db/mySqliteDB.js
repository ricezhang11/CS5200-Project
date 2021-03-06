// this is the layer where we connect with db
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

async function getBranches(topK) {
  console.log("get Branches");
  const db = await open({
    filename: "./db/Car.db",
    driver: sqlite3.Database,
  });

  let stmt = "";

  if (topK === "") {
    stmt = await db.prepare(
      "SELECT *, sum(Booking.totalCharge) AS totalTransaction FROM Rental_Branch LEFT JOIN Booking ON Booking.pickupRentalBranchID = Rental_Branch.rentalBranchID GROUP BY Rental_Branch.rentalBranchID ORDER BY Rental_Branch.branchName"
    );
  } else {
    // [TODO] select top K
    stmt = await db.prepare(
      "SELECT *, sum(Booking.totalCharge) AS totalTransaction FROM Booking, Rental_Branch WHERE Booking.pickupRentalBranchID = Rental_Branch.rentalBranchID GROUP BY Rental_Branch.rentalBranchID ORDER BY totalTransaction DESC LIMIT $topK",
      {
        $topK: parseInt(topK),
      }
    );
  }

  try {
    let bracnhes = await stmt.all();
    console.log(bracnhes);
    return bracnhes;
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function getCustomers(times, page, pageSize) {
  console.log("get customers");
  const db = await open({
    filename: "./db/Car.db",
    driver: sqlite3.Database,
  });

  let stmt = "";

  if (times === "") {
    stmt = await db.prepare(
      "SELECT * FROM Customer LIMIT $pageSize OFFSET $offset",
      {
        $pageSize: pageSize,
        $offset: (page - 1) * pageSize,
      }
    );
  } else {
    stmt = await db.prepare(
      "SELECT * FROM Customer, Booking WHERE Customer.customerID = Booking.customerID GROUP BY Customer.customerID HAVING count(*) > $times LIMIT $pageSize OFFSET $offset",
      {
        $times: parseInt(times),
        $pageSize: pageSize,
        $offset: (page - 1) * pageSize,
      }
    );
  }

  try {
    let customers = await stmt.all();
    console.log(customers);
    return customers;
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function getCars(startYear, model, make, page, pageSize) {
  console.log("get cars", startYear, model, make);

  const db = await open({
    filename: "./db/Car.db",
    driver: sqlite3.Database,
  });

  let stmt = "";

  if (startYear === "" && model === "" && make === "") {
    stmt = await db.prepare(
      "SELECT * FROM Car, Car_Model, Car_Make, Car_Category WHERE Car.modelID = Car_Model.modelID AND Car.makeID = Car_Make.makeID AND Car.carCategoryID = Car_Category.categoryID LIMIT $pageSize OFFSET $offset",
      {
        $pageSize: pageSize,
        $offset: (page - 1) * pageSize,
      }
    );
  } else if (startYear !== "") {
    stmt = await db.prepare(
      "SELECT * FROM Car, Car_Model, Car_Make, Car_Category WHERE Car.modelID = Car_Model.modelID AND Car.makeID = Car_Make.makeID AND Car.carCategoryID = Car_Category.categoryID AND startYear >= $startYear LIMIT $pageSize OFFSET $offset",
      {
        $startYear: startYear,
        $pageSize: pageSize,
        $offset: (page - 1) * pageSize,
      }
    );
  } else if (model !== "" && make !== "") {
    stmt = await db.prepare(
      "SELECT * FROM Car, Car_Model, Car_Make, Car_Category WHERE Car.modelID = Car_Model.modelID AND Car.makeID = Car_Make.makeID AND Car.carCategoryID = Car_Category.categoryID AND make = $make AND model = $model LIMIT $pageSize OFFSET $offset",
      {
        $make: make,
        $model: model,
        $pageSize: pageSize,
        $offset: (page - 1) * pageSize,
      }
    );
  } else if (model === "") {
    stmt = await db.prepare(
      "SELECT * FROM Car, Car_Model, Car_Make, Car_Category WHERE Car.modelID = Car_Model.modelID AND Car.makeID = Car_Make.makeID AND Car.carCategoryID = Car_Category.categoryID AND make = $make LIMIT $pageSize OFFSET $offset",
      {
        $make: make,
        $pageSize: pageSize,
        $offset: (page - 1) * pageSize,
      }
    );
  } else {
    stmt = await db.prepare(
      "SELECT * FROM Car, Car_Model, Car_Make, Car_Category WHERE Car.modelID = Car_Model.modelID AND Car.makeID = Car_Make.makeID AND Car.carCategoryID = Car_Category.categoryID AND model = $model LIMIT $pageSize OFFSET $offset",
      {
        $model: model,
        $pageSize: pageSize,
        $offset: (page - 1) * pageSize,
      }
    );
  }

  try {
    let cars = await stmt.all();
    console.log(cars);
    return cars;
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function getBookings(startDate, endDate, model, make, page, pageSize) {
  console.log("get bookings", startDate, endDate, model, make);
  const db = await open({
    filename: "./db/Car.db",
    driver: sqlite3.Database,
  });

  let stmt = "";

  if (startDate === "" && endDate === "" && model === "" && make === "") {
    stmt = await db.prepare(
      "SELECT * FROM Booking, Car, Car_Model, Car_Make, Car_Category, Rental_Branch WHERE Booking.pickupRentalBranchID == Rental_Branch.rentalBranchID AND Booking.carID = Car.carID AND Car.modelID = Car_Model.modelID AND Car.makeID = Car_Make.makeID AND Car.carCategoryID = Car_Category.categoryID LIMIT $pageSize OFFSET $offset",
      {
        $pageSize: pageSize,
        $offset: (page - 1) * pageSize,
      }
    );
  } else if (startDate !== "" || endDate !== "") {
    if (endDate === "") {
      stmt = await db.prepare(
        "SELECT * FROM Booking, Car, Car_Model, Car_Make, Car_Category, Rental_Branch WHERE Booking.pickupRentalBranchID == Rental_Branch.rentalBranchID AND Booking.carID = Car.carID AND Car.modelID = Car_Model.modelID AND Car.makeID = Car_Make.makeID AND Car.carCategoryID = Car_Category.categoryID AND booking.bookingStartDate >= $startDate LIMIT $pageSize OFFSET $offset",
        {
          $startDate: startDate,
          $pageSize: pageSize,
          $offset: (page - 1) * pageSize,
        }
      );
    } else if (startDate == "") {
      stmt = await db.prepare(
        "SELECT * FROM Booking, Car, Car_Model, Car_Make, Car_Category, Rental_Branch WHERE Booking.pickupRentalBranchID == Rental_Branch.rentalBranchID AND Booking.carID = Car.carID AND Car.modelID = Car_Model.modelID AND Car.makeID = Car_Make.makeID AND Car.carCategoryID = Car_Category.categoryID AND booking.bookingEndDate <= $endDate LIMIT $pageSize OFFSET $offset",
        {
          $endDate: endDate,
          $pageSize: pageSize,
          $offset: (page - 1) * pageSize,
        }
      );
    } else {
      stmt = await db.prepare(
        "SELECT * FROM Booking, Car, Car_Model, Car_Make, Car_Category, Rental_Branch WHERE Booking.pickupRentalBranchID == Rental_Branch.rentalBranchID AND Booking.carID = Car.carID AND Car.modelID = Car_Model.modelID AND Car.makeID = Car_Make.makeID AND Car.carCategoryID = Car_Category.categoryID AND booking.bookingStartDate >= $startDate AND booking.bookingEndDate <= $endDate LIMIT $pageSize OFFSET $offset",
        {
          $startDate: startDate,
          $endDate: endDate,
          $pageSize: pageSize,
          $offset: (page - 1) * pageSize,
        }
      );
    }
  } else if (model !== "" && make !== "") {
    stmt = await db.prepare(
      "SELECT * FROM Booking, Car, Car_Model, Car_Make, Car_Category, Rental_Branch WHERE Booking.pickupRentalBranchID == Rental_Branch.rentalBranchID AND Booking.carID = Car.carID AND Car.modelID = Car_Model.modelID AND Car.makeID = Car_Make.makeID AND Car.carCategoryID = Car_Category.categoryID AND make = $make AND model = $model LIMIT $pageSize OFFSET $offset",
      {
        $make: make,
        $model: model,
        $pageSize: pageSize,
        $offset: (page - 1) * pageSize,
      }
    );
  } else if (model === "") {
    stmt = await db.prepare(
      "SELECT * FROM Booking, Car, Car_Model, Car_Make, Car_Category, Rental_Branch WHERE Booking.pickupRentalBranchID == Rental_Branch.rentalBranchID AND Booking.carID = Car.carID AND Car.modelID = Car_Model.modelID AND Car.makeID = Car_Make.makeID AND Car.carCategoryID = Car_Category.categoryID AND make = $make LIMIT $pageSize OFFSET $offset",
      {
        $make: make,
        $pageSize: pageSize,
        $offset: (page - 1) * pageSize,
      }
    );
  } else {
    stmt = await db.prepare(
      "SELECT * FROM Booking, Car, Car_Model, Car_Make, Car_Category, Rental_Branch WHERE Booking.pickupRentalBranchID == Rental_Branch.rentalBranchID AND Booking.carID = Car.carID AND Car.modelID = Car_Model.modelID AND Car.makeID = Car_Make.makeID AND Car.carCategoryID = Car_Category.categoryID AND model = $model LIMIT $pageSize OFFSET $offset",
      {
        $model: model,
        $pageSize: pageSize,
        $offset: (page - 1) * pageSize,
      }
    );
  }

  try {
    let bookings = await stmt.all();
    console.log(bookings);
    return bookings;
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function getBookingCount(startDate, endDate, model, make) {
  console.log("get booking count", startDate, model, make);

  const db = await open({
    filename: "./db/Car.db",
    driver: sqlite3.Database,
  });

  let stmt = "";

  if (startDate === "" && endDate === "" && model === "" && make === "") {
    stmt = await db.prepare(
      `
    SELECT COUNT(*) AS count
    FROM Booking`
    );
  } else if (startDate !== "" || endDate !== "") {
    if (endDate === "") {
      stmt = await db.prepare(
        "SELECT COUNT(*) AS count FROM Booking WHERE Booking.bookingStartDate >= $startDate",
        {
          $startDate: startDate,
        }
      );
    } else if (startDate === "") {
      stmt = await db.prepare(
        "SELECT COUNT(*) AS count FROM Booking WHERE Booking.bookingEndDate >= $endDate",
        {
          $endDate: endDate,
        }
      );
    } else {
      stmt = await db.prepare(
        "SELECT COUNT(*) AS count FROM Booking WHERE Booking.bookingEndDate >= $endDate AND Booking.bookingStartDate >= $startDate",
        {
          $startDate: startDate,
          $endDate: endDate,
        }
      );
    }
  } else if (model !== "" && make !== "") {
    stmt = await db.prepare(
      "SELECT COUNT(*) AS count FROM Booking, Car, Car_Model, Car_Make WHERE Booking.carID = Car.carID AND Car.modelID = Car_Model.modelID AND Car.makeID = Car_Make.makeID AND make = $make AND model = $model",
      {
        $make: make,
        $model: model,
      }
    );
  } else if (model === "") {
    stmt = await db.prepare(
      "SELECT COUNT(*) AS count FROM Booking, Car, Car_Model, Car_Make WHERE Booking.carID = Car.carID AND Car.modelID = Car_Model.modelID AND Car.makeID = Car_Make.makeID AND make = $make",
      {
        $make: make,
      }
    );
  } else {
    stmt = await db.prepare(
      "SELECT COUNT(*) AS count FROM Booking, Car, Car_Model, Car_Make WHERE Booking.carID = Car.carID AND Car.modelID = Car_Model.modelID AND Car.makeID = Car_Make.makeID AND model = $model",
      {
        $model: model,
      }
    );
  }

  try {
    let count = (await stmt.get()).count;
    console.log(count);
    return count;
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function getBranchCount(topK) {
  console.log("get branch count", topK);

  const db = await open({
    filename: "./db/Car.db",
    driver: sqlite3.Database,
  });

  let stmt = "";
  if (topK === "") {
    stmt = await db.prepare("SELECT COUNT(*) AS count FROM Rental_Branch");
  } else {
    //[TODO] SELECT TOP K count
    stmt = await db.prepare(
      "SELECT COUNT(*) AS count FROM (SELECT *, sum(Booking.totalCharge) AS totalTransaction FROM Booking, Rental_Branch WHERE Booking.pickupRentalBranchID = Rental_Branch.rentalBranchID GROUP BY Rental_Branch.rentalBranchID ORDER BY totalTransaction DESC LIMIT $topK)",
      {
        $topK: parseInt(topK),
      }
    );
  }

  try {
    let count = (await stmt.get()).count;
    console.log(count);
    return count;
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function getCustomerCount(times) {
  console.log("get customer count", times);

  const db = await open({
    filename: "./db/Car.db",
    driver: sqlite3.Database,
  });

  let stmt = "";
  if (times === "") {
    stmt = await db.prepare("SELECT COUNT(*) AS count FROM Customer");
  } else {
    stmt = await db.prepare(
      "SELECT COUNT(*) AS count FROM (SELECT COUNT(*) FROM Customer, Booking WHERE Customer.customerID = Booking.customerID GROUP BY Customer.customerID HAVING COUNT(*) > $times)",
      {
        $times: parseInt(times),
      }
    );
  }

  try {
    let count = (await stmt.get()).count;
    console.log(count);
    return count;
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function getCarCount(startYear, model, make) {
  console.log("get car count", startYear, model, make);

  const db = await open({
    filename: "./db/Car.db",
    driver: sqlite3.Database,
  });

  let stmt = "";

  if (startYear === "" && model === "" && make === "") {
    stmt = await db.prepare(
      `
    SELECT COUNT(*) AS count
    FROM Car`
    );
  } else if (startYear !== "") {
    stmt = await db.prepare(
      "SELECT COUNT(*) AS count FROM Car WHERE startYear >= $startYear",
      {
        $startYear: startYear,
      }
    );
  } else if (model !== "" && make !== "") {
    stmt = await db.prepare(
      "SELECT COUNT(*) AS count FROM Car, Car_Model, Car_Make WHERE Car.modelID = Car_Model.modelID AND Car.makeID = Car_Make.makeID AND make = $make AND model = $model",
      {
        $make: make,
        $model: model,
      }
    );
  } else if (model === "") {
    stmt = await db.prepare(
      "SELECT COUNT(*) AS count FROM Car, Car_Model, Car_Make WHERE Car.modelID = Car_Model.modelID AND Car.makeID = Car_Make.makeID AND make = $make",
      {
        $make: make,
      }
    );
  } else {
    stmt = await db.prepare(
      "SELECT COUNT(*) AS count FROM Car, Car_Model, Car_Make WHERE Car.modelID = Car_Model.modelID AND Car.makeID = Car_Make.makeID AND model = $model",
      {
        $model: model,
      }
    );
  }

  try {
    let count = (await stmt.get()).count;
    console.log(count);
    return count;
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function getCarByID(carID) {
  console.log("get car by ID", carID);

  const db = await open({
    filename: "./db/Car.db",
    driver: sqlite3.Database,
  });

  const stmt = await db.prepare(`
    SELECT * 
    FROM Car, Car_Model, Car_Make, Car_Category, Rental_Branch
    WHERE carID = @carID AND Car.modelID = Car_Model.modelID AND Car.makeID = Car_Make.makeID AND Car.carCategoryID = Car_Category.categoryID AND Car.currentRentalBranchID = Rental_Branch.rentalBranchID
    `);

  const params = {
    "@carID": carID,
  };

  try {
    return await stmt.get(params);
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function getBranchByID(rentalBranchID) {
  console.log("get branch by ID", rentalBranchID);

  const db = await open({
    filename: "./db/Car.db",
    driver: sqlite3.Database,
  });

  const stmt = await db.prepare(`
    SELECT * 
    FROM Rental_Branch
    WHERE rentalBranchID = @rentalBranchID
    `);

  const params = {
    "@rentalBranchID": rentalBranchID,
  };

  try {
    return await stmt.get(params);
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function getBookingByID(bookingID) {
  console.log("get booking by ID", bookingID);

  const db = await open({
    filename: "./db/Car.db",
    driver: sqlite3.Database,
  });

  const stmt = await db.prepare(`
    SELECT * FROM Booking, Car, Car_Model, Car_Make, Car_Category, Rental_Branch,Customer WHERE Booking.customerID == Customer.customerID AND Booking.pickupRentalBranchID == Rental_Branch.rentalBranchID AND Booking.carID = Car.carID AND Car.modelID = Car_Model.modelID AND Car.makeID = Car_Make.makeID AND Car.carCategoryID = Car_Category.categoryID AND booking.bookingID == @bookingID 
    `);

  const params = {
    "@bookingID": bookingID,
  };

  try {
    let c = await stmt.get(params);
    console.log(c);
    return c;
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function getCustomerByID(customerID) {
  console.log("get customer by ID", customerID);

  const db = await open({
    filename: "./db/Car.db",
    driver: sqlite3.Database,
  });

  const stmt = await db.prepare(`
    SELECT *
    FROM Customer
    WHERE Customer.customerID = @customerID
    `);

  const params = {
    "@customerID": customerID,
  };

  try {
    let c = await stmt.get(params);
    console.log(c);
    return c;
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function getCustomerMembershipStatus(customerID) {
  console.log("get customer membership status", customerID);

  const db = await open({
    filename: "./db/Car.db",
    driver: sqlite3.Database,
  });

  const stmt = await db.prepare(`
    SELECT sum(totalCharge),
    CASE
      WHEN sum(totalCharge) > 3000 THEN 'Gold membership'
      WHEN sum(totalCharge) > 2000 THEN 'Silver membership'
      WHEN sum(totalCharge) > 1000 THEN 'Bronze membership'
      ELSE 'None'
    END AS MembershipAward
    FROM Booking
    WHERE Booking.customerID = @customerID
    `);

  const params = {
    "@customerID": customerID,
  };

  try {
    return await stmt.get(params);
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function getCustomerBookingHistory(customerID) {
  console.log("get customer booking history", customerID);

  const db = await open({
    filename: "./db/Car.db",
    driver: sqlite3.Database,
  });

  const stmt = await db.prepare(`
    SELECT * 
    FROM Booking, Car, Rental_Branch, Car_Make 
    WHERE customerID = @customerID AND Booking.carID = Car.carID AND pickupRentalBranchID = Rental_Branch.rentalBranchID AND Car.makeID = Car_Make.makeID
    `);

  const params = {
    "@customerID": customerID,
  };

  try {
    return await stmt.all(params);
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function updateCarByID(carID, car) {
  console.log("update car by id", carID, car);

  const db = await open({
    filename: "./db/Car.db",
    driver: sqlite3.Database,
  });

  const stmt = await db.prepare(`
    UPDATE Car
    SET
      carCategoryID = @carCategoryID,
      modelID = @modelID,
      makeID = @makeID,
      startYear = @startYear,
      mileage = @mileage,
      isAvailable = @isAvailable,
      currentRentalBranchID = @currentRentalBranchID
    WHERE
       carID = @carID;
    `);

  const params = {
    "@carID": carID,
    "@carCategoryID": car.carCategoryID,
    "@modelID": car.modelID,
    "@makeID": car.makeID,
    "@startYear": car.startYear,
    "@mileage": car.mileage,
    "@isAvailable": car.isAvailable,
    "@currentRentalBranchID": car.currentRentalBranchID,
  };

  try {
    return await stmt.run(params);
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function deleteCarByID(carID) {
  console.log("delete car by ID", carID);

  const db = await open({
    filename: "./db/Car.db",
    driver: sqlite3.Database,
  });

  const stmt = await db.prepare(`
    DELETE FROM Car
    WHERE
       carID = @carID;
    `);

  const params = {
    "@carID": carID,
  };

  try {
    return await stmt.run(params);
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function createCar(car) {
  const db = await open({
    filename: "./db/Car.db",
    driver: sqlite3.Database,
  });

  const stmt = await db.prepare(`INSERT INTO
    Car(carCategoryID, modelID, makeID, startYear, mileage, isAvailable, currentRentalBranchID)
    VALUES (@carCategoryID, @modelID, @makeID, @startYear, @mileage, @isAvailable, @currentRentalBranchID);`);

  try {
    let newCar = await stmt.run({
      "@carCategoryID": car.carCategoryID,
      "@modelID": car.modelID,
      "@makeID": car.makeID,
      "@startYear": car.startYear,
      "@mileage": car.mileage,
      // new cars are default to be available
      "@isAvailable": "1",
      "@currentRentalBranchID": car.currentRentalBranchID,
    });
    console.log(newCar);
    return newCar;
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function createBranch(branch) {
  const db = await open({
    filename: "./db/Car.db",
    driver: sqlite3.Database,
  });

  const stmt = await db.prepare(`INSERT INTO
    Rental_Branch(rentalBranchID, branchName, address, city, state, country, branchManager)
    VALUES (@rentalBranchID, @branchName, @address, @city, @state, @country, @branchManager);`);

  try {
    let newBranch = await stmt.run({
      "@rentalBranchID": branch.rentalBranchID,
      "@branchName": branch.branchName,
      "@address": branch.address,
      "@city": branch.city,
      "@state": branch.state,
      "@country": branch.country,
      "@branchManager": branch.branchManager,
    });
    console.log(newBranch);
    return newBranch;
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function updateBranchByID(rentalBranchID, branch) {
  console.log("update car by id", rentalBranchID, branch);

  const db = await open({
    filename: "./db/Car.db",
    driver: sqlite3.Database,
  });

  const stmt = await db.prepare(`
    UPDATE Rental_Branch
    SET
      branchName = @branchName,
      address = @address,
      city = @city,
      state = @state,
      country = @country,
      branchManager = @branchManager
    WHERE
       rentalBranchID = @rentalBranchID;
    `);

  const params = {
    "@rentalBranchID": rentalBranchID,
    "@branchName": branch.branchName,
    "@address": branch.address,
    "@city": branch.city,
    "@state": branch.state,
    "@country": branch.country,
    "@branchManager": branch.branchManager,
  };

  try {
    return await stmt.run(params);
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function deleteBranchByID(rentalBranchID) {
  console.log("delete car by ID", rentalBranchID);

  const db = await open({
    filename: "./db/Car.db",
    driver: sqlite3.Database,
  });

  const stmt = await db.prepare(`
    DELETE FROM Rental_Branch
    WHERE
       rentalBranchID = @rentalBranchID;
    `);

  const params = {
    "@rentalBranchID": rentalBranchID,
  };

  try {
    return await stmt.run(params);
  } finally {
    await stmt.finalize();
    db.close();
  }
}

module.exports.getCars = getCars;
module.exports.getCarByID = getCarByID;
module.exports.updateCarByID = updateCarByID;
module.exports.createCar = createCar;
module.exports.deleteCarByID = deleteCarByID;
module.exports.getCarCount = getCarCount;
module.exports.getCustomers = getCustomers;
module.exports.getCustomerCount = getCustomerCount;
module.exports.getCustomerByID = getCustomerByID;
module.exports.getCustomerBookingHistory = getCustomerBookingHistory;
module.exports.getCustomerMembershipStatus = getCustomerMembershipStatus;
module.exports.getBranches = getBranches;
module.exports.getBranchCount = getBranchCount;
module.exports.createBranch = createBranch;
module.exports.updateBranchByID = updateBranchByID;
module.exports.getBranchByID = getBranchByID;
module.exports.deleteBranchByID = deleteBranchByID;
module.exports.getBookings = getBookings;
module.exports.getBookingCount = getBookingCount;
module.exports.getBookingByID = getBookingByID;
