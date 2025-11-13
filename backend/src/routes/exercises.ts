import express from 'express';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { db } from '../config/firebase';
import { FieldValue } from 'firebase-admin/firestore';

const router = express.Router();

// Get all exercises
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { role } = req.user!;
    const { category, difficulty, status = 'all' } = req.query;

    // Fetch all exercises first without orderBy to avoid index requirement
    let query: any = db.collection('exercises');
    
    // Only apply ONE where clause to avoid composite index requirement
    // We'll filter the rest in memory
    if (role === 'student') {
      query = query.where('published', '==', true);
    }

    const snapshot = await query.get();

    let exercises = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      dueDate: doc.data().dueDate?.toDate(),
    }));

    // Filter in memory for category
    if (category && category !== 'all') {
      exercises = exercises.filter((ex: any) => ex.category === category);
    }
    
    // Filter in memory for difficulty
    if (difficulty && difficulty !== 'all') {
      exercises = exercises.filter((ex: any) => ex.difficulty === difficulty);
    }

    // Filter in memory for status (teachers only)
    if (role === 'teacher' && status !== 'all') {
      exercises = exercises.filter((ex: any) => 
        ex.published === (status === 'published')
      );
    }

    // Sort in memory by createdAt descending
    exercises.sort((a: any, b: any) => {
      const aTime = a.createdAt?.getTime() || 0;
      const bTime = b.createdAt?.getTime() || 0;
      return bTime - aTime;
    });

    res.json(exercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});

// Get student's own submissions (MUST be before /:id route)
router.get('/my/submissions', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { uid } = req.user!;

    const snapshot = await db.collection('submissions')
      .where('studentId', '==', uid)
      .get();

    let submissions = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: doc.data().submittedAt?.toDate(),
      gradedAt: doc.data().gradedAt?.toDate(),
    }));

    // Sort by submission date
    submissions.sort((a: any, b: any) => 
      b.submittedAt.getTime() - a.submittedAt.getTime()
    );

    res.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Get categories (MUST be before /:id route)
router.get('/meta/categories', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const snapshot = await db.collection('exercises')
      .where('published', '==', true)
      .get();

    const categories = new Set<string>();
    snapshot.docs.forEach((doc: any) => {
      const category = doc.data().category;
      if (category) categories.add(category);
    });

    res.json(Array.from(categories).sort());
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get a specific exercise
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { uid, role } = req.user!;

    const doc = await db.collection('exercises').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    const exerciseData = doc.data()!;
    
    // Students can only access published exercises
    if (role === 'student' && !exerciseData.published) {
      return res.status(403).json({ error: 'Exercise not published' });
    }

    // For students, check if they've already submitted
    let submission = null;
    if (role === 'student') {
      const submissionDoc = await db.collection('submissions')
        .where('exerciseId', '==', id)
        .where('studentId', '==', uid)
        .limit(1)
        .get();
      
      if (!submissionDoc.empty) {
        const subData = submissionDoc.docs[0].data();
        submission = {
          id: submissionDoc.docs[0].id,
          ...subData,
          submittedAt: subData.submittedAt?.toDate(),
        };
      }
    }

    res.json({
      id: doc.id,
      ...exerciseData,
      createdAt: exerciseData.createdAt?.toDate(),
      updatedAt: exerciseData.updatedAt?.toDate(),
      dueDate: exerciseData.dueDate?.toDate(),
      submission,
    });
  } catch (error) {
    console.error('Error fetching exercise:', error);
    res.status(500).json({ error: 'Failed to fetch exercise' });
  }
});

// Create new exercise (teachers only)
router.post('/', authenticateToken, requireRole('teacher'), async (req: AuthenticatedRequest, res) => {
  try {
    const { uid } = req.user!;
    const { title, description, category, difficulty, timeLimit, dueDate, questions } = req.body;

    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({ error: 'Title and questions are required' });
    }

    // Get user profile
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();

    // Calculate total points
    const totalPoints = questions.reduce((sum: number, q: any) => sum + (q.points || 1), 0);

    const exerciseData = {
      title,
      description: description || '',
      category: category || 'General',
      difficulty: difficulty || 'medium',
      timeLimit: timeLimit || null, // in minutes
      dueDate: dueDate ? new Date(dueDate) : null,
      questions,
      totalPoints,
      createdBy: uid,
      createdByName: userData?.displayName || 'Unknown',
      createdAt: new Date(),
      updatedAt: new Date(),
      published: false,
      totalAttempts: 0,
      averageScore: 0,
    };

    const docRef = await db.collection('exercises').add(exerciseData);

    res.status(201).json({
      id: docRef.id,
      message: 'Exercise created successfully',
    });
  } catch (error) {
    console.error('Error creating exercise:', error);
    res.status(500).json({ error: 'Failed to create exercise' });
  }
});

// Update exercise (teachers only, own exercises)
router.put('/:id', authenticateToken, requireRole('teacher'), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user!;
    const { title, description, category, difficulty, timeLimit, dueDate, questions } = req.body;

    const doc = await db.collection('exercises').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    const exerciseData = doc.data()!;
    
    if (exerciseData.createdBy !== uid) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category) updateData.category = category;
    if (difficulty) updateData.difficulty = difficulty;
    if (timeLimit !== undefined) updateData.timeLimit = timeLimit;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    
    if (questions) {
      updateData.questions = questions;
      updateData.totalPoints = questions.reduce((sum: number, q: any) => sum + (q.points || 1), 0);
    }

    await db.collection('exercises').doc(id).update(updateData);

    res.json({ message: 'Exercise updated successfully' });
  } catch (error) {
    console.error('Error updating exercise:', error);
    res.status(500).json({ error: 'Failed to update exercise' });
  }
});

