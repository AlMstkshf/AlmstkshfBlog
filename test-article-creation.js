import fetch from 'node-fetch';

async function testArticleCreation() {
  try {
    // First login
    console.log('Logging in...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'password'
      })
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.text();
      console.error('Login failed:', error);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('Login successful:', loginData.message);
    
    const accessToken = loginData.data.accessToken;

    // Test fetching categories
    console.log('\nFetching categories...');
    const categoriesResponse = await fetch('http://localhost:5000/api/categories', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (categoriesResponse.ok) {
      const categories = await categoriesResponse.json();
      console.log('Categories found:', categories.length);
      
      if (categories.length > 0) {
        // Test creating an article
        console.log('\nCreating test article...');
        const articleData = {
          titleEn: 'Test Article from API',
          titleAr: 'مقال تجريبي من الواجهة البرمجية',
          contentEn: '<h1>Test Content</h1><p>This is a test article created via API.</p>',
          contentAr: '<h1>محتوى تجريبي</h1><p>هذا مقال تجريبي تم إنشاؤه عبر الواجهة البرمجية.</p>',
          excerptEn: 'A test article for API testing',
          excerptAr: 'مقال تجريبي لاختبار الواجهة البرمجية',
          categoryId: categories[0].id,
          authorName: 'Admin',
          slug: 'test-article-api',
          published: false,
          featured: false
        };

        const createResponse = await fetch('http://localhost:5000/api/articles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(articleData)
        });

        if (createResponse.ok) {
          const newArticle = await createResponse.json();
          console.log('Article created successfully:', newArticle.data.titleEn);
          console.log('Article ID:', newArticle.data.id);
        } else {
          const error = await createResponse.text();
          console.error('Article creation failed:', error);
        }
      }
    } else {
      console.error('Failed to fetch categories');
    }

    // Test fetching articles
    console.log('\nFetching articles...');
    const articlesResponse = await fetch('http://localhost:5000/api/articles?limit=5');
    
    if (articlesResponse.ok) {
      const articlesData = await articlesResponse.json();
      console.log('Articles found:', articlesData.data ? articlesData.data.length : articlesData.length);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testArticleCreation();