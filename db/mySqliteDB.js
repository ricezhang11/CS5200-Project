// this is the layer where you connect with db
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

async function getCars(query, page, pageSize) {
  console.log("get cars", query);

  const db = await open({
    filename: "./db/Car.db",
    driver: sqlite3.Database,
  });

  const stmt = await db.prepare(`
    SELECT carID, startYear, mileage, isAvailable, model, make
    FROM Car, Car_Model, Car_Make, Car_Category
    WHERE Car.modelID = Car_Model.modelID AND Car.makeID = Car_Make.makeID AND Car.carCategoryID = Car_Category.categoryID
    LIMIT @pageSize
    OFFSET @offset
    `);

  const params = {
    "@pageSize": pageSize,
    "@offset": (page - 1) * pageSize,
  };

  try {
    return await stmt.all(params);
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function getCarCount(query) {
  console.log("get car count", query);

  const db = await open({
    filename: "./db/Car.db",
    driver: sqlite3.Database,
  });

  const stmt = await db.prepare(`
    SELECT COUNT(*) AS count
    FROM Car
    `);

  // const params = {
  //   "@query": query + "%",
  // };

  try {
    return (await stmt.get()).count;
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
    SELECT * FROM Car
    WHERE carID = @carID;
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
    return await stmt.run({
      "@carCategoryID": car.carCategoryID,
      "@modelID": car.modelID,
      "@makeID": car.makeID,
      "@startYear": car.startYear,
      "@mileage": car.mileage,
      // new cars are default to be available
      "@isAvailable": "1",
      "@currentRentalBranchID": car.currentRentalBranchID,
    });
  } finally {
    await stmt.finalize();
    db.close();
  }
}

// async function getReferences(query, page, pageSize) {
//   console.log("getReferences", query);

//   const db = await open({
//     filename: "./db/database.db",
//     driver: sqlite3.Database,
//   });

//   const stmt = await db.prepare(`
//     SELECT * FROM Reference
//     WHERE title LIKE @query
//     ORDER BY created_on DESC
//     LIMIT @pageSize
//     OFFSET @offset;
//     `);

//   const params = {
//     "@query": query + "%",
//     "@pageSize": pageSize,
//     "@offset": (page - 1) * pageSize,
//   };

//   try {
//     return await stmt.all(params);
//   } finally {
//     await stmt.finalize();
//     db.close();
//   }
// }

// async function getReferencesCount(query) {
//   console.log("getReferences", query);

//   const db = await open({
//     filename: "./db/database.db",
//     driver: sqlite3.Database,
//   });

//   const stmt = await db.prepare(`
//     SELECT COUNT(*) AS count
//     FROM Reference
//     WHERE title LIKE @query;
//     `);

//   const params = {
//     "@query": query + "%",
//   };

//   try {
//     return (await stmt.get(params)).count;
//   } finally {
//     await stmt.finalize();
//     db.close();
//   }
// }

// async function getReferenceByID(reference_id) {
//   console.log("getReferenceByID", reference_id);

//   const db = await open({
//     filename: "./db/database.db",
//     driver: sqlite3.Database,
//   });

//   const stmt = await db.prepare(`
//     SELECT * FROM Reference
//     WHERE reference_id = @reference_id;
//     `);

//   const params = {
//     "@reference_id": reference_id,
//   };

//   try {
//     return await stmt.get(params);
//   } finally {
//     await stmt.finalize();
//     db.close();
//   }
// }

// async function updateReferenceByID(reference_id, ref) {
//   console.log("updateReferenceByID", reference_id, ref);

//   const db = await open({
//     filename: "./db/database.db",
//     driver: sqlite3.Database,
//   });

//   const stmt = await db.prepare(`
//     UPDATE Reference
//     SET
//       title = @title,
//       published_on = @published_on
//     WHERE
//        reference_id = @reference_id;
//     `);

//   const params = {
//     "@reference_id": reference_id,
//     "@title": ref.title,
//     "@published_on": ref.published_on,
//   };

//   try {
//     return await stmt.run(params);
//   } finally {
//     await stmt.finalize();
//     db.close();
//   }
// }

// async function deleteReferenceByID(reference_id) {
//   console.log("deleteReferenceByID", reference_id);

//   const db = await open({
//     filename: "./db/database.db",
//     driver: sqlite3.Database,
//   });

//   const stmt = await db.prepare(`
//     DELETE FROM Reference
//     WHERE
//        reference_id = @reference_id;
//     `);

//   const params = {
//     "@reference_id": reference_id,
//   };

//   try {
//     return await stmt.run(params);
//   } finally {
//     await stmt.finalize();
//     db.close();
//   }
// }

// async function insertReference(ref) {
//   const db = await open({
//     filename: "./db/database.db",
//     driver: sqlite3.Database,
//   });

//   const stmt = await db.prepare(`INSERT INTO
//     Reference(title, published_on)
//     VALUES (@title, @published_on);`);

//   try {
//     return await stmt.run({
//       "@title": ref.title,
//       "@published_on": ref.published_on,
//     });
//   } finally {
//     await stmt.finalize();
//     db.close();
//   }
// }

// async function getAuthorsByReferenceID(reference_id) {
//   console.log("getAuthorsByReferenceID", reference_id);

//   const db = await open({
//     filename: "./db/database.db",
//     driver: sqlite3.Database,
//   });

//   const stmt = await db.prepare(`
//     SELECT * FROM Reference_Author
//     NATURAL JOIN Author
//     WHERE reference_id = @reference_id;
//     `);

//   const params = {
//     "@reference_id": reference_id,
//   };

//   try {
//     return await stmt.all(params);
//   } finally {
//     await stmt.finalize();
//     db.close();
//   }
// }

// async function addAuthorIDToReferenceID(reference_id, author_id) {
//   console.log("addAuthorIDToReferenceID", reference_id, author_id);

//   const db = await open({
//     filename: "./db/database.db",
//     driver: sqlite3.Database,
//   });

//   const stmt = await db.prepare(`
//     INSERT INTO
//     Reference_Author(reference_id, author_id)
//     VALUES (@reference_id, @author_id);
//     `);

//   const params = {
//     "@reference_id": reference_id,
//     "@author_id": author_id,
//   };

//   try {
//     return await stmt.run(params);
//   } finally {
//     await stmt.finalize();
//     db.close();
//   }
// }

module.exports.getCars = getCars;
module.exports.getCarByID = getCarByID;
module.exports.updateCarByID = updateCarByID;
module.exports.createCar = createCar;
module.exports.deleteCarByID = deleteCarByID;
module.exports.getCarCount = getCarCount;
