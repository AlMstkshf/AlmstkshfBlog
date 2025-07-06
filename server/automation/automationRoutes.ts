import { Router } from 'express';
import { contentScheduler } from './contentScheduler';
import { analyticsTracker } from './analyticsTracker';
import { emailAutomation } from './emailAutomation';
import { newsAggregatorV2 } from './newsAggregatorV2';
import { storage } from '../storage';

export const automationRouter = Router();

// Content Scheduling Routes - Disabled
automationRouter.post('/schedule', async (req, res) => {
  res.status(503).json({ 
    success: false, 
    error: 'AI content scheduling disabled - use manual publishing' 
  });
});

automationRouter.get('/scheduled', (req, res) => {
  const scheduledPosts = contentScheduler.getScheduledPosts();
  res.json(scheduledPosts);
});

automationRouter.put('/scheduled/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const success = contentScheduler.updateScheduledPost(id, updates);
  res.json({ success });
});

automationRouter.delete('/scheduled/:id', (req, res) => {
  const { id } = req.params;
  const success = contentScheduler.cancelScheduledPost(id);
  res.json({ success });
});

// Analytics Routes
automationRouter.post('/analytics/track', (req, res) => {
  try {
    const behavior = {
      ...req.body,
      timestamp: new Date()
    };
    analyticsTracker.trackBehavior(behavior);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to track behavior' });
  }
});

automationRouter.get('/analytics/performance/:articleId?', (req, res) => {
  const { articleId } = req.params;
  const performance = analyticsTracker.getContentPerformance(
    articleId ? parseInt(articleId) : undefined
  );
  res.json(performance);
});

automationRouter.get('/analytics/trending', (req, res) => {
  const { limit = 10 } = req.query;
  const trending = analyticsTracker.getTrendingContent(Number(limit));
  res.json(trending);
});

automationRouter.get('/analytics/recommendations/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { currentArticleId } = req.query;
    
    const recommendations = await analyticsTracker.generatePersonalizedRecommendations(
      sessionId,
      currentArticleId ? parseInt(currentArticleId as string) : undefined
    );
    
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

automationRouter.get('/analytics/insights/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const insights = analyticsTracker.getUserInsights(sessionId);
  res.json(insights);
});

// Email Automation Routes
automationRouter.post('/email/welcome', async (req, res) => {
  try {
    const { email, name, language = 'en' } = req.body;
    const jobId = await emailAutomation.sendWelcomeEmail(email, name, language);
    res.json({ success: true, jobId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send welcome email' });
  }
});

automationRouter.post('/email/weekly-digest', async (req, res) => {
  try {
    await emailAutomation.scheduleWeeklyDigest();
    res.json({ success: true, message: 'Weekly digest scheduled' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to schedule weekly digest' });
  }
});

automationRouter.post('/email/article-notification/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;
    await emailAutomation.scheduleArticleNotification(parseInt(articleId));
    res.json({ success: true, message: 'Article notification scheduled' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to schedule article notification' });
  }
});

automationRouter.get('/email/queue', (req, res) => {
  const queue = emailAutomation.getEmailQueue();
  res.json(queue);
});

automationRouter.get('/email/templates', (req, res) => {
  const templates = emailAutomation.getTemplates();
  res.json(templates);
});

automationRouter.put('/email/templates/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const success = emailAutomation.updateTemplate(id, updates);
  res.json({ success });
});

// Settings Routes
automationRouter.put('/settings/seo', (req, res) => {
  const { enabled } = req.body;
  // Store SEO setting in memory or database
  // For now, just return success
  res.json({ success: true, enabled });
});

automationRouter.put('/settings/publishing', (req, res) => {
  const { enabled } = req.body;
  // Store publishing setting in memory or database
  // For now, just return success
  res.json({ success: true, enabled });
});

automationRouter.put('/settings/welcome-emails', (req, res) => {
  const { enabled } = req.body;
  res.json({ success: true, enabled });
});

automationRouter.put('/settings/weekly-digest', (req, res) => {
  const { enabled } = req.body;
  res.json({ success: true, enabled });
});

automationRouter.put('/settings/behavior-tracking', (req, res) => {
  const { enabled } = req.body;
  res.json({ success: true, enabled });
});

automationRouter.put('/settings/recommendations', (req, res) => {
  const { enabled } = req.body;
  res.json({ success: true, enabled });
});

// News Aggregation Routes
automationRouter.post('/news/generate', async (req, res) => {
  res.status(503).json({ 
    success: false, 
    message: 'AI automation disabled - manual content management only',
    error: 'Service unavailable'
  });
});

automationRouter.get('/status', async (req, res) => {
  try {
    const articles = await storage.getArticles({ limit: 1000 });
    const status = {
      newsAggregator: 'disabled',
      emailSystem: 'disabled',
      contentScheduler: 'disabled',
      lastRun: 'N/A - AI automation disabled',
      nextRun: 'N/A - manual content management only',
      articlesGenerated: articles.length,
    };
    res.json(status);
  } catch (error) {
    console.error('Error fetching automation status:', error);
    res.status(500).json({ error: 'Failed to fetch automation status' });
  }
});

// Updated Settings Routes with Database Persistence
automationRouter.get('/settings', async (req, res) => {
  try {
    const settings = {
      weeklyArticles: await storage.getAutomationSetting('weeklyArticles'),
      emailDigests: await storage.getAutomationSetting('emailDigests'),
      contentOptimization: await storage.getAutomationSetting('contentOptimization'),
      socialSharing: await storage.getAutomationSetting('socialSharing'),
      analyticsReports: await storage.getAutomationSetting('analyticsReports'),
    };
    res.json(settings);
  } catch (error) {
    console.error('Error fetching automation settings:', error);
    res.status(500).json({ error: 'Failed to fetch automation settings' });
  }
});

automationRouter.post('/settings/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    await storage.setAutomationSetting(key, value);
    res.json({ success: true, key, value });
  } catch (error) {
    console.error('Error updating automation setting:', error);
    res.status(500).json({ error: 'Failed to update automation setting' });
  }
});