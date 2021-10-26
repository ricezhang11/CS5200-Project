BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS Car(
  carID INTEGER NOT NULL,
  carCategoryID INTEGER NOT NULL, 
  modelID INTEGER NOT NULL, 
  makeID INTEGER NOT NULL, 
  startYear VARCHAR(50) NOT NULL, 
  mileage INTEGER NOT NULL, 
  isAvailable VARCHAR(50) NOT NULL,
  currentRentalBranchID INTEGER NOT NULL, 
  PRIMARY KEY(carID),
  FOREIGN KEY(currentRentalBranchID) REFERENCES Rental_Branch(rentalBranchID),
  FOREIGN KEY(carCategoryID) REFERENCES Car_Category(categoryID),
  FOREIGN KEY(modelID) REFERENCES Car_Model(modelID) ,
  FOREIGN KEY(makeID) REFERENCES Car_Make(makeID)
);
CREATE TABLE IF NOT EXISTS Customer (
  customerID  INTEGER NOT NULL,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  phoneNumber VARCHAR(50) NOT NULL,
  email TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL,
  PRIMARY KEY(customerID)
);
CREATE TABLE IF NOT EXISTS Rental_Branch (
  rentalBranchID  INTEGER NOT NULL,
  branchName TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL,
  branchManager TEXT NOT NULL,
  PRIMARY KEY(rentalBranchID)
);
CREATE TABLE IF NOT EXISTS Car_Category (
  categoryID  INTEGER NOT NULL,
  categoryType TEXT NOT NULL,
  PRIMARY KEY(categoryID)
);
CREATE TABLE IF NOT EXISTS Car_Model (
  modelID  INTEGER NOT NULL,
  model TEXT NOT NULL,
  PRIMARY KEY(modelID)
);
CREATE TABLE IF NOT EXISTS Car_Make (
  makeID  INTEGER NOT NULL,
  make TEXT NOT NULL,
  PRIMARY KEY(makeID)
);
CREATE TABLE IF NOT EXISTS Booking(
  bookingID INTEGER NOT NULL,
  bookingStartDate date NOT NULL,
  bookingEndDate date NOT NULL,
  carID INTEGER NOT NULL,
  customerID INTEGER NOT NULL,
  totalCharge REAL NOT NULL,
  pickupRentalBranchID INTEGER NOT NULL,
  returnRentalBranchID INTEGER NOT NULL,
  PRIMARY KEY(bookingID),
  FOREIGN KEY(customerID) REFERENCES Customer(customerID) ,
  FOREIGN KEY(pickupRentalBranchID) REFERENCES Rental_Branch(rentalBranchID) ,
  FOREIGN KEY(returnRentalBranchID) REFERENCES Rental_Branch(rentalBranchID)
);
COMMIT;