// Define regular expressions
var creditCardRegex = /^[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}$/;
var emailRegex = /^[0-9A-Za-z]+[@][0-9A-Za-z]+[.][0-9A-Za-z]+$/;
var passwordRegex = /^[0-9A-Za-z]{8,20}$/;

// Define product prices
const mousePrice = 2;
const ramPrice = 20;
const ssdPrice = 100;


// The function fromSubmit() is called when the form "orderDetail" is submitted.
function formSubmit(){

    return true; // uncomment this line to bypass the validations

    // Fetch all user inputs
    var name = document.getElementById('name').value;
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var confirmPassword = document.getElementById('confirmPassword').value;
    var mouse = document.getElementById('mouse').value;
    var ram = document.getElementById('ram').value;
    var ssd = document.getElementById('ssd').value;
    var creditCard = document.getElementById('creditCard').value;
    var province = document.getElementById('province').value;
    var city = document.getElementById('city').value;
    var address = document.getElementById('address').value;
    var paperReceiptRadios = document.getElementsByName('paperReceipt');
    var taxRate;

    // Calculate total price
    var sum = mouse * mousePrice + ram * ramPrice + ssd * ssdPrice;

    //Identify the selected radios input and assign it to "paperReceipt" 
    var paperReceipt;
    for(var i = 0; i < paperReceiptRadios.length; i++) {
        if(paperReceiptRadios[i].checked) {
            paperReceipt = paperReceiptRadios[i].value;
        }
    }

    // add error if any input is empty
    var error = '';
    if(name == '') {
        error += 'Name is required. <br>';
    }
    if(email == '') {
        error += 'Email is required. <br>';
    }

    // add error if email is in wrong format
    if(!emailRegex.test(email)) {
        error += 'Email is in wrong format. <br>';
    }

    if(password == '') {
        error += 'Password is required. <br>';
    }
    if(confirmPassword == '') {
        error += 'Confirm Password is required. <br>';
    }

    // add error if password is in wrong format
    if(!passwordRegex.test(password)) {
        error += 'Password length must be at least 8 alphanumeric characters. <br>';
    } 

    // add error if two passwords don't match
    if(password != confirmPassword) {
        error += "Two passwords don't match. <br>";
    } 
    
    if(creditCard == '') {
        error += 'Credit Card is required. <br>';
    }
    if(province == '') {
        error += 'Province is required. <br>';
    }
    if(city == '') {
        error += 'City is required. <br>';
    }
    if(address == '') {
        error += 'Address is required. <br>';
    }

    // add error if total cost is less than $10
    if(sum < 10) {
        error += 'You must at least by $10 worth products. <br>';
    }

    // add error if credit card is in wrong format
    if(!creditCardRegex.test(creditCard)) {
        error += "The credit card should be in the format xxxx-xxxx-xxxx-xxxx with all numerical values. <br>";
    }

    // show a message if there is any error
    if(error != '') {
        document.getElementById('error').innerHTML = error;
    } else {
        document.getElementById('error').innerHTML = '';
        
        // Set tax rate by province
        switch(province) {
            case 'Alberta':
            case 'Northwest Territories':
            case 'Nunavut':
            case 'Yukon':
                taxRate = 0.05;
                break;
            case 'British Columbia':
            case 'Manitoba':
                taxRate = 0.12;
                break;
            case 'New Brunswick':
            case 'Newfoundland and Labrador':
            case 'Nova Scotia':
            case 'Prince Edward Island':
                taxRate = 0.15;
                break;
            case 'Ontario':
                taxRate = 0.13;
                break;
            case 'Quebec':
                taxRate = 0.14975;
                break;
            case 'Saskatchewan':
                taxRate = 0.11;
                break;

            // The default should never be excuted, but set it in case it runs
            default:
                taxRate = 9999;
                break;
        }

        // Generate a receipt to user
        document.getElementById('receipt').innerHTML = `------------Your receipt------------
        Name: ${name}<br>
        Email: ${email}<br>
        Password: ${password}<br>
        ${mouse ? 'Bluetooth mouse * ' + mouse + '<br>' : ''}
        ${ram ? '8GB RAM * ' + ram + '<br>' : ''}
        ${ssd ? '500GB SSD * ' + ssd + '<br>' : ''}
        Credit card number:<br> ${creditCard}<br>
        Province: ${province}<br>
        City: ${city}<br>
        Address: ${address}<br>
        Paper receipt: ${paperReceipt}<br>
        Total cost(without tax): $${sum}<br>
        Total tax: $${sum * taxRate}<br>
        Total cost(including tax): $${(sum * (1 + taxRate)).toFixed(2)}<br>
        ------------End of receipt------------
        `;
    }

    // Stop redirecting to next page.
    return false;
}