import { useState, useEffect } from "react";

function Dashboard({ token, onLogout }) {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [activePage, setActivePage] = useState("dashboard");


    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(
        (task) => task.completed === true
    ).length;

    const pendingTasks = totalTasks - completedTasks;

    const completionPercentage =
        totalTasks === 0
            ? 0
            : Math.round((completedTasks / totalTasks) * 100);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5001/api/tasks",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch tasks");
                }

                const data = await response.json();
                setTasks(data);

            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        };

        fetchTasks();
    }, [token]);

    const addTask = async () => {
        if (newTask.trim() === "") return;

        try {
            const response = await fetch(
                "http://localhost:5001/api/tasks",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title: newTask,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to add task");
            }

            const savedTask = await response.json();

            setTasks((previousTasks) => [
                ...previousTasks,
                savedTask,
            ]);

            setNewTask("");
        } catch (error) {
            console.error("Error adding task:", error);
            alert("Could not add task");
        }
    };


    const deleteTask = async (id) => {
        try {
            const response = await fetch(
                `http://localhost:5001/api/tasks/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete task");
            }

            setTasks((previousTasks) =>
                previousTasks.filter((task) => task.id !== id)
            );

        } catch (error) {
            console.error("Error deleting task:", error);
            alert("Could not delete task");
        }
    };

    const toggleTask = async (task) => {
        try {
            const response = await fetch(
                `http://localhost:5001/api/tasks/${task.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title: task.title,
                        completed: !task.completed,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update task");
            }

            const updatedTask = await response.json();

            setTasks((previousTasks) =>
                previousTasks.map((item) =>
                    item.id === task.id ? updatedTask : item
                )
            );
        } catch (error) {
            console.error("Error updating task:", error);
            alert("Could not update task");
        }
    };

    const saveTask = async (task) => {
        if (editTitle.trim() === "") return;

        try {
            const response = await fetch(
                `http://localhost:5001/api/tasks/${task.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title: editTitle.trim(),
                        completed: task.completed,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update task");
            }

            const updatedTask = await response.json();

            setTasks((previousTasks) =>
                previousTasks.map((item) =>
                    item.id === task.id ? updatedTask : item
                )
            );

            setEditingId(null);
            setEditTitle("");

        } catch (error) {
            console.error("Error editing task:", error);
            alert("Could not save task");
        }
    };

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <h2>TaskFlow</h2>

                <button
                    className={`sidebar-link ${activePage === "dashboard" ? "active" : ""}`}
                    onClick={() => setActivePage("dashboard")}
                >
                    Dashboard
                </button>

                <button
                    className={`sidebar-link ${activePage === "tasks" ? "active" : ""}`}
                    onClick={() => setActivePage("tasks")}
                >
                    My Tasks
                </button>

                <button
                    className={`sidebar-link ${activePage === "completed" ? "active" : ""}`}
                    onClick={() => setActivePage("completed")}
                >
                    Completed
                </button>
            </aside>

            <main className="dashboard">
                {activePage === "dashboard" && (
                    <>
                        <div className="stats-container">
                            <div className="stat-card">
                                <h3>Total Tasks</h3>
                                <h2>{totalTasks}</h2>
                            </div>

                            <div className="stat-card">
                                <h3>Completed</h3>
                                <h2>{completedTasks}</h2>
                            </div>

                            <div className="stat-card">
                                <h3>Pending</h3>
                                <h2>{pendingTasks}</h2>
                            </div>
                        </div>

                        <div className="progress-section">
                            <h3>Task Completion Progress</h3>

                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${completionPercentage}%` }}
                                ></div>
                            </div>

                            <p>{completionPercentage}% Completed</p>
                        </div>
                    </>
                )}
                <h1>TaskFlow Dashboard</h1>

                <p>Welcome! Manage your tasks here.</p>

                {activePage === "tasks" && (
                    <>
                        <h2>My Tasks</h2>

                        <div className="add-task">
                            <input
                                type="text"
                                placeholder="Enter a new task"
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                            />

                            <button onClick={addTask}>Add Task</button>
                        </div>
                    </>
                )}

                {activePage !== "dashboard" && (
                    tasks.length === 0 ? (
                        <p>No tasks yet. Add your first task!</p>
                    ) : (
                        <ul>
                            {tasks
                                .filter((task) =>
                                    activePage === "completed" ? task.completed : true
                                )
                                .map((task) => (
                                    <li key={task.id}>
                                        <input
                                            type="checkbox"
                                            checked={task.completed === true}
                                            onChange={() => toggleTask(task)}
                                        />

                                        {editingId === task.id ? (
                                            <input
                                                type="text"
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                            />
                                        ) : (
                                            <span>{task.title}</span>
                                        )}

                                        {editingId === task.id ? (
                                            <button onClick={() => saveTask(task)}>
                                                Save
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setEditingId(task.id);
                                                    setEditTitle(task.title);
                                                }}
                                            >
                                                Edit
                                            </button>
                                        )}
                                        <button
                                            onClick={() =>
                                                deleteTask(task.id)}
                                        >
                                            Delete
                                        </button>
                                    </li>
                                ))}
                        </ul>
                    )
                )}

                <button onClick={onLogout}>
                    Logout
                </button>
            </main>
        </div>
    );

}

export default Dashboard;

