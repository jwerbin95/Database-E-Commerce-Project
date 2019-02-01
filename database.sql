CREATE TABLE "User" (
	User_ID 		  		 Serial 	NOT NULL 	PRIMARY KEY,
	user_name   	  		 text 		NOT NULL,
	password 		  		 text 		NOT NULL,
	email 			   		 text 		NOT NULL,
	phone_number 	   		 text,
	credit_card_number 		 Integer  	NOT NULL,
	address 		   		 text 		NOT NULL
);

CREATE TABLE Shopping_History(
	History_ID 		   		 Serial 				PRIMARY KEY,
	User_FK 		   		 Integer 	NOT NULL,
	FOREIGN KEY 	   		 (User_FK) 				REFERENCES "User"(User_ID)
);
CREATE TABLE Cart(
	Cart_ID					 Serial 				PRIMARY KEY,
	User_FK					 Integer	NOT NULL,
	FOREIGN KEY 			 (User_FK)				REFERENCES "User"(User_ID)
);
CREATE TABLE Company(
	Company_ID 		   		 Serial 				PRIMARY KEY,
	name 			   		 text 		NOT NULL,
	description 	   		 text
);
CREATE TABLE Product(
	Product_ID 		   		 Serial 				PRIMARY KEY,
	Company_FK 		   		 Integer  	NOT NULL,
	Order_FK				 Integer 	NOT NULL,
	Cart_FK					 Integer 	NOT NULL,
	name 			   		 text	    NOT NULL,
	description 	   		 text,
	price 			   		 Numeric,
	stock 			   		 Integer,
	FOREIGN KEY 			 (Cart_FK)				REFERENCES Cart(Cart_ID),
	FOREIGN KEY 	   		 (Company_FK) 			REFERENCES Company(Company_ID)
);
CREATE TABLE "Order"(
	Order_ID 		   		 Serial 				PRIMARY KEY,
	orderTime				 Timestamp,
	Cart_FK 		   		 Integer  	NOT NULL,
	History_FK 				 Integer 	NOT NULL,
	FOREIGN KEY 	   		 (Cart_FK) 				REFERENCES Cart(Cart_ID),
	FOREIGN KEY 	   		 (History_FK) 			REFERENCES Shopping_History(History_ID)
);
CREATE TABLE History_And_Products(
	HistroyAndProducts_ID	 Serial 				PRIMARY KEY,
	History_FK 				 Integer 	NOT NULL,
	Product_FK 				 Integer 	NOT NULL, 
	FOREIGN KEY 			 (History_FK) 			REFERENCES shopping_history(History_ID),
	FOREIGN KEY 			 (Product_FK) 			REFERENCES product(Product_ID)
);
CREATE TABLE Cart_And_Product(
	CartAndProduct_ID 		 Serial 				PRIMARY KEY,
	Product_FK 				 Integer 	NOT NULL,
	Cart_FK 				 Integer 	NOT NULL,
	FOREIGN KEY				 (Product_FK)			REFERENCES Product(Product_ID),
	FOREIGN KEY				 (Cart_FK) 				REFERENCES Cart(Cart_ID)
);