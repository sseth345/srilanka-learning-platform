"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const firebase_1 = require("../config/firebase");
const router = express_1.default.Router();
// Get overall platform statistics (teachers only)
router.get('/overview', auth_1.authenticateToken, (0, auth_1.requireRole)('teacher'), async (req, res) => {
    try {
        // Get user statistics
        const usersSnapshot = await firebase_1.db.collection('users').get();
        const users = usersSnapshot.docs.map(doc => doc.data());
        const totalUsers = users.length;
        const totalStudents = users.filter(u => u.role === 'student').length;
        const totalTeachers = users.filter(u => u.role === 'teacher').length;
        // Get active users (logged in within last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const activeUsers = users.filter(u => {
            const lastLogin = u.lastLoginAt?.toDate?.() || new Date(0);
            return lastLogin >= sevenDaysAgo;
        }).length;
        // Get exercise statistics
        const exercisesSnapshot = await firebase_1.db.collection('exercises').get();
        const totalExercises = exercisesSnapshot.size;
        const publishedExercises = exercisesSnapshot.docs.filter(doc => doc.data().published).length;
        // Get submission statistics
        const submissionsSnapshot = await firebase_1.db.collection('submissions').get();
        const submissions = submissionsSnapshot.docs.map(doc => doc.data());
        const totalSubmissions = submissions.length;
        const avgScore = submissions.length > 0
            ? submissions.reduce((sum, s) => sum + (s.percentage || 0), 0) / submissions.length
            : 0;
        // Get news statistics
        const newsSnapshot = await firebase_1.db.collection('news').get();
        const news = newsSnapshot.docs.map(doc => doc.data());
        const totalNews = news.length;
        const publishedNews = news.filter(n => n.published).length;
        const totalNewsViews = news.reduce((sum, n) => sum + (n.views || 0), 0);
        const totalNewsLikes = news.reduce((sum, n) => sum + (n.likes || 0), 0);
        // Get discussion statistics
        const discussionsSnapshot = await firebase_1.db.collection('discussions').get();
        const totalDiscussions = discussionsSnapshot.size;
        // Get book statistics
        const booksSnapshot = await firebase_1.db.collection('books').get();
        const totalBooks = booksSnapshot.size;
        res.json({
            users: {
                total: totalUsers,
                students: totalStudents,
                teachers: totalTeachers,
                active: activeUsers,
            },
            exercises: {
                total: totalExercises,
                published: publishedExercises,
                submissions: totalSubmissions,
                averageScore: Math.round(avgScore * 10) / 10,
            },
            news: {
                total: totalNews,
                published: publishedNews,
                views: totalNewsViews,
                likes: totalNewsLikes,
            },
            discussions: {
                total: totalDiscussions,
            },
            books: {
                total: totalBooks,
            },
        });
    }
    catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});
