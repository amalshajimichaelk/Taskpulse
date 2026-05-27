import express from "express";

const router = express.Router();

// In-memory data store
let mockTasks = [
  { _id: "1", id: "TSK-104", title: "Design System Audit & Token Refactoring", status: "Todo", priority: "High", labels: ["Design", "Architecture"], assignees: [{ name: "Elena Rostova" }, { name: "Marcus Chen" }], progress: 0, comments: 3, attachments: 1, dueDate: new Date(Date.now() + 86400000).toISOString() },
  { _id: "2", id: "TSK-092", title: "Glassmorphism Card Container Component", status: "In Progress", priority: "Medium", labels: ["Frontend"], assignees: [{ name: "Elena Rostova" }], progress: 65, comments: 8, attachments: 4, dueDate: new Date().toISOString() },
  { _id: "3", id: "TSK-085", title: "Dark Mode Color Palette Finalization", status: "Review", priority: "Low", labels: ["Design", "Feedback Req"], assignees: [{ name: "Sarah Jenkins" }], progress: 100, comments: 12, attachments: 0 },
  { _id: "4", id: "TSK-078", title: "Authentication Flow — JWT Refresh Logic", status: "In Progress", priority: "High", labels: ["Backend", "Security"], assignees: [{ name: "Marcus Chen" }], progress: 40, comments: 5, attachments: 2, dueDate: new Date(Date.now() + 3 * 86400000).toISOString() },
  { _id: "5", id: "TSK-071", title: "Kanban Board Drag-and-Drop Implementation", status: "Completed", priority: "High", labels: ["Frontend"], assignees: [{ name: "Alex Kim" }, { name: "Elena Rostova" }], progress: 100, comments: 15, attachments: 3 },
  { _id: "6", id: "TSK-065", title: "Mobile Responsive Navigation Drawer", status: "Todo", priority: "Medium", labels: ["Frontend", "UX"], assignees: [{ name: "Alex Kim" }], progress: 0, comments: 2, attachments: 0, dueDate: new Date(Date.now() + 5 * 86400000).toISOString() },
  { _id: "7", id: "TSK-059", title: "API Rate Limiting & Request Throttling", status: "Review", priority: "High", labels: ["Backend", "API"], assignees: [{ name: "Marcus Chen" }], progress: 90, comments: 6, attachments: 1 },
  { _id: "8", id: "TSK-048", title: "Notification System Real-time Integration", status: "Completed", priority: "Medium", labels: ["Backend", "Socket.IO"], assignees: [{ name: "Marcus Chen" }, { name: "Sarah Jenkins" }], progress: 100, comments: 9, attachments: 2 },
];

let mockProjects = [
  { id: "p1", name: "Nexus Platform Redesign", description: "Complete UI/UX overhaul of the Nexus SaaS platform with glassmorphism design system", status: "Active", progress: 68, members: ["Elena Rostova", "Marcus Chen", "Alex Kim"], deadline: "2026-06-15", tasks: { total: 48, completed: 33 }, color: "#6366F1", priority: "High" },
  { id: "p2", name: "Mobile App v2.0", description: "React Native rebuild with offline support and biometric authentication", status: "Active", progress: 35, members: ["Sarah Jenkins", "Alex Kim"], deadline: "2026-07-30", tasks: { total: 32, completed: 11 }, color: "#06B6D4", priority: "High" },
];

let mockNotifications = [
  { _id: "n1", title: "Task Assigned", message: "Elena Rostova assigned you 'Design System Audit'", read: false, createdAt: new Date().toISOString() }
];

let mockUser = {
  _id: "demo-user",
  name: "Alex Demo",
  email: "demo@taskpulse.io",
  role: "Project Manager" as const,
  bio: "Explore the modern dashboard!",
  jobTitle: "Product Manager",
  location: "San Francisco, CA",
  avatar: "",
  isVerified: true
};

// --- Auth ---
router.post("/auth/login", (req, res) => {
  const { email } = req.body;
  res.json({
    success: true,
    token: "mock-jwt-token",
    refreshToken: "mock-refresh-token",
    user: { ...mockUser, email: email || mockUser.email }
  });
});

router.post("/auth/register", (req, res) => {
  const { name, email } = req.body;
  res.json({
    success: true,
    token: "mock-jwt-token",
    refreshToken: "mock-refresh-token",
    user: { ...mockUser, name: name || mockUser.name, email: email || mockUser.email }
  });
});

router.get("/auth/me", (req, res) => {
  res.json({ success: true, user: mockUser });
});

router.post("/auth/logout", (req, res) => {
  res.json({ success: true });
});

router.post("/auth/forgot-password", (req, res) => {
  res.json({ success: true, message: "Mock OTP sent!" });
});

router.post("/auth/verify-otp", (req, res) => {
  res.json({ success: true, resetToken: "mock-reset-token" });
});

router.post("/auth/reset-password", (req, res) => {
  res.json({ success: true });
});

router.patch("/auth/profile", (req, res) => {
  const { name, bio, avatar, jobTitle, location } = req.body;
  if (name !== undefined) mockUser.name = name;
  if (bio !== undefined) mockUser.bio = bio;
  if (avatar !== undefined) mockUser.avatar = avatar;
  if (jobTitle !== undefined) mockUser.jobTitle = jobTitle;
  if (location !== undefined) mockUser.location = location;
  res.json({ success: true, user: mockUser });
});

