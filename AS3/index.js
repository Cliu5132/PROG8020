// import dependencies I will use
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
// setting up Express Validator
const { check, validationResult } = require("express-validator"); //ES6 syntax

// set up variables to use packages
let congSupply = express();
congSupply.use(bodyParser.urlencoded({ extended: false }));

// set path to public folders and view folders
congSupply.set("views", path.join(__dirname, "views"));
congSupply.use(express.static(__dirname + "/public"));
congSupply.set("view engine", "ejs");

// home page
congSupply.get("/", function (req, res) {
  res.render("homepage");
});

// Define regular expressions
let phoneRegex = /^[0-9]{3}\-?[0-9]{3}\-?[0-9]{4}$/;
let creditCardRegex = /^[0-9]{4}\-[0-9]{4}\-[0-9]{4}\-[0-9]{4}$/;
let passwordRegex = /^[0-9A-Za-z]{8,20}$/;

// function of regex validation
function checkRegex(userInput, regex) {
  return regex.test(userInput);
}

// function of custom phone validation
function customPhoneValidation(value) {
  if (!checkRegex(value, phoneRegex)) {
    throw new Error("Phone should be in the format xxx-xxx-xxxx");
  }
  return true;
}

// function of custom password validation
function customPasswordValidation(value) {
  if (!checkRegex(value, passwordRegex)) {
    throw new Error(
      "Password should only contain alphanumerical values, min length is 8"
    );
  }
  return true;
}

// function of custom password match validation
function customPasswordMatchValidation(value, { req }) {
  let password = req.body.password;
  if (value !== password) {
    throw new Error("Your passwords don't match");
  }
  return true;
}

// function of custom credit card validation
function customcreditCardValidation(value) {
  if (!checkRegex(value, creditCardRegex)) {
    throw new Error("Credit card should be in the format xxxx-xxxx-xxxx-xxxx");
  }
  return true;
}

// function of checking if total cost is less than $10
function customTotalCostValidation(value, { req }) {
  let ram = req.body.ram;
  let ssd = req.body.ssd;
  if (value * 2 + ram * 20 + ssd * 100 < 10) {
    throw new Error("You must at least buy $10 worth products");
  }
  return true;
}

// form submission handler
congSupply.post(
  "/",
  [
    check("name", "Please enter a name").notEmpty(),
    check("email", "Please enter an email").isEmail(),
    check("phone").custom(customPhoneValidation),
    check("password", "Please enter a password").custom(
      customPasswordValidation
    ),
    check("confirmPassword", "Please confirm your assword").custom(
      customPasswordMatchValidation
    ),
    check("creditCard").custom(customcreditCardValidation),
    check("province", "Please select a province").notEmpty(),
    check("city", "Please enter a city").notEmpty(),
    check("address", "Please enter an address").notEmpty(),
    check("mouse").custom(customTotalCostValidation),
  ],
  function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("homepage", {
        errors: errors.array(),
      });
    } else {
      let name = req.body.name;
      let email = req.body.email;
      let phone = req.body.phone;
      let password = req.body.password;
      let mouse = req.body.mouse;
      let ram = req.body.ram;
      let ssd = req.body.ssd;
      let creditCard = req.body.creditCard;
      let province = req.body.province;
      let city = req.body.city;
      let address = req.body.address;
      let paperReceipt = req.body.paperReceipt;
      let taxRate;
      let totalPrice;
      let totalTax;
      let totalCost;

      // Define product prices
      const mousePrice = 2;
      const ramPrice = 20;
      const ssdPrice = 100;

      // Calculate total price
      totalPrice = mouse * mousePrice + ram * ramPrice + ssd * ssdPrice;

      // Set tax rate by province
      switch (province) {
        case "Alberta":
        case "Northwest Territories":
        case "Nunavut":
        case "Yukon":
          taxRate = 0.05;
          break;
        case "British Columbia":
        case "Manitoba":
          taxRate = 0.12;
          break;
        case "New Brunswick":
        case "Newfoundland and Labrador":
        case "Nova Scotia":
        case "Prince Edward Island":
          taxRate = 0.15;
          break;
        case "Ontario":
          taxRate = 0.13;
          break;
        case "Quebec":
          taxRate = 0.14975;
          break;
        case "Saskatchewan":
          taxRate = 0.11;
          break;

        // The default should never be excuted, but set it in case user try to break the code
        default:
          taxRate = 9999;
          break;
      }

      totalTax = "$" + (totalPrice * taxRate).toFixed(2);
      totalCost = "$" + (totalPrice * (1 + taxRate)).toFixed(2);
      totalPrice = "$" + totalPrice;

      let pageData = {
        name: name,
        email: email,
        phone: phone,
        password: password,
        mouse: mouse,
        ram: ram,
        ssd: ssd,
        creditCard: creditCard,
        province: province,
        city: city,
        address: address,
        paperReceipt: paperReceipt,
        totalPrice: totalPrice,
        totalTax: totalTax,
        totalCost: totalCost,
      };
      res.render("homepage", pageData);
    }
  }
);

// start the server and listen at port 8020 (aka, the Course Code for PROG8020)
congSupply.listen(8020);

// inform server status
console.log("Start hosting website at port 8020...");
