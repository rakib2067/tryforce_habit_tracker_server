INSERT INTO users (name, email, password, rupees, profilePic, xp, xpTarget, level)
VALUES
('Zeiadork','Zeiadork@gmail.com','a',100,2,5,10,0),
('Nottnott','Zeiadork@gmail.com','a',200,3,15,20,1),
('Rakib','Zeiadork@gmail.com','a',300,1,25,30,2);

INSERT INTO habits (user_id,title,frequency,timestampOfLastTrack,streak,category)
VALUES
(1,'Water',5000,'2022-03-27 12:00:25',3,'Lifestyle'),
(2,'Sleep',5000,'2022-03-26 12:00:25',4,'Lifestyle'),
(3,'Exercise',5000,'2022-03-27 12:00:25',5,'Lifestyle');