router.patch("/auth/update-password", (req, res) => {
  res.json({ success: true, message: "Password updated successfully in Demo Mode" });
});

router.post("/auth/invite", (req, res) => {
  const { email, role } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }
  console.log(`[Mock Invite] Would send invite email to: ${email} as ${role || "Team Member"}`);
  res.json({
    success: true,
    message: `Invitation sent to ${email}`,
  });
});

// --- Tasks ---
router.get("/tasks", (req, res) => {
  res.json({ success: true, tasks: mockTasks });
});

router.post("/tasks", (req, res) => {
  const task = {
    _id: Math.random().toString(36).slice(2),
    id: `TSK-${Math.floor(100 + Math.random() * 900)}`,
    progress: 0,
    comments: 0,
    attachments: 0,
    ...req.body,
    assignees: (req.body.assignees || []).map((name: string) => ({ name }))
  };
  mockTasks.push(task);
  res.status(201).json({ success: true, task });
});

router.patch("/tasks/:id", (req, res) => {
  const { id } = req.params;
  const index = mockTasks.findIndex(t => t._id === id || t.id === id);
  if (index !== -1) {
    mockTasks[index] = { ...mockTasks[index], ...req.body };
    res.json({ success: true, task: mockTasks[index] });
  } else {
    res.status(404).json({ success: false, message: "Task not found" });
  }
});

router.patch("/tasks/:id/move", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const index = mockTasks.findIndex(t => t._id === id || t.id === id);
  if (index !== -1) {
    (mockTasks[index] as any).status = status;
    res.json({ success: true, task: mockTasks[index] });
  } else {
    res.status(404).json({ success: false, message: "Task not found" });
  }
});

router.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;
  mockTasks = mockTasks.filter(t => t._id !== id && t.id !== id);
  res.json({ success: true });
});

// --- Projects ---
router.get("/projects", (req, res) => {
  res.json({ success: true, projects: mockProjects });
});

router.post("/projects", (req, res) => {
  const project = {
    id: Math.random().toString(36).slice(2),
    progress: 0,
    members: ["Elena Rostova", "Marcus Chen"],
    tasks: { total: 0, completed: 0 },
    ...req.body
  };
  mockProjects.push(project);
  res.status(201).json({ success: true, project });
});

router.patch("/projects/:id", (req, res) => {
  const { id } = req.params;
  const index = mockProjects.findIndex(p => p.id === id);
  if (index !== -1) {
    mockProjects[index] = { ...mockProjects[index], ...req.body };
    res.json({ success: true, project: mockProjects[index] });
  } else {
    res.status(404).json({ success: false, message: "Project not found" });
  }
});

router.delete("/projects/:id", (req, res) => {
  const { id } = req.params;
  mockProjects = mockProjects.filter(p => p.id !== id);
  res.json({ success: true });
});

router.get("/projects/:id/analytics", (req, res) => {
  res.json({
    success: true,
    analytics: { total: 10, completed: 6, inProgress: 3, review: 1, todo: 0 }
  });
});

// --- Notifications ---
router.get("/notifications", (req, res) => {
  res.json({ success: true, notifications: mockNotifications });
});

// --- Analytics ---
router.get("/analytics/dashboard", (req, res) => {
  const total = mockTasks.length;
  const completed = mockTasks.filter(t => t.status === "Completed").length;
  const inProgress = mockTasks.filter(t => t.status === "In Progress").length;
  const review = mockTasks.filter(t => t.status === "Review").length;
  const todo = mockTasks.filter(t => t.status === "Todo").length;
  res.json({
    success: true,
    stats: {
      total,
      completed,
      inProgress,
      review,
      todo,
      productivityScore: total > 0 ? Math.round((completed / total) * 100) : 85
    }
  });
});

router.get("/analytics/weekly", (req, res) => {
  res.json({
    success: true,
    data: [
      { name: "Mon", score: 30, tasks: 4 },
      { name: "Tue", score: 55, tasks: 7 },
      { name: "Wed", score: 85, tasks: 11 },
      { name: "Thu", score: 60, tasks: 8 },
      { name: "Fri", score: 75, tasks: 9 },
      { name: "Sat", score: 90, tasks: 12 },
      { name: "Sun", score: 80, tasks: 10 }
    ]
  });
});

router.get("/analytics/team", (req, res) => {
  res.json({
    success: true,
    performance: [
      { name: "Elena Rostova", total: 10, completed: 8, rate: 80 },
      { name: "Marcus Chen", total: 8, completed: 6, rate: 75 },
      { name: "Sarah Jenkins", total: 12, completed: 11, rate: 91 },
      { name: "Alex Kim", total: 6, completed: 4, rate: 66 }
    ]
  });
});

router.get("/analytics/activity", (req, res) => {
  res.json({
    success: true,
    activities: [
      { _id: "a1", action: "task:created", details: "created 'Glassmorphism container'", actor: { name: "Elena Rostova" }, createdAt: new Date().toISOString() },
      { _id: "a2", action: "task:moved", details: "moved 'Authentication flow' to Review", actor: { name: "Marcus Chen" }, createdAt: new Date(Date.now() - 3600000).toISOString() }
    ]
  });
});

export default router;
