const express = require("express");
const pool = require("./db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./authMiddleware");
const cors = require("cors");

const app = express();

app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json());

const PORT = process.env.PORT || 5001;

app.get("/api/tasks", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await pool.query(
            "SELECT * FROM tasks WHERE user_id = $1 ORDER BY id",
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching tasks:", error.message);

        res.status(500).json({
            message: "Failed to fetch tasks"
        });
    }
});

const tasks = [
    { id: 1, title: "Learn Node.js", completed: false },
    { id: 2, title: "Practice Express", completed: false },
    { id: 3, title: "Build TaskFlow API", completed: true }
];

app.post("/api/tasks", authMiddleware, async (req, res) => {
    try {
        const { title } = req.body;
        const userId = req.user.userId;

        if (typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                message: "Task title is required"
            });
        }

        const result = await pool.query(
            "INSERT INTO tasks (title, completed, user_id) VALUES ($1, $2, $3) RETURNING *",
            [title.trim(), false, userId]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error("Error creating task:", error.message);

        res.status(500).json({
            message: "Failed to create task"
        });
    }
});

app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (
            typeof name !== "string" || !name.trim() ||
            typeof email !== "string" || !email.trim() ||
            typeof password !== "string" || password.length < 8
        ) {
            return res.status(400).json({
                message: "Valid name, email, and password of at least 8 characters are required"
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const result = await pool.query(
            "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email",
            [name.trim(), email.trim().toLowerCase(), passwordHash]
        );

        res.status(201).json({
            message: "User registered successfully",
            user: result.rows[0]
        });

    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        console.error("Registration error:", error.message);
        res.status(500).json({
            message: "Registration failed"
        });
    }
});

console.log("PUT route is being registered");
app.put("/api/tasks/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, completed } = req.body;
        const userId = req.user.userId;

        const result = await pool.query(
            "UPDATE tasks SET title = $1, completed = $2 WHERE id = $3 AND user_id = $4 RETURNING *",
            [title, completed, id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Error updating task:", error.message);

        res.status(500).json({
            message: "Failed to update task"
        });
    }
});

app.delete("/api/tasks/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const result = await pool.query(
            "DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *",
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json({
            message: "Task deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting task:", error.message);

        res.status(500).json({
            message: "Failed to delete task"
        });
    }
});

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email.trim().toLowerCase()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = result.rows[0];

        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            message: "Login successful",
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);

        res.status(500).json({
            message: "Login failed"
        });
    }
});

app.get("/api/db-test", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            message: "Database connected successfully!",
            time: result.rows[0].now
        });
    } catch (error) {
        console.error("Database error:", error.message);

        res.status(500).json({
            message: "Database connection failed"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