// Get user activity logs (teachers only)
router.get('/user-activity', auth_1.authenticateToken, (0, auth_1.requireRole)('teacher'), async (req, res) => {
    try {
        const { limit = 50 } = req.query;
        const usersSnapshot = await firebase_1.db.collection('users').get();
        const users = usersSnapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data(),
            lastLoginAt: doc.data().lastLoginAt?.toDate(),
            createdAt: doc.data().createdAt?.toDate(),
        }));
        // Sort by last login
        users.sort((a, b) => {
            const aTime = a.lastLoginAt?.getTime() || 0;
            const bTime = b.lastLoginAt?.getTime() || 0;
            return bTime - aTime;
        });
        res.json(users.slice(0, Number(limit)));
    }
    catch (error) {
        console.error('Error fetching user activity:', error);
        res.status(500).json({ error: 'Failed to fetch user activity' });
    }
});
// Get exercise performance analytics (teachers only)
router.get('/exercise-performance', auth_1.authenticateToken, (0, auth_1.requireRole)('teacher'), async (req, res) => {
    try {
        const exercisesSnapshot = await firebase_1.db.collection('exercises').get();
        const exercises = exercisesSnapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().title,
            category: doc.data().category,
            totalAttempts: doc.data().totalAttempts || 0,
            averageScore: doc.data().averageScore || 0,
            createdAt: doc.data().createdAt?.toDate(),
        }));
        // Sort by total attempts
        exercises.sort((a, b) => b.totalAttempts - a.totalAttempts);
        res.json(exercises);
    }
    catch (error) {
        console.error('Error fetching exercise performance:', error);
        res.status(500).json({ error: 'Failed to fetch exercise performance' });
    }
});
// Get student progress (teachers only)
router.get('/student-progress', auth_1.authenticateToken, (0, auth_1.requireRole)('teacher'), async (req, res) => {
    try {
        const submissionsSnapshot = await firebase_1.db.collection('submissions').get();
        const submissions = submissionsSnapshot.docs.map(doc => doc.data());
        // Group by student
        const studentProgress = new Map();
        submissions.forEach((sub) => {
            if (!studentProgress.has(sub.studentId)) {
                studentProgress.set(sub.studentId, {
                    studentId: sub.studentId,
                    studentName: sub.studentName,
                    totalSubmissions: 0,
                    totalScore: 0,
                    totalPoints: 0,
                    exercises: [],
                });
            }
            const progress = studentProgress.get(sub.studentId);
            progress.totalSubmissions++;
            progress.totalScore += sub.score || 0;
            progress.totalPoints += sub.totalPoints || 0;
            progress.exercises.push({
                exerciseId: sub.exerciseId,
                exerciseTitle: sub.exerciseTitle,
                score: sub.score,
                totalPoints: sub.totalPoints,
                percentage: sub.percentage,
                submittedAt: sub.submittedAt?.toDate(),
            });
        });
        const progressArray = Array.from(studentProgress.values()).map((p) => ({
            ...p,
            averagePercentage: p.totalPoints > 0 ? (p.totalScore / p.totalPoints) * 100 : 0,
        }));
        // Sort by average percentage
        progressArray.sort((a, b) => b.averagePercentage - a.averagePercentage);
        res.json(progressArray);
    }
    catch (error) {
        console.error('Error fetching student progress:', error);
        res.status(500).json({ error: 'Failed to fetch student progress' });
    }
});
// Get login statistics (teachers only)
router.get('/login-stats', auth_1.authenticateToken, (0, auth_1.requireRole)('teacher'), async (req, res) => {
    try {
        const usersSnapshot = await firebase_1.db.collection('users').get();
        const users = usersSnapshot.docs.map(doc => doc.data());
        // Calculate daily logins for last 30 days
        const dailyLogins = new Map();
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            dailyLogins.set(dateKey, 0);
        }
        users.forEach((user) => {
            const lastLogin = user.lastLoginAt?.toDate?.();
            if (lastLogin) {
                const dateKey = lastLogin.toISOString().split('T')[0];
                if (dailyLogins.has(dateKey)) {
                    dailyLogins.set(dateKey, dailyLogins.get(dateKey) + 1);
                }
            }
        });
        const loginData = Array.from(dailyLogins.entries()).map(([date, count]) => ({
            date,
            logins: count,
        }));
        // Average session time (mock data for now - would need real session tracking)
        const avgSessionMinutes = users.reduce((sum, u) => sum + (u.stats?.averageSessionMinutes || 15), 0) / users.length || 0;
        res.json({
            dailyLogins: loginData,
            averageSessionMinutes: Math.round(avgSessionMinutes),
            totalLogins: users.reduce((sum, u) => sum + (u.stats?.totalLoginDays || 0), 0),
        });
    }
    catch (error) {
        console.error('Error fetching login stats:', error);
        res.status(500).json({ error: 'Failed to fetch login stats' });
    }
});
// Get quiz attempt statistics (teachers only)
router.get('/quiz-attempts', auth_1.authenticateToken, (0, auth_1.requireRole)('teacher'), async (req, res) => {
    try {
        const submissionsSnapshot = await firebase_1.db.collection('submissions').get();
        const submissions = submissionsSnapshot.docs.map(doc => ({
            ...doc.data(),
            submittedAt: doc.data().submittedAt?.toDate(),
        }));
        // Group by date
        const dailyAttempts = new Map();
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            dailyAttempts.set(dateKey, 0);
        }
        submissions.forEach((sub) => {
            if (sub.submittedAt) {
                const dateKey = sub.submittedAt.toISOString().split('T')[0];
                if (dailyAttempts.has(dateKey)) {
                    dailyAttempts.set(dateKey, dailyAttempts.get(dateKey) + 1);
                }
            }
        });
        const attemptData = Array.from(dailyAttempts.entries()).map(([date, count]) => ({
            date,
            attempts: count,
        }));
        res.json(attemptData);
    }
    catch (error) {
        console.error('Error fetching quiz attempts:', error);
        res.status(500).json({ error: 'Failed to fetch quiz attempts' });
    }
});
exports.default = router;
//# sourceMappingURL=analytics.js.map