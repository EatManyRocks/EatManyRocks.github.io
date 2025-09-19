<?php
//Task 1: Variables
echo "Task 1: Variables\n";
$firstName = "Ryan";
$lastName = "Russell";
$age = "22";
echo "Hello, my name is $firstName $lastName, and I am $age years old.\n";
//Task 2: Strings
echo "\nTask 2: Strings\n";
$str1 = "Learning PHP is fun!";
echo "String (\"$str1\") length: " . strlen($str1) . "\n";
echo "String (\"$str1\") in uppercase: " . strtoupper($str1) . "\n";
echo "String (\"$str1\") in lowercase: " . strtolower($str1) . "\n";
//Task 3: Numbers and Math Operators
echo "\nTask 3: Numbers and Math Operators\n";
$num1 = 10;
$num2 = 3;
echo "$num1 + $num2 = " . ($num1 + $num2) . "\n";
echo "$num1 - $num2 = " . ($num1 - $num2) . "\n";
echo "$num1 * $num2 = " . ($num1 * $num2) . "\n";
echo "$num1 / $num2 = " . ($num1 / $num2) . "\n";
echo "$num1 % $num2 = " . ($num1 % $num2) . "\n";
//Task 4: Assignment & Increment Operators
echo "\nTask 4: Assignment & Increment Operators\n";
$counter = 5;
echo "Counter: $counter \n";
$counter += 1;
echo "Counter: $counter \n";
$counter++;
echo "Counter: $counter \n";
$counter -= 1;
echo "Counter: $counter \n";
$counter--;
echo "Counter: $counter \n";
//Task 5: Combine Strings and Variables
echo "\nTask 5: Combine Strings and Variables\n";
$product = "Laptop";
$price = 799.99;
echo "The $product costs \$$price\n";
//BONUS Task (Optional): Order Summary
echo "\nBONUS Task (Optional): Order Summary\n";
$item = "Book";
$quantity = 3;
$price = 12.50;
echo "You ordered $quantity $item(s). Total cost: \$" . number_format(($quantity * $price), 2);
