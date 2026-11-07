const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { loginUser } = require("../src/loginDb");

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    return salt + ":" + hash;
}

describe("Database Login", function () {
    let db;

    beforeEach(function () {
        db = new Database(":memory:");

        const schema = fs.readFileSync(
            path.join(__dirname, "../src/schema.sql"),
            "utf8"
        );

        db.exec(schema);

        const passwordHash = hashPassword("Admin123");

        const userResult = db.prepare(
            "INSERT INTO UserCredentials (email, password_hash, role) VALUES (?, ?, ?)"
        ).run(
            "admin@queuesmart.gov",
            passwordHash,
            "admin"
        );

        db.prepare(
            "INSERT INTO UserProfile (user_id, full_name, drivers_license) VALUES (?, ?, ?)"
        ).run(
            Number(userResult.lastInsertRowid),
            "Dana Staff",
            "12345678"
        );
    });

    afterEach(function () {
        db.close();
    });

    test("logs in with email and password", function () {
        const user = loginUser(
            db,
            "admin@queuesmart.gov",
            "Admin123"
        );

        expect(user.email).toBe("admin@queuesmart.gov");
        expect(user.name).toBe("Dana Staff");
        expect(user.role).toBe("admin");
    });

    test("logs in with driver's license number", function () {
        const user = loginUser(
            db,
            "12345678",
            "Admin123"
        );

        expect(user.email).toBe("admin@queuesmart.gov");
        expect(user.role).toBe("admin");
    });

    test("rejects incorrect password", function () {
        expect(function () {
            loginUser(
                db,
                "admin@queuesmart.gov",
                "WrongPassword"
            );
        }).toThrow("Incorrect login or password");
    });

    test("rejects unknown account", function () {
        expect(function () {
            loginUser(
                db,
                "missing@example.com",
                "Admin123"
            );
        }).toThrow("Incorrect login or password");
    });

    test("requires login id", function () {
        expect(function () {
            loginUser(
                db,
                "",
                "Admin123"
            );
        }).toThrow("Email or driver's license number is required");
    });

    test("requires password", function () {
        expect(function () {
            loginUser(
                db,
                "admin@queuesmart.gov",
                ""
            );
        }).toThrow("Password is required");
    });
});