import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase({name: 'WaterMeter.db', location: 'default'});

export const initDB = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, role TEXT);'
    );
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS meters (id INTEGER PRIMARY KEY AUTOINCREMENT, meterId TEXT, serialNumber TEXT, location TEXT, customerId INTEGER, status TEXT DEFAULT "normal", lastReading REAL DEFAULT 0, flowRate REAL DEFAULT 0, lat REAL DEFAULT 0, lng REAL DEFAULT 0, FOREIGN KEY(customerId) REFERENCES users(id));'
    );
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS readings (id INTEGER PRIMARY KEY AUTOINCREMENT, meterId INTEGER, value REAL, flowRate REAL, consumption REAL, timestamp TEXT, FOREIGN KEY(meterId) REFERENCES meters(id));'
    );
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS alerts (id INTEGER PRIMARY KEY AUTOINCREMENT, meterId INTEGER, type TEXT, severity TEXT, status TEXT DEFAULT "open", message TEXT, timestamp TEXT, FOREIGN KEY(meterId) REFERENCES meters(id));'
    );
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS bills (id INTEGER PRIMARY KEY AUTOINCREMENT, customerId INTEGER, meterId INTEGER, amount REAL, consumption REAL, dueDate TEXT, paid INTEGER DEFAULT 0, timestamp TEXT, FOREIGN KEY(customerId) REFERENCES users(id), FOREIGN KEY(meterId) REFERENCES meters(id));'
    );
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS notifications (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, body TEXT, screen TEXT, read INTEGER DEFAULT 0, timestamp TEXT);'
    );
  });
};

export const addUser = (name, email, role) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('INSERT INTO users (name, email, role) VALUES (?, ?, ?);', [name, email, role], () => resolve(), (_, error) => reject(error));
    });
  });
};

export const getUsers = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM users;', [], (_, {rows}) => {
        const users = [];
        for (let i = 0; i < rows.length; i++) users.push(rows.item(i));
        resolve(users);
      }, (_, error) => reject(error));
    });
  });
};

export const addMeter = (meterId, serialNumber, location, customerId, lat, lng) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('INSERT INTO meters (meterId, serialNumber, location, customerId, status, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?);', [meterId, serialNumber, location, customerId, 'normal', lat || 0, lng || 0], () => resolve(), (_, error) => reject(error));
    });
  });
};

export const getMeters = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('SELECT m.*, u.name as customerName FROM meters m LEFT JOIN users u ON m.customerId = u.id ORDER BY m.meterId ASC;', [], (_, {rows}) => {
        const meters = [];
        for (let i = 0; i < rows.length; i++) meters.push(rows.item(i));
        resolve(meters);
      }, (_, error) => reject(error));
    });
  });
};

export const getMeterById = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM meters WHERE id = ?;', [id], (_, {rows}) => resolve(rows.length > 0 ? rows.item(0) : null), (_, error) => reject(error));
    });
  });
};

export const updateMeterStatus = (id, status) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('UPDATE meters SET status = ? WHERE id = ?;', [status, id], () => resolve(), (_, error) => reject(error));
    });
  });
};

export const addReading = (meterId, value, flowRate, consumption) => {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().toISOString();
    db.transaction(tx => {
      tx.executeSql('INSERT INTO readings (meterId, value, flowRate, consumption, timestamp) VALUES (?, ?, ?, ?, ?);', [meterId, value, flowRate || 0, consumption || 0, timestamp], () => resolve(), (_, error) => reject(error));
    });
  });
};

export const getReadingsByMeterId = (meterId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM readings WHERE meterId = ? ORDER BY timestamp ASC;', [meterId], (_, {rows}) => {
        const readings = [];
        for (let i = 0; i < rows.length; i++) readings.push(rows.item(i));
        resolve(readings);
      }, (_, error) => reject(error));
    });
  });
};

export const getReadings = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('SELECT r.*, m.meterId, m.location FROM readings r LEFT JOIN meters m ON r.meterId = m.id ORDER BY r.timestamp ASC;', [], (_, {rows}) => {
        const readings = [];
        for (let i = 0; i < rows.length; i++) readings.push(rows.item(i));
        resolve(readings);
      }, (_, error) => reject(error));
    });
  });
};

