const crypto = require("crypto");

// checks a plain password against the stored "salt:hash" value
function checkPassword(password, stored) {
    if (typeof stored !== "string" || !stored.includes(":")) {
        return false;
    }

    const parts = stored.split(":");
    const salt = parts[0];
    const storedHash = Buffer.from(parts[1], "hex");
    const enteredHash = crypto.scryptSync(password, salt, 64);

    if (storedHash.length !== enteredHash.length) {
        return false;
    }

    return crypto.timingSafeEqual(enteredHash, storedHash);
}

function loginUser(db, loginId, password) {
    if (!db) {
        throw new Error("A database is required");
    }

    if (typeof loginId !== "string" || loginId.trim() === "") {
        throw new Error("Email or driver's license number is required");
    }

    if (loginId.trim().length > 254) {
        throw new Error("Login must be 254 characters or less");
    }

    if (typeof password !== "string" || password === "") {
        throw new Error("Password is required");
    }

    if (password.length > 64) {
        throw new Error("Password must be 64 characters or less");
    }

    const value = loginId.trim();

    let user;

    if (value.includes("@")) {
        user = db.prepare(
            "SELECT uc.id, uc.email, uc.password_hash, uc.role, up.full_name " +
            "FROM UserCredentials uc " +
            "LEFT JOIN UserProfile up ON up.user_id = uc.id " +
            "WHERE LOWER(uc.email) = LOWER(?)"
        ).get(value);
    } else {
        user = db.prepare(
            "SELECT uc.id, uc.email, uc.password_hash, uc.role, up.full_name " +
            "FROM UserCredentials uc " +
            "JOIN UserProfile up ON up.user_id = uc.id " +
            "WHERE up.drivers_license = ?"
        ).get(value);
    }

    if (!user || !checkPassword(password, user.password_hash)) {
        throw new Error("Incorrect login or password");
    }

    return {
        email: user.email,
        name: user.full_name || user.email,
        role: user.role
    };
}

module.exports = { loginUser };