const pool = require("./db");

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS Users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(120) NOT NULL,
      email VARCHAR(120) NOT NULL UNIQUE,
      phone VARCHAR(20) NOT NULL,
      username VARCHAR(80) UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS Students (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      phone VARCHAR(20) NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS Rooms (
      id INT AUTO_INCREMENT PRIMARY KEY,
      room_number VARCHAR(20) NOT NULL UNIQUE,
      type VARCHAR(50) NOT NULL,
      status ENUM('Available', 'Occupied') NOT NULL DEFAULT 'Available'
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS Wardens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      phone VARCHAR(20) NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS Allocations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL UNIQUE,
      room_id INT NOT NULL,
      CONSTRAINT fk_allocations_student
        FOREIGN KEY (student_id) REFERENCES Students(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      CONSTRAINT fk_allocations_room
        FOREIGN KEY (room_id) REFERENCES Rooms(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `);

  const [roomColumns] = await pool.query(`
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'Rooms'
      AND COLUMN_NAME = 'warden_id'
  `);

  if (!roomColumns.length) {
    await pool.query(`
      ALTER TABLE Rooms
      ADD COLUMN warden_id INT NULL,
      ADD CONSTRAINT fk_rooms_warden
        FOREIGN KEY (warden_id) REFERENCES Wardens(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    `);
  }

  const [roomUniqueIndexes] = await pool.query(`
    SELECT INDEX_NAME
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'Allocations'
      AND COLUMN_NAME = 'room_id'
      AND NON_UNIQUE = 0
      AND INDEX_NAME <> 'PRIMARY'
  `);

  if (roomUniqueIndexes.length) {
    const [roomForeignKeys] = await pool.query(`
      SELECT CONSTRAINT_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'Allocations'
        AND COLUMN_NAME = 'room_id'
        AND REFERENCED_TABLE_NAME = 'Rooms'
    `);

    for (const foreignKey of roomForeignKeys) {
      await pool.query(`ALTER TABLE Allocations DROP FOREIGN KEY \`${foreignKey.CONSTRAINT_NAME}\``);
    }

    for (const index of roomUniqueIndexes) {
      await pool.query(`ALTER TABLE Allocations DROP INDEX \`${index.INDEX_NAME}\``);
    }

    await pool.query(`
      ALTER TABLE Allocations
      ADD CONSTRAINT fk_allocations_room
        FOREIGN KEY (room_id) REFERENCES Rooms(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    `);
  }
}

module.exports = initializeDatabase;