export const updateReading = (id, value, date) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('UPDATE readings SET value = ?, timestamp = ? WHERE id = ?;', [value, date, id], () => resolve(), (_, error) => reject(error));
    });
  });
};

export const deleteReading = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('DELETE FROM readings WHERE id = ?;', [id], () => resolve(), (_, error) => reject(error));
    });
  });
};

export const addNotification = (title, body, screen) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('INSERT INTO notifications (title, body, screen, timestamp) VALUES (?, ?, ?, ?);', [title, body, screen, new Date().toISOString()], () => resolve(), (_, error) => reject(error));
    });
  });
};

export const addAlert = (meterId, type, severity, message) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('INSERT INTO alerts (meterId, type, severity, message, timestamp) VALUES (?, ?, ?, ?, ?);', [meterId, type, severity, message, new Date().toISOString()], () => resolve(), (_, error) => reject(error));
    });
  });
};

export const getAlerts = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('SELECT a.*, m.meterId FROM alerts a LEFT JOIN meters m ON a.meterId = m.id ORDER BY a.timestamp DESC;', [], (_, {rows}) => {
        const alerts = [];
        for (let i = 0; i < rows.length; i++) alerts.push(rows.item(i));
        resolve(alerts);
      }, (_, error) => reject(error));
    });
  });
};

export const updateAlertStatus = (id, status) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('UPDATE alerts SET status = ? WHERE id = ?;', [status, id], () => resolve(), (_, error) => reject(error));
    });
  });
};

export const addBill = (customerId, meterId, amount, consumption, dueDate) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('INSERT INTO bills (customerId, meterId, amount, consumption, dueDate, timestamp) VALUES (?, ?, ?, ?, ?, ?);', [customerId, meterId, amount, consumption, dueDate, new Date().toISOString()], () => resolve(), (_, error) => reject(error));
    });
  });
};

export const getBills = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('SELECT b.*, u.name as customerName, m.meterId FROM bills b LEFT JOIN users u ON b.customerId = u.id LEFT JOIN meters m ON b.meterId = m.id ORDER BY b.timestamp DESC;', [], (_, {rows}) => {
        const bills = [];
        for (let i = 0; i < rows.length; i++) bills.push(rows.item(i));
        resolve(bills);
      }, (_, error) => reject(error));
    });
  });
};

export const getUnpaidBills = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM bills WHERE paid = 0;', [], (_, {rows}) => {
        const bills = [];
        for (let i = 0; i < rows.length; i++) bills.push(rows.item(i));
        resolve(bills);
      }, (_, error) => reject(error));
    });
  });
};

export const payBill = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('UPDATE bills SET paid = 1 WHERE id = ?;', [id], () => resolve(), (_, error) => reject(error));
    });
  });
};

export const getNotifications = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM notifications ORDER BY timestamp DESC LIMIT 50;', [], (_, {rows}) => {
        const notifications = [];
        for (let i = 0; i < rows.length; i++) notifications.push(rows.item(i));
        resolve(notifications);
      }, (_, error) => reject(error));
    });
  });
};

export const markNotificationRead = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('UPDATE notifications SET read = 1 WHERE id = ?;', [id], () => resolve(), (_, error) => reject(error));
    });
  });
};

export const getKeyStats = async () => {
  const meters = await getMeters();
  const alerts = await getAlerts();
  const readings = await getReadings();
  const bills = await getBills();
  const waterSupplied = readings.length > 0 ? readings[readings.length - 1].value : 0;
  const waterBilled = bills.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);
  const waterLoss = waterSupplied - waterBilled;
  const nrw = waterSupplied > 0 ? ((waterLoss / waterSupplied) * 100) : 0;
  const activeMeters = meters.filter(m => m.status !== 'offline').length;
  const openAlerts = alerts.filter(a => a.status === 'open').length;
  return {
    totalMeters: meters.length,
    activeMeters,
    openAlerts,
    totalConsumption: waterSupplied,
    totalBilled: waterBilled,
    waterLoss: Math.max(0, waterLoss),
    nrw: nrw.toFixed(1) + '%',
  };
};

initDB();