// Delete exercise (teachers only, own exercises)
router.delete('/:id', authenticateToken, requireRole('teacher'), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user!;

    const doc = await db.collection('exercises').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    const exerciseData = doc.data()!;
    
    if (exerciseData.createdBy !== uid) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete all submissions for this exercise
    const submissionsSnapshot = await db.collection('submissions')
      .where('exerciseId', '==', id)
      .get();
    
    const batch = db.batch();
    submissionsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    await db.collection('exercises').doc(id).delete();

    res.json({ message: 'Exercise deleted successfully' });
  } catch (error) {
    console.error('Error deleting exercise:', error);
    res.status(500).json({ error: 'Failed to delete exercise' });
  }
});

// Publish/Unpublish exercise (teachers only)
router.patch('/:id/publish', authenticateToken, requireRole('teacher'), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user!;
    const { published } = req.body;

    const doc = await db.collection('exercises').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    const exerciseData = doc.data()!;
    
    if (exerciseData.createdBy !== uid) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await db.collection('exercises').doc(id).update({
      published: Boolean(published),
      updatedAt: new Date(),
    });

    res.json({ 
      message: `Exercise ${published ? 'published' : 'unpublished'} successfully` 
    });
  } catch (error) {
    console.error('Error updating exercise status:', error);
    res.status(500).json({ error: 'Failed to update exercise status' });
  }
});

// Submit exercise (students only)
router.post('/:id/submit', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { uid, role } = req.user!;
    const { answers, timeSpent } = req.body;

    if (role !== 'student') {
      return res.status(403).json({ error: 'Only students can submit exercises' });
    }

    // Check if exercise exists
    const exerciseDoc = await db.collection('exercises').doc(id).get();
    if (!exerciseDoc.exists) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    const exerciseData = exerciseDoc.data()!;
    
    if (!exerciseData.published) {
      return res.status(403).json({ error: 'Exercise not published' });
    }

    // Check if already submitted
    const existingSubmission = await db.collection('submissions')
      .where('exerciseId', '==', id)
      .where('studentId', '==', uid)
      .limit(1)
      .get();

    if (!existingSubmission.empty) {
      return res.status(400).json({ error: 'Exercise already submitted' });
    }

    // Get user profile
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();

    // Grade the submission
    let score = 0;
    const gradedAnswers = exerciseData.questions.map((question: any, index: number) => {
      const studentAnswer = answers[index];
      let isCorrect = false;
      let earnedPoints = 0;

      if (question.type === 'mcq' || question.type === 'true-false') {
        isCorrect = studentAnswer === question.correctAnswer;
        earnedPoints = isCorrect ? question.points : 0;
      } else if (question.type === 'multiple-select') {
        const correctSet = new Set(question.correctAnswers || []);
        const studentSet = new Set(studentAnswer || []);
        isCorrect = correctSet.size === studentSet.size && 
                    [...correctSet].every(ans => studentSet.has(ans));
        earnedPoints = isCorrect ? question.points : 0;
      } else if (question.type === 'short-answer') {
        // For short answer, teacher needs to grade manually
        isCorrect = false;
        earnedPoints = 0;
      }

      score += earnedPoints;

      return {
        questionId: index,
        studentAnswer,
        isCorrect,
        earnedPoints,
        needsManualGrading: question.type === 'short-answer',
      };
    });

    const percentage = (score / exerciseData.totalPoints) * 100;

    const submissionData = {
      exerciseId: id,
      exerciseTitle: exerciseData.title,
      studentId: uid,
      studentName: userData?.displayName || 'Unknown',
      answers: gradedAnswers,
      score,
      totalPoints: exerciseData.totalPoints,
      percentage,
      timeSpent: timeSpent || 0,
      submittedAt: new Date(),
      needsGrading: gradedAnswers.some((a: any) => a.needsManualGrading),
      gradedBy: null,
      gradedAt: null,
    };

    const submissionRef = await db.collection('submissions').add(submissionData);

    // Update exercise statistics
    await db.collection('exercises').doc(id).update({
      totalAttempts: FieldValue.increment(1),
      averageScore: exerciseData.totalAttempts === 0 
        ? percentage 
        : ((exerciseData.averageScore * exerciseData.totalAttempts) + percentage) / (exerciseData.totalAttempts + 1),
    });

    res.status(201).json({
      id: submissionRef.id,
      score,
      totalPoints: exerciseData.totalPoints,
      percentage,
      message: 'Exercise submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting exercise:', error);
    res.status(500).json({ error: 'Failed to submit exercise' });
  }
});

// Get submissions for an exercise (teachers only)
router.get('/:id/submissions', authenticateToken, requireRole('teacher'), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const snapshot = await db.collection('submissions')
      .where('exerciseId', '==', id)
      .get();

    let submissions = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: doc.data().submittedAt?.toDate(),
      gradedAt: doc.data().gradedAt?.toDate(),
    }));

    // Sort by submission date
    submissions.sort((a: any, b: any) => 
      b.submittedAt.getTime() - a.submittedAt.getTime()
    );

    res.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

export default router;

