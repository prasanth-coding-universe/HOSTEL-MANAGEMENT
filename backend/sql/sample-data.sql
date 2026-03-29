USE hostel_management;

INSERT INTO Students (name, phone) VALUES
  ('Amit Sharma', '9876543210'),
  ('Priya Verma', '9123456780'),
  ('Rahul Singh', '9988776655');

INSERT INTO Rooms (room_number, type, status) VALUES
  ('A-101', 'Single', 'Occupied'),
  ('A-102', 'Double', 'Available'),
  ('B-201', 'Single', 'Available'),
  ('B-202', 'Double', 'Occupied');

INSERT INTO Wardens (name, phone) VALUES
  ('Meena Kapoor', '9012345678'),
  ('Suresh Nair', '9090909090');

INSERT INTO Allocations (student_id, room_id) VALUES
  (1, 1),
  (2, 4);
