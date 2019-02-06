INSERT INTO "User"(user_name, password, email, phone_number, credit_card_number, address) 
VALUES('TheDude32', 'cheeseballs', 'TheDude32@geemail.com', 1111111111, 6784562798679164, '555 Dude Lane, Dude, DD 80085');
INSERT INTO "User"(user_name, password, email, phone_number, credit_card_number, address) 
VALUES('MyHappySandwich', 'yumfood', 'happysanwich@treemail.com', 1111111111, 4386752786233942, '123 FourFive Lane, Six 78910' );
INSERT INTO "User"(user_name, password, email, phone_number, credit_card_number, address) 
VALUES('Shrek', 'myswamp', 'donkey@shrekmail.com', 7, 1111111111, 'A Swamp');
INSERT INTO "User"(user_name, password, email, phone_number, credit_card_number, address) 
VALUES('JiggleBilly', 'commenceajigglin', 'tarnation@uhh.com', 309745139837, 1111111111, 'Jiggle Billy Lane');
INSERT INTO "User"(user_name, password, email, phone_number, credit_card_number, address) 
VALUES('TheKraken', 'unintelligiblescreaching', 'swagl0rd@oldgods.tv', 123321, 1111111111, 'Outside the realm of reality');

INSERT INTO company(name, description) 
VALUES('Apple', 'They Grow Apples');
INSERT INTO company(name, description) 
VALUES('Windows', 'They Clean Windows');
INSERT INTO company(name, description) 
VALUES('Gateway', 'They Make Gates');
INSERT INTO company(name, description) 
VALUES('AT&T', 'They Make a T and T');
INSERT INTO company(name, description) 
VALUES('EA', 'They make microtransactions');

INSERT INTO product(company_fk, name, description, price, stock) 
VALUES(3, 'Macintosh, The Fruit, Not The Computer', 'We Dont Make Computers.', 2399.99, 100 );
INSERT INTO product(company_fk, name, description, price, stock) 
VALUES(3, 'iPhone 6, but not a phone, an. apple', 'This isnt a phone', 599.99, 200);
INSERT INTO product(company_fk, name, description, price, stock) 
VALUES(7, 'Money Grubber 2: Even More Money', 'Buy our stuff, we want money', 100000000, 10000);
INSERT INTO product(company_fk, name, description, price, stock) 
VALUES(4, 'PC', 'PC Master Race, Yo.', 500, 1000);
INSERT INTO product(company_fk, name, description, price, stock) 
VALUES(5, 'A Gateway to Another Dimension', 'Totally not dangerous.', 100000000000, 1);

INSERT INTO cart(user_fk) 
VALUES(18);
INSERT INTO cart(user_fk) 
VALUES(16);
INSERT INTO cart(user_fk) 
VALUES(17);
INSERT INTO cart(user_fk) 
VALUES(15);
INSERT INTO cart(user_fk) 
VALUES(19);